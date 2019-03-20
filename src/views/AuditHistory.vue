<template>
  <div>
    <div class="ui card" style="width: 100%">
      <div class="content">
        <i class="right floated">{{merchandiseCom.orderId}}</i>
        <div class="meta right floated">订单号:</div>
        <div class="header">{{merchandiseCom.serviceCategoryName}}</div>
        <div class="ui divider"></div>
        <div class="meta" v-if="auditHistory.length === 0">暂无审核历史</div>
        <div v-else>
          <div class="ui comments">
            <div class="comment" v-for="audit in auditHistory" :key="audit.operationTime">
              <a class="avatar">
                <i class="thumbtack icon"></i>
              </a>
              <div class="content" style="margin-left: 2em;">
                <a class="author">{{audit.operationTypeName}}</a>
                <div class="metadata">
                  <div class="date"><i class="user icon"></i>{{audit.operator}}</div>
                  <div class="rating">
                    <i class="clock outline icon"></i>
                    {{audit.operationTime}}
                  </div>
                </div>
                <div class="text">
                  {{audit.comment}}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="extra content">
        <router-link :to="{ name: MobileRouterName.order, query: {orderId: orderCom.id} }"><button class="mini ui right floated button"><i class="angle left icon"></i>返回</button></router-link>
      </div>
    </div>
  </div>
</template>

<script>
import scClient from '../sc_client.js'
import {mapState} from 'vuex'
export default {
  created () {
    this.MobileRouterName = scClient.MobileRouterName
    this.getHistory()
  },
  data () {
    return {
      auditHistory: [],
      merchandise: this.$route.params.merchandise,
      order: this.$route.params.order
    }
  },
  computed: {
    ...mapState(['SCMetaData']),
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
  watch: {
    '$route.params': function (val) {
      if (this.$route.name !== scClient.MobileRouterName.auditHistory) return
      if (val.merchandise) {
        this.merchandise = val.merchandise
        this.getHistory()
      }
      if (val.order) {
        this.order = val.order
      }
    }
  },
  methods: {
    getHistory () {
      let params = {
        serviceMerchandiseGUID: this.merchandise.serviceMerchandiseGUID,
        version: this.merchandise.version
      }
      let operationType = this.SCMetaData.operationTypeMap
      scClient.callRemoteMethod('loadAuditHistory', params, true, response => {
        if (response) {
          response.forEach(re => {
            let val = operationType[re.operationType]
            if (val) {
              re.operationTypeName = val.dictValue
            }
          })
          this.auditHistory = response
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
