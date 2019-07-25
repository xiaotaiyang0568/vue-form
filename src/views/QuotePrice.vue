<template>
  <div>
    <div class="ui fluid card">
      <div class="content">
        <i class="right floated">{{merchandiseCom.orderId}}</i>
        <div class="meta right floated">订单号:</div>
        <div class="header">{{merchandiseCom.serviceCategoryName}}</div>
        <div class="meta">
          <merchandise-info :merchandise="merchandise" :quotePrice="true"></merchandise-info>
        </div>
        <div class="ui divider"></div>
        <div class="description">
          <div class="ui fluid accordion">
            <div v-for="experiment in metaExperimentQuoteUnit.experiments" :key="experiment.metaExperimentId">
              <div class="title">
                <i class="dropdown icon"></i>
                {{experiment.experimentName}}
                <i class="edit outline icon right floated" :class="modified(experiment.isModify)"></i>
              </div>
              <div class="content">
                <div style="margin-left: 1rem;">
                  <!--<h5 class="ui horizontal divider header" style="margin-top: 1rem;"> 参数信息 </h5>-->
                  <div class="ui middle aligned divided list">
                    <div class="item" v-for="unit in experiment.metaExperimentQuoteUnits" :key="unit.quoteUnitId">
                      <div class="right floated content" style="margin-top: 0.3rem; margin-bottom: 0.3rem">
                        <span v-if="unit===undefined || unit.length===0">无预报价单位</span>
                        <count-box v-else-if="unit!==undefined && unit.dataType===DataType.NonZeroInteger" :unit="unit" @modifyUnit="modifyUnit" :experiment="experiment" :readonly="readonly"></count-box>
                        <count-box v-else-if="unit!==undefined && unit.dataType===DataType.ZeroableInteger" :unit="unit" @modifyUnit="modifyUnit" :experiment="experiment" :readonly="readonly"></count-box>
                        <enum-box v-else-if="unit!==undefined && unit.dataType===DataType.Enum" :unit="unit" @modifyUnit="modifyUnit" :experiment="experiment" :readonly="readonly"></enum-box>
                      </div>
                      <div class="content" style="margin-top: 0.3rem; margin-bottom: 0.3rem">
                        {{unit.unitLabel}}
                      </div>
                    </div>
                  </div>
                  <div style="margin-top: -1rem;">
                    <span v-show="experiment.metaExperimentQuoteUnits.length===0">无预报价单位</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="extra content">
        <div>
          <button class="mini ui primary button" @click="calculateQuotePrice" :class="{'disabled': readonly}">计算价格</button>
          <!--<button class="mini ui primary button" @click="calculateQuotePrice">计算价格</button>-->
          <router-link :to="{ name: MobileRouterName.order, params: {order: order}, query: {orderId: orderCom.id} }"><button class="mini ui right floated button"><i class="angle left icon"></i>返回订单</button></router-link>
        </div>
      </div>
    </div>
    <div class="ui modal quote-result">
      <i class="close icon"></i>
      <div class="ui icon header">
        价格预测明细
      </div>
      <div class="content" style="height: 400px; overflow-x: auto;">
        <table class="ui quote-table">
          <thead>
          <tr>
            <th>实验名称</th>
            <th>实验价格(元)</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in quoteResult" :key="item.metaExperimentID">
            <td>{{item.experimentName}}</td>
            <td>{{item.pricePerExperiment | priceFormat}}</td>
          </tr>
          </tbody>
          <tfoot>
          <tr><th colspan="3" style="text-align: right;">
            <span style="color: red">合计：{{merchandise.ballparkPrice | priceFormat}}</span> <span>{{remindPrice | remindFormat}}</span>
          </th>
          </tr></tfoot>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
