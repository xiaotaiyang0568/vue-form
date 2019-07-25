<template>
  <div>
    <div class="ui fluid card">
      <div class="content">
        <i class="right floated">{{orderComputed.id}}</i>
        <div class="meta right floated">订单号:</div>
        <div class="header">{{orderComputed.customerEnterpriseName}}</div>
        <div class="meta">
          {{orderComputed.customerName}}， {{orderComputed.regionFatherName}}， 业务员: {{orderComputed.employeeName}}
        </div>
        <div class="ui divider"></div>
        <div class="description">
          <div class="ui fluid accordion">
            <div v-for="mer in orderComputed.merchandiseList" :key="mer.serviceMerchandiseGUID">
              <div class="title" @click="clickMerchandise(mer)">
                <i class="dropdown icon"></i>
                {{mer.serviceCategoryName}}
                <i class="meta right floated" style="font-size: 12px;color: #2185D0;"><i class="check icon" v-if="mer.status===5"></i>{{mer.statusNameOfM}}</i>
              </div>
              <div class="content">
                <div style="margin-left: 1rem;">
                  <div style="text-align: center;">
                    <router-link :class="{'hiden-btn': hidenUnCopyBtn}" :to="{name: MobileRouterName.quotePrice, query: {merchandiseId: mer.serviceMerchandiseGUID}, params: {merchandise: mer, order: order}}" class="mini ui primary button margin-bottom">价格预测 </router-link>
                    <router-link :class="{'hiden-btn': hidenUnCopyBtn}" :to="{name: MobileRouterName.regularPrice, query: {merchandiseId: mer.serviceMerchandiseGUID}, params: {merchandise: mer, order: order}}" class="mini ui primary button margin-bottom">正式报价 </router-link>
                    <router-link :class="{'hiden-btn': hidenUnCopyBtn, 'disabled': couldChangeMer}" :to="{name: MobileRouterName.selectExperiments, query: {merchandiseId: mer.serviceMerchandiseGUID}, params: {merchandise: mer, order: order, experimentList: experimentList, experimentIDs: experimentIDs, isCreate: false} }" class="mini ui primary button margin-bottom">修改商品</router-link>
                    <button :class="{'hiden-btn': hidenCopyBtn}"  class="mini ui primary button margin-bottom" @click="clickCopyMerchandise(mer)" style="background-color: #00B5AD;">复制商品</button>
                    <router-link :class="{'hiden-btn': hidenUnCopyBtn}"  :to="{name: MobileRouterName.auditHistory, query: {merchandiseId: mer.serviceMerchandiseGUID}, params: {merchandise: mer, order: order}}" class="mini ui primary button margin-bottom">审核历史</router-link>
                  </div>

                  <div class="ui divider"></div>

                  <div class="meta">
                    <merchandise-info :merchandise="mer"></merchandise-info>
                  </div>
                  <h5 class="ui horizontal divider header" style="margin-top: 1rem;"> 实验信息 </h5>
                  <div class="ui middle aligned divided list">
                    <div class="item" v-for="exp in experimentList" :key="exp.metaExperimentId">
                      <div class="right floated content" style="margin-top: 0.3rem; margin-bottom: 0.3rem">
                        <div class="ui fitted checked checkbox">
                          <input disabled checked type="checkbox">
                          <label></label>
                        </div>
                      </div>
                      <div class="content" style="margin-top: 0.3rem; margin-bottom: 0.3rem">
                        <i class="eye dropper icon"></i>
                        {{exp.experimentName}}
                      </div>
                    </div>
                  </div>
                  <div class="ui divider"></div>
                </div>
              </div>
            </div>

            <router-link v-if="couldAddOrCopyMer" :to="{ name: MobileRouterName.selectCategories, query: {orderId: orderComputed.id}, params: {order: orderComputed}}" class="title">
              <i class="meta plus icon"></i>
              <i class="meta">增加商品</i>
            </router-link>

          </div>
        </div>
      </div>
      <div class="extra content">
        <div>
          <button v-if="couldAddOrCopyMer" :class="{'hiden-btn': hidenUnCopyBtn}" class="mini ui primary left floated button" @click="selectCopyMerchandise" style="background-color: #00B5AD;"><i class="copy icon"></i>复制历史商品到此订单</button>
          <router-link v-if="salesforceRequestProcessed" :to="{ path: '/orders#id'+orderComputed.id, query: {isSF: salesforceRequestProcessed} }"><button class="mini ui right floated button"><i class="angle left icon"></i>返回</button></router-link>
          <router-link v-else :to="{ path: '/orders#id'+orderComputed.id, query: {orderId: orderComputed.id, isSF: salesforceRequestProcessed}, params: {order: order} }"><button class="mini ui right floated button"><i class="angle left icon"></i>返回</button></router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import scClient from '../sc_client.js'
