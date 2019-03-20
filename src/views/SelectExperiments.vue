<template>
  <div>
    <div class="ui fluid card">
      <div class="content" v-if="orderCom !== null">
        <i class="right floated">{{orderCom.id}}</i>
        <div class="meta right floated">订单号:</div>
        <div class="header">{{orderCom.customerEnterpriseName}}</div>
        <div class="meta">
          {{orderCom.customerName}}， {{orderCom.regionFatherName}}， 业务员: {{orderCom.employeeName}}
        </div>
        <div class="ui horizontal divider"><span style="color: #2185D0"> {{createOrModify}} </span></div>
        <div class="description">
          <div class="ui fluid accordion">
            <div class="active title" v-if="!isCreateMerchandise && merchandiseCom !== null">
              <i class="dropdown icon"></i>
              {{merchandiseCom.serviceCategoryName}}
              <i class="meta right floated" style="font-size: 12px">{{merchandiseCom.statusNameOfM}}</i>
            </div>
            <div class="active title" v-else>
              <i class="dropdown icon"></i>
              {{serviceCategoryName}}
            </div>
            <div class="active content">
              <div style="margin-left: 1rem;">
                <merchandise-info v-if="!isCreateMerchandise && merchandiseCom !== null" :merchandise="merchandiseCom"></merchandise-info>

                <h5 class="ui horizontal divider header" style="margin-top: 1rem;"> 实验信息 </h5>
                <experiment-list @selectExperiment="selectExperiment" :candidateExperiments="experimentList" :isChecked="true"></experiment-list>
                <div class="ui divider" style="margin: -0.5rem;"></div>
                <experiment-list @selectExperiment="selectExperiment" :candidateExperiments="candidateExperiments" :isChecked="false"></experiment-list>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="extra content">
        <div>
          <button class="mini ui button primary" @click="saveSelectedExperiment" :class="{'disabled': disabledBtn}">保存</button>
          <router-link :to="{ name: MobileRouterName.order, query: {orderId: orderCom.id}, params: {order: order} }"><button class="mini ui right floated button"><i class="angle left icon"></i>返回订单</button></router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'
import scClient from '../sc_client.js'
import merchandiseInfo from '../components/MerchandiseInfo.vue'
import experimentList from '../components/ExperimentsList.vue'
export default {
  created () {
    this.MobileRouterName = scClient.MobileRouterName
    // this.serviceCategoryId = null
  },
  mounted () {
  },
  data () {
    return {
      checkedExperimentIds: this.$route.params.experimentIDs ? this.$route.params.experimentIDs : [],
      serviceCategoryId: this.$route.params.categoryId ? this.$route.params.categoryId : (this.$route.params.merchandise ? this.$route.params.merchandise.serviceCategoryId : null),
      order: this.$route.params.order,
      merchandise: this.$route.params.merchandise ? this.$route.params.merchandise : {}, // 添加商品实验
      experimentList: this.$route.params.experimentList ? this.$route.params.experimentList : [],
      isCreateMerchandise: this.$route.params.isCreate // 是否新商品的标志
    }
  },
  components: {
    merchandiseInfo,
    experimentList
  },
  watch: {
    '$route.params': {
      handler: function (route) {
        if (this.$route.name !== scClient.MobileRouterName.selectExperiments) return
        let merchandise = route.merchandise ? route.merchandise : {}
        let cId = route.categoryId ? route.categoryId : merchandise ? merchandise.serviceCategoryId : null
        let order = route.order
        let expList = route.experimentList ? route.experimentList : []
        let isCreate = route.isCreate
        this.isCreateMerchandise = isCreate
        let expIds = route.experimentIDs ? route.experimentIDs : []
        if (cId) {
          this.serviceCategoryId = cId
        } else {
          this.serviceCategoryId = null
        }
        if (order) {
          this.order = order
        }
        if (merchandise) {
          this.merchandise = merchandise
        } else {
          this.merchandise = null
        }
        if (expList) {
          this.experimentList = expList
        } else {
          this.experimentList = null
        }
        if (!isCreate && (expIds || expIds.length > 0)) {
          this.checkedExperimentIds = expIds
        }
        if (isCreate) {
          this.checkedExperimentIds = expIds
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['getCandidateExperimentsByCategoryId', 'getServiceCategoryById']),
    candidateExperiments () {
      let cId = this.serviceCategoryId
      if (!cId) return []
      let exps = this.getCandidateExperimentsByCategoryId(cId)
      let expsOfMer = this.experimentList
      if (expsOfMer) { // 增加实验时，实验候选列表需要去除商品已有的实验
        expsOfMer.forEach(item => {
          exps = exps.filter(e => {
            return e.metaExperimentId !== item.metaExperimentId
          })
        })
        return exps
      }
      return exps
    },
    serviceCategoryName () {
      let cId = this.serviceCategoryId
      if (!cId) return '找不到'
      return this.getServiceCategoryById(cId).label ? this.getServiceCategoryById(cId).label : ''
    },
    createOrModify () {
      return this.isCreateMerchandise ? '增加商品' : '修改商品'
    },
    disabledBtn () {
      if (this.checkedExperimentIds.length === 0) {
        return true
      }
      return false
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
    selectExperiment (tar, exp) {
      let checked = tar.target.checked
      let checkEidList = this.checkedExperimentIds
      if (checked) { // checked
        checkEidList.push(exp.metaExperimentId)
      } else { // unchecked
        checkEidList.forEach(id => {
          if (id === exp.metaExperimentId) {
            checkEidList.splice(checkEidList.indexOf(id), 1)
          }
        })
      }
      // console.log('selectExperiment------', checked, exp)
    },
    saveSelectedExperiment () {
      let data = {
        orderId: this.order.id,
        serviceMerchandiseGUID: this.merchandise ? this.merchandise.serviceMerchandiseGUID : '',
        serviceCategoryId: this.serviceCategoryId,
        metaExperimentIds: this.checkedExperimentIds,
        version: this.merchandise.version
      }
      this.saveServiceMerchandise(data)
    },
    // 新增／修改／删除实验--保存商品
    saveServiceMerchandise (params) {
      window.$.dimmerShow('保存中')
      scClient.callRemoteMethod('createOrUpdateServiceMerchandise', params, true, response => {
        // console.log('createOrUpdateServiceMerchandise---', response)
        if (response) {
          let flag = false
          let orderNew = this.order
          for (let i = 0; i < orderNew.merchandiseList.length; i++) {
            let item = orderNew.merchandiseList[i]
            if (item.serviceMerchandiseGUID === response.serviceMerchandiseGUID) {
              orderNew.merchandiseList.splice(orderNew.merchandiseList.indexOf(item), 1)
              orderNew.merchandiseList.push(response)
              flag = true
              break
            }
          }
          if (!flag) {
            orderNew.merchandiseList.push(response)
          }
          window.$.dimmerHide()
          this.$router.push({name: scClient.MobileRouterName.order, query: {orderId: orderNew.id}, params: {order: orderNew, metaExperimentIds: this.checkedExperimentIds}})
        }
      })
    }
  }
}
</script>
<style>
</style>