import scClient from '../sc_client.js'
import {mapState, mapGetters} from 'vuex'
import global from '../sc_global.js'
import merchandiseInfo from '../components/MerchandiseInfo.vue'
import countBox from '../components/editBox/CountBox.vue'
import enumBox from '../components/editBox/EnumBox.vue'
import {metaExperimentQuoteUnit} from '../data.js'
export default {
  created () {
  },
  mounted () {
    window.$('.ui.accordion').accordion()
    this.getExperimentQuoteUnit()
  },
  data () {
    return {
      metaExperimentQuoteUnit: [],
      order: this.$route.params.order,
      merchandise: this.$route.params.merchandise,
      DataType: global.DataType,
      MobileRouterName: scClient.MobileRouterName,
      unitModify: true, // 检测是否修改参数的标志
      quoteResult: [] // 报价明细
    }
  },
  watch: {
    '$route.params': function (val) {
      if (this.$route.name !== scClient.MobileRouterName.quotePrice) return
      if (val.order) {
        this.order = val.order
      }
      if (val.merchandise) {
        this.merchandise = val.merchandise
        this.getExperimentQuoteUnit()
      }
    }
  },
  components: {
    merchandiseInfo,
    countBox,
    enumBox
  },
  computed: {
    ...mapGetters(['quoteUnits', 'dictionaries']),
    ...mapState(['SCMetaData']),
    remindPrice () {
      let priceReminder = this.SCMetaData.serviceCategories.find(c => c.serviceCategoryId === this.merchandise.serviceCategoryId).priceReminder
      let dicMap = {}
      this.dictionaries.forEach(dic => {
        if (dic.typeID === global.DictionaryTypeID.PriceReminder) {
          dicMap[dic.dictKey] = dic
        }
      })
      return dicMap[priceReminder].dictValue
    },
    readonly () {
      return scClient.readonlyHandler(this.merchandiseCom.status, this.order.sfQuoteId)
    },
    merchandiseCom () {
      if (this.merchandise) {
        return this.merchandise
      }
      return {}
    },
    orderCom () {
      if (this.order) {
        return this.order
      }
      return {}
    }
  },
  methods: {
    modifyUnit (isModify) {
      this.unitModify = !isModify
    },
    modified (val) {
      return val ? 'modified' : ''
    },
    getExperimentQuoteUnit () {
      this.metaExperimentQuoteUnit = this.experimentQuoteUnitHandler(metaExperimentQuoteUnit)
      /**
      let params = {serviceMerchandiseGUID: this.merchandise.serviceMerchandiseGUID, version: this.merchandise.version}
      scClient.callRemoteMethod('retrieveMetaExperimentQuoteUnit', params, true, response => {
        if (response) {
          this.metaExperimentQuoteUnit = this.experimentQuoteUnitHandler(response)
        }
      })
       */
    },
    getExpFromMetaExp (dt) {
      let experimentMetaData = this.SCMetaData.metaExperimentsMap
      dt.experimentName = experimentMetaData[dt.metaExperimentId].experimentName
      dt.sortOrder = experimentMetaData[dt.metaExperimentId].sortOrder
      return dt
    },
    experimentQuoteUnitHandler (response) {
      let eData = response.experiments
      if (!eData) return {}
      eData.forEach(dt => {
        // 根据metaExperimentId从元数据中找出对应的experimentName
        dt = this.getExpFromMetaExp(dt)
        dt.isModify = false
        // 找出预报价单位元数据
        dt.metaExperimentQuoteUnits = this.findQuoteUnitsById(dt.metaExperimentQuoteUnits, this.quoteUnits, this.dictionaries, false)
      })
      return response
    },
    findQuoteUnitsById (unitList, unitMetaData, dictionaries, isDesktop) {
      let returnList = []
      unitList.forEach(col => {
        for (let key = 0; key < unitMetaData.length; key++) {
          let un = unitMetaData[key]
          if (col.quoteUnitId === un.quoteUnitId) {
            col.unitLabel = un.unitLabel
            col.dataType = un.dataType
            col.sortCode = un.sortCode
            let extra = un.extraInfo
            let extraInfo = []
            if (col.dataType === global.DataType.Enum) {
              for (let i = 0; i < dictionaries.length; i++) { // 根据extraInfo去字典中找出枚举值
                let dic = dictionaries[i]
                if (parseInt(extra) === dic.typeID) {
                  let obj = {}
                  obj.value = dic.dictKey
                  obj.label = dic.dictValue
                  if (isDesktop && parseInt(col.realValue) === obj.value) { // 由于枚举型realValue默认是字典中的key，因此需要转换成（value）label，在界面中显示
                    col.realValue = obj.label
                  }
                  extraInfo.push(obj)
                }
              }
              col.extraInfo = extraInfo
            }
            returnList.push(col)
            break
          }
        }
      })
      return returnList.sort((x, y) => x.sortCode - y.sortCode)
    },
    calculateQuotePrice () {
      let metaExp = this.metaExperimentQuoteUnit
      let exp = metaExp.experiments
      let experiment = []
      exp.forEach(dt => {
        let units = []
        dt.metaExperimentQuoteUnits.forEach(un => {
          let obj = {}
          if (un !== null) {
            obj.quoteUnitId = un.quoteUnitId
            if (un.dataType === global.DataType.Enum) {
              obj.realValue = un.realValue
            } else {
              obj.realValue = un.realValue
            }
            units.push(obj)
          }
        })
        let eObj = {}
        eObj.metaExperimentId = dt.metaExperimentId
        eObj.metaExperimentQuoteUnits = [].concat(units)
        eObj.serviceExperimentId = dt.serviceExperimentId
        experiment.push(eObj)
      })
      let params = {serviceMerchandiseGUID: metaExp.serviceMerchandiseGUID, experiments: experiment, version: this.merchandise.version}
      window.$.dimmerShow('计算中')
      scClient.callRemoteMethod('saveMetaExperimentQuote', params, true, response => {
        if (response) {
          let resMetaExpQU = response.bServiceMerchandise
          this.merchandise = resMetaExpQU
          this.order = scClient.orderUpdate(resMetaExpQU, this.order)
          let quoteResult = []
          response.quoteInfoPerExperimentList.forEach(data => {
            quoteResult.push(this.getExpFromMetaExp(data))
          })
          this.quoteResult = global.sortBySortOrder(quoteResult)
          this.unitModify = true
          window.$.dimmerHide()
          window.$('.ui.modal.quote-result').modal('show') // 展示明细
        }
      })
    }
  },
  filters: {
    priceFormat (val) {
      if (val === -1) return '不支持预报价'
      return parseInt(val)
    },
    remindFormat (val) {
      if (val && val !== '') {
        return '(' + val + ')'
      }
      return ' '
    }
  }
}
</script>

<style>
  .modified {
    color: #2185D0;
  }

  .quote-table {
    width: 100%;
    background: #FFFFFF;
    margin: 1em 0em;
    border: 1px solid rgba(34, 36, 38, 0.15);
    -webkit-box-shadow: none;
    box-shadow: none;
    border-radius: 0.28571429rem;
    text-align: left;
    color: rgba(0, 0, 0, 0.87);
    border-collapse: separate;
    border-spacing: 0px;
  }
</style>
