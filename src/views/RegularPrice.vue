<template>
  <div style="margin-top: -1rem;">
    <div class="ui fluid card">
      <div class="content">
        <i class="right floated">{{merchandiseCom.orderId}}</i>
        <div class="meta right floated">订单号:</div>
        <div class="header">{{merchandiseCom.serviceCategoryName}}</div>
        <div class="ui divider"></div>
        <div class="description">
          <div class="ui fluid accordion">
            <div v-for="(param, index) in businessParams" :key="index">
              <div class="title" :key="index+1">
                <i class="dropdown icon"></i>
                {{param.paramName}}
                <i class="tasks icon right floated" :class="{'modified': param.isModify}"></i>
              </div>
              <div class="content">
                <div style="margin-left: 1rem;">
                  <pcontrol :is="getCtlByParamType(param.realParam.metaParameterTypeId)" @modifyUnit="modifyUnit" :attributes="param.attrs" :index="index" :params="param"></pcontrol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="extra content">
        <div>
          <button :class="{'disabled': readonly}" class="ui mini primary button" @click="saveRegularUnits(MobileOperateType.submitBuAudit)">提交商务审核</button>
          <button :class="{'disabled': readonly}" class="mini ui primary floated button" @click="saveRegularUnits(MobileOperateType.save)">保存</button>
          <router-link :to="{ name: MobileRouterName.order, params: {order: order}, query: {orderId: orderCom.id} }"><button class="mini ui right floated button"><i class="angle left icon"></i>返回订单</button></router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import scClient from '../sc_client.js'
