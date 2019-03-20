<template>
  <div>
    <div class="ui accordion filter" v-show="hasPrivilege">
      <div class="title" @click="clickAccordionTitle">
        <div class="ui center aligned basic segment" style="margin-top: -1rem;">
          <div class="ui teal labeled icon button">过滤订单<i class="search icon"></i></div>
        </div>
      </div>
      <div class="content">
        <div class="ui card" style="width: 100%;-webkit-box-shadow: none; box-shadow: none; margin-top: -1rem; ">
          <div class="ui stackable two column grid" style="margin-bottom: -2rem;">
            <input-box :label="SelectOptions.customerName" :params="params" :forCustomerName="true"></input-box>
            <input-box :label="SelectOptions.employeeName" :params="params" :isEmployee="isEmployee" :forEmployeeName="true"></input-box>
          </div>
          <div class="ui stackable column grid" style="margin-top: 0;margin-bottom: -2rem;">
            <input-box :label="SelectOptions.orderNo" :params="params" :forOrderNo="true"></input-box>
          </div>
          <div class="ui stackable two column grid" style="margin-top: 0;">
            <select-box :disabled="isDivisionManager" :label="SelectOptions.regionFatherName" :options="divisions" :selected="params.regionFatherName" :cleanFilterOptionsValue="cleanFilterOptionsValue" :params="params"></select-box>
            <select-box :disabled="isDistrictManager" :label="SelectOptions.regionName" :options="districts" :selected="params.regionName" :cleanFilterOptionsValue="cleanFilterOptionsValue" :params="params"></select-box>
          </div>
          <div class="ui stackable column grid" style="margin-top: 0;">
            <select-box :label="SelectOptions.merchanStatus" :options="smStatus" :selected="params.merchanStatus" :cleanFilterOptionsValue="cleanFilterOptionsValue" :params="params"></select-box>
          </div>
          <div class="ui stackable two column grid" style="margin-top: 0;">
            <select-box :label="SelectOptions.merchanCreateDT" :options="DataOptions" :selected="params.merchanCreateDT" :cleanFilterOptionsValue="cleanFilterOptionsValue" :params="params"></select-box>
            <select-box :label="SelectOptions.merchanUpdateDT" :options="DataOptions" :selected="params.merchanUpdateDT" :cleanFilterOptionsValue="cleanFilterOptionsValue" :params="params"></select-box>
          </div>
          <div class="ui form" style="margin-bottom: 1rem;">
          </div>
          <div class="extra content" style="margin-top: -1rem;margin-bottom: 1rem;">
            <div>
              <button class="ui mini primary button" @click="clickSearchBtn">查询</button>
              <button class="ui mini right floated button" @click="clickCloseBtn">关闭</button>
              <button class="mini ui right floated button" @click="clickClearBtn">清空</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="ui right aligned basic segment percent" style="margin-top: -1rem; padding:0.5rem">
      <span>{{this.loaderMessage.percent}}</span>
    </div>

    <div class="ui three stackable cards" id="infinite_orders">
      <div class="ui card animating transition in scale" v-for="order in serviceOrders" :key="order.id" :id="'id'+order.id">
        <div class="content">
          <i class="right floated">订单号: {{order.id}}</i>
          <div class="header">{{order.customerEnterpriseName}}</div>
          <div class="meta">{{order.customerName}}， {{order.regionFatherName}}/{{order.regionName}}， <i class="user icon"></i> {{order.employeeName}}，
            报价编号：{{order.sfQuoteId}}，订单编号：{{order.sfOrderNo}}</div>

          <div class="description" v-if="order.merchandiseList.length===1" v-for="mer in order.merchandiseList" :key="mer.serviceMerchandiseGUID">
            <p>{{mer.serviceCategoryName}}</p>
          </div>

          <div class="description" v-if="order.merchandiseList.length===2">
            <p>{{order.merchandiseList[0].serviceCategoryName}}，{{order.merchandiseList[1].serviceCategoryName}}</p>
          </div>

          <div class="description" v-if="order.merchandiseList.length>=3">
            <p>{{order.merchandiseList[0].serviceCategoryName}}，{{order.merchandiseList[1].serviceCategoryName}}，{{order.merchandiseList[2].serviceCategoryName}} ...</p>
          </div>

          <div class="description" v-if="order.merchandiseList.length===0">
            <p>暂无商品</p>
          </div>
        </div>
        <div class="extra content">
          <span class="left floated"><i class="copy icon"></i>{{order.merchandiseList.length}}个商品</span>
          <!--<router-link :to="{ name: MobileRouterName.order, query: {order: JSON.stringify(order)} }"><span class="right floated">查看<i class="angle right icon"></i></span></router-link>-->
          <router-link :to="{ name: MobileRouterName.order, query: {orderId: order.id}, params: {order: order} }"><span class="right floated">查看<i class="angle right icon"></i></span></router-link>
        </div>
      </div>
      <div class="ui card" v-if="serviceOrders===undefined">
        <div class="content">
          <div class="description">
            <p>暂无订单</p>
          </div>
        </div>
      </div>
    </div>
    <div class="ui center aligned basic segment" v-if="!loaderMessage.clickLoadMore">
      <div class="ui centered inline text" :class="this.loaderMessage.cls" :key="'loader'">
        {{this.loaderMessage.msg}}
      </div>
    </div>
    <div class="ui center aligned basic segment" v-else>
      <a href="#" class="ui centered inline text" :class="this.loaderMessage.cls" :key="'loader'" @click="loadMore">
        点击加载更多
      </a>
    </div>
  </div>