import global from '../sc_global.js'
import {mapGetters, mapMutations, mapState} from 'vuex'
import merchandiseInfo from '../components/MerchandiseInfo.vue'
import {experimentDesignV2} from '../data.js'
export default {
  name: 'Order',
  data () {
    return {
      order: {},
      experimentIDs: null,
      serviceCategoryId: null, // 点击商品数据时获取，用于取得商品的实验
      salesforceRequestProcessed: false,
      currentClickMerchandise: {}
    }
  },
  created () {
    this.initSCMetaData()
    this.MerchandiseStatus = global.MerchandiseStatus
    this.MobileRouterName = scClient.MobileRouterName
    this.initOrder()
  },
  mounted () {
    window.$('.ui.accordion').accordion()
  },
  watch: {
    '$route.params': function (route) {
      if (route.order) {
        this.order = route.order
      }
      if (route.metaExperimentIds) {
        this.experimentIDs = route.metaExperimentIds
      }
    }
  },
  components: {
    merchandiseInfo
  },
  computed: {
    ...mapState(['serviceOrders', 'selectedCopyMerchandise', 'goalOrderForPaste', 'selectCopyMerchandiseFlag']),
    ...mapGetters(['getCandidateExperimentsByCategoryId', 'hasMerchandiseManagePrivilege']),
    experimentList () {
      let scId = this.serviceCategoryId
      if (!scId && scId === null) return
      let ids = this.experimentIDs
      if (ids === null && ids.length === 0) return
      let res = []
      for (let i = 0; i < ids.length; i++) {
        let id = ids[i]
        let mExp = this.getCandidateExperimentsByCategoryId(scId).filter(item => item.metaExperimentId === id)[0]
        if (mExp) {
          res.push(mExp)
        }
      }
      return res
    },
    hidenCopyBtn () {
      return !this.selectCopyMerchandiseFlag
    },
    hidenUnCopyBtn () {
      return this.selectCopyMerchandiseFlag
    },
    orderComputed () {
      if (this.order) {
        return this.order
      }
      return {}
    },
    couldChangeMer () {
      if (this.currentClickMerchandise.serviceMerchandiseGUID) {
        let mer = this.order.merchandiseList.find(mer => mer.serviceMerchandiseGUID === this.currentClickMerchandise.serviceMerchandiseGUID)
        return !(mer && mer.status === global.MerchandiseStatus.input && this.hasMerchandiseManagePrivilege && this.couldAddOrCopyMer)
      }
      return true
    },
    couldAddOrCopyMer () {
      let could = true
      let sfQuoteId = this.orderComputed.sfQuoteId
      let QuoteId = scClient.QuoteId
      let QuoteStatusFromUrl = scClient.QuoteStatusFromUrl
      let QuoteStatus = scClient.QuoteStatus
      if (QuoteId && QuoteId !== null) { // url中带有QuoteId
        if (parseInt(sfQuoteId) !== parseInt(QuoteId)) {
          could = false
        } else {
          if (QuoteStatusFromUrl !== null) { // url中带有QuoteStatus
            if (parseInt(QuoteStatusFromUrl) === QuoteStatus.Draft) {
              could = true
            } else if (parseInt(QuoteStatusFromUrl) === QuoteStatus.AuditRefuse) {
              could = true
            } else {
              could = false
            }
          } else {
            could = false
          }
        }
      }
      return could
    }
  },
  methods: {
    ...mapMutations(['setCandidateExperiments', 'initSCMetaData', 'setServiceOrders', 'setSelectedCopyMerchandise', 'setGoalOrderForPaste', 'setSelectCopyMerchandiseFlag']),
    initOrder () {
      let sfParams = this.$route.query.sfParams
      if (sfParams) { // sf
        scClient.callRemoteMethod('respondSalesforceCutthrough', JSON.parse(sfParams), true, (data) => {
          this.setServiceOrders(data.serviceOrders)
          this.order = data.serviceOrders[0]
          this.salesforceRequestProcessed = true
        })
      } else {
        this.order = this.$route.query.order ? JSON.parse(this.$route.query.order) : this.$route.params.order
      }
    },
    clickMerchandise (mer) {
      this.currentClickMerchandise = mer
      this.$route.query.metaExperimentIds = undefined // 点击商品名称加载实验设计信息时，应不受路由参数影响
      let response = experimentDesignV2
      this.experimentIDs = response.metaExperimentIds.sort((x, y) => x - y) // id从小到大排序
      this.serviceCategoryId = response.serviceMerchandise.serviceCategoryId
      /**
      let params = {
        version: mer.version,
        serviceMerchandiseGUID: mer.serviceMerchandiseGUID
      }
      scClient.callRemoteMethod('loadExperimentDesignV2', params, true, response => {
        // console.log('loadExperimentDesignV2------res:', response)
        this.experimentIDs = response.metaExperimentIds.sort((x, y) => x - y) // id从小到大排序
        this.serviceCategoryId = response.serviceMerchandise.serviceCategoryId
      })
       */
    },
    selectCopyMerchandise () {
      this.setGoalOrderForPaste(this.$router.currentRoute.params)
      this.setSelectCopyMerchandiseFlag(true)
      this.$router.push({name: scClient.MobileRouterName.orders, query: {selectCopyMerchandiseFlag: true}})
    },
    clickCopyMerchandise (mer) {
      this.setSelectedCopyMerchandise(mer)
      let goalOrder = this.goalOrderForPaste.order
      let params = {
        serviceMerchandiseGUID: mer.serviceMerchandiseGUID,
        orderID: goalOrder.id
      }
      let _this = this
      let ok = function () {
        scClient.callRemoteMethod('copyServiceMerchandise', params, true, response => {
          goalOrder.merchandiseList.push(response)
          _this.setSelectCopyMerchandiseFlag(false) // 复制后修改状态
          _this.$router.push({name: _this.MobileRouterName.order, query: {orderId: goalOrder.id}, params: {order: goalOrder}})
          window.$.msg('操作成功！')
        })
      }
      let cancel = function () {}
      window.$.confirm('', '复制成功,马上去粘贴吧!', ok, cancel)
    },
    deleteConfirm (title, name, item, params, method) {
      let content = name + item
      let orders = this.order
      let ok = function () {
        scClient.callRemoteMethod(method, params, true, null)
        let merchan = orders.merchandiseList
        merchan = merchan.filter(me => {
          return me.serviceMerchandiseGUID !== params.serviceMerchandiseGUID
        })
        orders.merchandiseList = merchan
      }
      let cancel = function () {}
      window.$.confirm(title, content, ok, cancel)
    }
  },
  filters: {
    filterItem (item) {
      return item + '|'
    }
  }
}
</script>

<style scoped>
  .margin-bottom {
    margin-bottom: 0.5rem;
  }

  .hiden-btn {
    display: none
  }
/*
  .ui.shape {
    display: inherit;
  }
  .ui.shape.animating .sides {
    position: relative;
  }

  .ui.shape .animating.side {
    position: absolute;
    top: 0px;
    left: 0px;
    display: block;
    z-index: 100;
  }*/
</style>