import scCtl from '../sc_ctl_reg.js'
import scMeta from '../sc_meta.js'
import {mapState, mapGetters} from 'vuex'
import global from '../sc_global.js'
export default {
  created () {
    this.DataType = global.DataType
    this.MobileOperateType = scClient.MobileOperateType
    this.MobileRouterName = scClient.MobileRouterName
    this.getCtlByParamType = scCtl.getCtlByParamType
    if (this.merchandise) {
      this.getExperimentParameter()
    }
  },
  mounted () {
    window.$('.ui.accordion').accordion()
  },
  data () {
    return {
      businessParams: [], // 参数
      merchandiseFormalPrice: {},
      merchandise: this.$route.params.merchandise,
      order: this.$route.params.order,
      DataType: {},
      random: null,
      unitModify: true, // 检测是否修改参数的标志
      exceedMaxTextLength: false // 检测输入的文本长度
    }
  },
  components: {
  },
  watch: {
    '$route.params': function (val) {
      if (this.$route.name !== scClient.MobileRouterName.regularPrice) return
      if (val.order) {
        this.order = val.order
      }
      if (val.merchandise) {
        this.merchandise = val.merchandise
        this.getExperimentParameter()
      }
    }
  },
  computed: {
    ...mapGetters(['quoteUnits', 'dictionaries', 'metaParameters', 'getCustomerNameFromServiceOrders', 'getExperiments', 'getTextBasedParamList']),
    ...mapState(['SCMetaData']),
    readonly () {
      return scClient.readonlyHandler(this.merchandiseCom.status, this.orderCom.sfQuoteId)
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
    getExperimentParameter () { // type: 3 不返回审核历史
      scClient.setStorage('merchandiseStatus', this.merchandise.status)
      scClient.setStorage('sfQuoteIdOfOrder', this.order ? this.order.sfQuoteId : 'none')
      scClient.callRemoteMethodForBuParam({type: 3, serviceMerchandiseGuid: this.merchandise.serviceMerchandiseGUID, version: this.merchandise.version}, res => {
        this.businessParams = res.businessParams
        this.merchandiseFormalPrice = res.merchandiseFormalPrice
      })
    },
    modifyUnit (isModify) {
      this.unitModify = !isModify
      this.random = Math.random()
      return isModify ? 'modified' : ''
    },
    saveRegularUnits (operationType) {
      let params = JSON.stringify(this.getParams(operationType, false))
      if (operationType === scClient.MobileOperateType.save) {
        window.$.dimmerShow('保存中')
        scClient.callRemoteMethod('saveServiceMerchandiseBusinessParams', params, false, (response) => {
          window.$.dimmerHide()
          if (response.status === global.ParamMsgType.Error || response.status === global.ParamMsgType.Empty) {
            this.errorHandler(response)
          } else {
            let order = scClient.orderUpdate(response.bServiceMerchandise, this.order)
            this.$router.push({name: scClient.MobileRouterName.order, query: {order: order.id}, params: {order: order}})
          }
        })
      } else if (operationType === scClient.MobileOperateType.submitBuAudit) {
        let _this = this
        let ok = function ok () {
          _this.submitBuAuditConfirm(params)
        }
        let cancel = function cancel () {}
        window.$.confirm(' 提交商务审核', '提交后，信息将不能更改，确定提交?', ok, cancel)
      }
    },
    submitBuAuditConfirm (params) {
      let customerName = this.getCustomerNameFromServiceOrders(this.merchandise.orderId)
      let categoryName = this.merchandise.serviceCategoryName
      let router = this.$router
      let order = this.order
      let _this = this
      window.$.dimmerShow('提交中')
      scClient.callRemoteMethod('saveServiceMerchandiseBusinessParams', params, false, (response) => {
        if (response.status === global.ParamMsgType.Error) {
          window.$.dimmerHide()
          _this.errorHandler(response)
        } else if (response.status === global.ParamMsgType.Empty) {
          window.$.dimmerHide()
          _this.emptyHandler(response)
        } else {
          window.$.dimmerHide()
          window.$.msg(customerName + '客户的' + categoryName + '已提交商务审核')
          router.push({name: scClient.MobileRouterName.order, query: {order: order.id}, params: {order: scClient.orderUpdate(response.bServiceMerchandise, order)}})
        }
      })
    },
    getParams (operationType, prompted) {
      return {
        serviceMerchandiseGUID: this.merchandise.serviceMerchandiseGUID,
        prompted: prompted, // 默认false:没有提示过、进行逻辑空提示  true:提示过、不进行逻辑空验证直接保存
        operationType: operationType,
        businessParams: this.buParamsHandler(this.businessParams),
        merchandiseFormalPrice: this.merchandiseFormalPrice,
        version: this.merchandise.version
      }
    },
    buParamsHandler (buParams) {
      let res = []
      buParams.forEach(bp => {
        let realParam = bp.realParam
        realParam.serviceMerchandiseGUID = this.merchandise.serviceMerchandiseGUID
        let attrs = bp.attrs
        attrs.forEach(attr => {
          // let realParamVal = realParam[attr.attrName]
          let type = attr.attrValue.meta.type
          let value = attr.attrValue.value
          if (type === scMeta.ParamAttrType.Group) { // 组依赖
            let arr = []
            this.groupParamHandler(attr, arr, realParam)
          } else if (type === scMeta.ParamAttrType.List || type === scMeta.ParamAttrType.GeneList ||
            type === scMeta.ParamAttrType.CellList || type === scMeta.ParamAttrType.VirusPlasmidList ||
            type === scMeta.ParamAttrType.CheckList || type === scMeta.ParamAttrType.AntibodyList) {
            let arr = []
            arr = this.listParamHandler(attr, arr)
            realParam[attr.attrName] = arr
          } else if (type === scMeta.ParamAttrType.Object) {
            realParam[attr.attrName] = this.objectParamHandler(attr.attrValue.attributes)
          } else if (type === scMeta.ParamAttrType.Date) {
            let dateAttrs = attr.attrValue.attributes
            dateAttrs.forEach(da => {
              realParam[da.attrName] = da.attrValue.value
            })
          } else {
            realParam[attr.attrName] = value
          }
        })
        res.push(realParam)
      })
      return res
    },
    groupParamHandler (attr, obj, realParam) {
      let gAttrs = attr.attrValue.attributes
      gAttrs.forEach(gAt => {
        let gArr = []
        let gType = gAt.attrValue.meta.type
        if (gType === scMeta.ParamAttrType.List || gType === scMeta.ParamAttrType.CellList ||
          gType === scMeta.ParamAttrType.GeneList || gType === scMeta.ParamAttrType.VirusPlasmidList ||
          gType === scMeta.ParamAttrType.SerialNoList || gType === scMeta.ParamAttrType.CheckList ||
          gType === scMeta.ParamAttrType.AntibodyList) {
          gArr = this.listParamHandler(gAt, gArr)
        } else if (gType === scMeta.ParamAttrType.Group) {
          // group的值无效，从attributes中获取
        } else {
          gArr = gAt.attrValue.value
        }
        if (gType !== scMeta.ParamAttrType.Group) {
          obj[gAt.attrName] = gArr
          if (realParam !== null) {
            realParam[gAt.attrName] = gArr
          }
        }
      })
      return obj
    },
    listParamHandler (attr, arr) {
      let value = attr.attrValue.value
      value.forEach(val => {
        if (val instanceof Array) {
          arr = this.listHandler(val, arr)
        } else {
          let obj = {}
          obj[attr.attrValue.attributes[0].attrName] = val
          arr.push(obj)
        }
      })
      return arr
    },
    listHandler (val, arr) {
      let obj = {}
      let attr = val.attrValue
      if (attr) {
        let attrs = attr.attributes
        if (attrs) {
          attrs.forEach(at => {
            let aType = at.attrValue.meta.type
            if (aType === scMeta.ParamAttrType.Group) {
              obj = this.groupParamHandler(at, obj, null)
            } else {
              obj[at.attrName] = at.attrValue.value
            }
          })
          arr.push(obj)
        }
      } else {
        val.forEach(aVal => {
          if (aVal.attrValue.meta.type !== scMeta.ParamAttrType.Group) {
            obj[aVal.attrName] = aVal.attrValue.value ? aVal.attrValue.value : aVal.attrValue.meta.value
          } else {
            if (aVal.attrValue.attributes) {
              let attr = aVal.attrValue.attributes[0]
              if (attr && attr.attrValue.meta.type === scMeta.ParamAttrType.SerialNoList) {
                let valArr = []
                attr.attrValue.value.forEach(aVal => {
                  valArr.push(aVal[0].attrValue.value)
                })
                obj[attr.attrName] = valArr
              } else {
                obj[attr.attrName] = attr.attrValue.value ? attr.attrValue.value : attr.attrValue.meta.value
              }
            }
          }
        })
        arr.push(obj)
      }
      return arr
    },
    objectParamHandler (val) {
      if (Object.keys(val).length === 0) return val // 空对象
      let obj = {}
      val.forEach(v => {
        obj[v.attrName] = v.attrValue.value
      })
      return obj
    },
    errorHandler (response) {
      let message = response.businessParamMessages
      let warn = ''
      message.forEach(msg => {
        let str = msg.title + ': ' + msg.messages
        warn = warn === '' ? '' + str : warn + '。' + str
      })
      window.$.msgError('以下信息有误: ' + warn)
    },
    emptyHandler (response) {
      let message = response.businessParamMessages
      let warn = ''
      message.forEach(msg => {
        let str = msg.title + ': ' + msg.messages
        warn = warn === '' ? '' + str : warn + '。' + str
      })
      let _this = this
      let ok = function cancel () {
        _this.submitBuAuditConfirm(JSON.stringify(_this.getParams(scClient.MobileOperateType.submitBuAudit, true)))
      }
      let cancel = function cancel () {}
      window.$.confirm('以下信息为空', warn + '。' + '请确认是否仍旧提交商务审核？', ok, cancel)
    }
  }
}
</script>

<style>
  .modified {
    color: #2185D0;
  }
</style>