</template>

<script>
import global from '../sc_global.js'
import scClient from '../sc_client.js'
import {mapMutations, mapGetters, mapState} from 'vuex'
import selectBox from '../components/editBox/SelectBox.vue'
import inputBox from '../components/editBox/InputBox.vue'
export default {
  data () {
    return {
      params: {
        orderId: '',
        employeeName: '',
        employeeGuid: '',
        customerName: '',
        regionName: '',
        regionFatherName: '',
        merchanStatus: null,
        merchanCreateDT: '',
        merchanUpdateDT: '',
        startIndex: scClient.Pagination.startIndex,
        pageSize: scClient.Pagination.pageSize,
        index: scClient.Pagination.index
      }, // 调用getOrdersData的参数
      amount: -1, // 返回的orders总数
      serviceOrders: [], // 保存retrieveServiceOrders返回值
      cleanFilterOptionsValue: 1,
      domObserver: false,
      hasPrivilege: true
    }
  },
  created () {
    this.initSCMetaData()
    this.SelectOptions = global.FilterOptionsLabel
    this.DataOptions = scClient.BeforeDateOptions
    this.MobileRouterName = scClient.MobileRouterName
  },
  mounted () {
    window.$('.ui.accordion').accordion()
    this.visibility(true)
  },
  beforeRouteEnter (to, from, next) {
    let order = from.params.order // 订单数据更新
    if (order) {
      next(vm => {
        let index = -1
        vm.serviceOrders.forEach(or => {
          if (or.orderNo === order.orderNo) {
            index = vm.serviceOrders.indexOf(or)
          }
        })
        if (index > -1) {
          vm.serviceOrders.splice(index, 1, order)
        }
      })
    } else {
      next()
    }
  },
  components: {
    selectBox,
    inputBox
  },
  computed: {
    ...mapGetters([
      'isEmployee',
      'isDistrictManager',
      'isDivisionManager',
      'isBusiness',
      'isTechnology',
      'isTechnologySupport',
      'isSalesManager',
      'isAdministrator',
      'districts',
      'divisions',
      'smStatus'
    ]),
    ...mapState(['SCMetaData', 'selectCopyMerchandiseFlag']),
    loaderMessage: function () {
      if (!this.hasPrivilege) return {}
      if (this.amount === -1) {
        return {
          msg: '载入中...',
          cls: 'active loader',
          percent: ''
        }
      } else if (this.amount === 0) {
        return {
          msg: '没有检索到记录',
          cls: '',
          percent: ''
        }
      } else if (this.serviceOrders.length < this.amount) {
        return {
          msg: '更多内容载入中...' + this.serviceOrders.length + '/' + this.amount,
          cls: 'active loader',
          percent: this.serviceOrders.length + '/' + this.amount + ' 项',
          clickLoadMore: true
        }
      } else if (this.serviceOrders.length >= this.amount || this.params.startIndex >= this.amount) {
        return {
          msg: '全部加载完毕',
          cls: '',
          percent: this.serviceOrders.length + ' 项'
        }
      }
    },
    orders () {
      return this.serviceOrders.filter((el, idx, self) => {
        return self.indexOf(el) !== idx
      })
    }
  },
  watch: {
  },
  methods: {
    attached () {
      this.visibility()
    },
    ...mapMutations(['setServiceOrders', 'initSCMetaData']),
    getOrdersData (filter, callback) {
      let ui = this.SCMetaData.scUserInfo ? this.SCMetaData.scUserInfo : undefined
      if (!ui) return
      if (this.isBusiness || this.isTechnology || this.isTechnologySupport || this.isSalesManager || this.isAdministrator) { // 技术支持，管理员可以看到所有订单数据
        // todo nothing
      } else if (this.isDivisionManager) {
        this.params.regionFatherName = ui.division
      } else if (this.isDistrictManager) {
        this.params.regionName = ui.district
        this.params.regionFatherName = ui.division
      } else if (this.isEmployee) {
        this.params.employeeName = ui.name
        this.params.employeeGuid = ui.employeeGuid
      } else {
        this.hasPrivilege = false
        window.$.msgError('警告，无权限用户，请重新登录')
        return
      }
      let param = this.params
      // 调用后台数据接口
      scClient.callRemoteMethod('retrieveServiceOrders', param, true, (data) => {
        // console.log('retrieveServiceOrders', data)
        if (this.serviceOrders && this.serviceOrders.length > 0 && !filter) {
          this.serviceOrders = this.serviceOrders.concat(data.serviceOrders)
        } else {
          this.serviceOrders = data.serviceOrders ? data.serviceOrders : []
        }
        this.serviceOrders = this.serviceOrders.sort((x, y) => y.id - x.id)
        this.amount = this.serviceOrders.length < this.params.pageSize ? this.serviceOrders.length : data.amount
        this.setServiceOrders(this.serviceOrders)
        if (filter) {
          let oLength = this.serviceOrders.length
          if (oLength < this.params.pageSize) { // 处理查询结果少于pageSize
            this.amount = oLength
          }
          window.$.msg('为您找到' + this.amount + '条数据')
        }
        if (typeof callback === 'function') {
          callback()
        }
        this.onBottomVisible()
      })
    },
    clickSearchBtn () {
      this.params.startIndex = scClient.Pagination.startIndex
      this.params.pageSize = scClient.Pagination.pageSize
      this.params.index = scClient.Pagination.index
      this.getOrdersData(true)
    },
    clickClearBtn () {
      this.params = {
        orderId: '',
        employeeName: '',
        employeeGuid: '',
        customerName: '',
        regionName: '',
        regionFatherName: '',
        merchanStatus: null,
        merchanCreateDT: '',
        merchanUpdateDT: '',
        startIndex: scClient.Pagination.startIndex,
        pageSize: scClient.Pagination.pageSize,
        index: scClient.Pagination.index
      }
      this.cleanFilterOptionsValue = Math.ceil(Math.random() * 10) // 获取从1到10的随机整数
    },
    clickCloseBtn () {
      this.serviceOrders = [] // 清空orders
      this.clickClearBtn()
      // this.getOrdersData(false)
      window.$('.ui.accordion.filter').accordion('close', 0)
      this.closeMsg()
    },
    clickAccordionTitle () { // onClose
      let _this = this
      window.$('.ui.accordion.filter').accordion({
        onClose: function () {
          this.serviceOrders = [] // 清空orders
          _this.clickClearBtn()
        }
      })
    },
    closeMsg () {
      window.$('.overlay.msg').transition('hide')
    },
    visibility (isFromMounted) {
      let self = this
      window.$('.stackable.cards').visibility({
        once: false,
        debug: false,
        // update size when new content loads
        observeChanges: true,
        // load content on bottom edge visible
        onBottomVisible: function () {
          self.loadMore(isFromMounted)
        }
      })
    },
    loadMore (isFromMounted) {
      if (this.amount !== -1) {
        if (this.serviceOrders.length >= this.amount) {
          // 如果到达总数量， 则不再触发load操作
          // console.log('end load')
          return
        }
      }
      // 加载数据
      if (isFromMounted) { // 刷新页面时，mounted 和 attached里的方法会同时调到，因此用isFromMounted标志区分，用以处理翻页参数的修改
        this.getOrdersData(false)
        this.params.startIndex = this.params.pageSize * this.params.index
        this.params.index++
      } else {
        let _this = this
        let callback = function () { // 返回订单数据后，回调更新起始页码，下拉翻页
          _this.params.startIndex = _this.params.pageSize * _this.params.index
          _this.params.index++
        }
        this.getOrdersData(false, callback)
      }
    },
    onBottomVisible () { // 如果加载前一页完毕后，仍然没有充满屏幕, 需要自动加载下一页
      let self = this
      this.$nextTick(function () {
        let $cards = window.$('.stackable.cards')
        let tar = $cards.offset()
        let top
        if (tar) {
          top = tar.top
        }
        let bottomVisible = window.$(window).scrollTop() + window.innerHeight - top - $cards.height() >= 0
        if (bottomVisible) {
          self.loadMore(false)
        }
      })
    }
  }
}
</script>

<style>
  .ui.success.message {
    margin-top: -1rem;
    margin-bottom: 1rem;
  }
</style>
