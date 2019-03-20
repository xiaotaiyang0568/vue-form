<template>
  <div>
    <div class="ui fluid card">
      <div class="content">
        <div class="header">
          <div class="sc_dialog-title" @click="onBackButtonClicked">
            <i :class="currentBackButtonClass" class="chevron left icon"></i>
            <span>选择商品类型</span>
          </div>
        </div>
        <div class="ui divider"></div>
        <div class="description">
          <div class="ui middle aligned divided list">
            <div class="item" v-for="category in currentCategories" @click="onCategoryClicked(category)" :key="category.label">
              <div class="right floated content" style="margin-top: 0.3rem; margin-bottom: 0.3rem">
                <i v-if="showArrow(category)" class="chevron right icon"></i>
              </div>
              <div class="content" style="margin-top: 0.3rem; margin-bottom: 0.3rem">
                {{ category.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="extra content">
        <div>
          <router-link :to="{ name: MobileRouterName.order, query: {orderId: orderCom.id}, params: {order: order} }"><button class="mini ui right floated button"><i class="angle left icon"></i>返回订单</button></router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import scClient from '../sc_client.js'
export default {
  created () {
    this.MobileRouterName = scClient.MobileRouterName
  },
  mounted () {},
  data () {
    return {
      currentCategoryPath: [0],
      order: this.$route.params.order
    }
  },
  watch: {
    '$route.params': function (val) {
      if (val.order) {
        this.order = val.order
        this.currentCategoryPath = [0] // 商品分类的路径
      }
    }
  },
  computed: {
    ...mapGetters(['serviceCategories']),
    currentCategories () {
      let pid = this.currentCategoryPath[this.currentCategoryPath.length - 1]
      return this.findCategoriesById(pid)
    },
    currentBackButtonClass () {
      return this.currentCategoryPath.length > 1 ? 'sc_am-back-button' : 'sc_am-back-button hide'
    },
    orderCom () {
      if (this.order) {
        return this.order
      }
      return {}
    }
  },
  methods: {
    findCategoriesById (id) {
      return this.serviceCategories.filter(c => c.parentId === id)
    },
    onCategoryClicked (category) {
      let cid = category.serviceCategoryId
      let subCategories = this.findCategoriesById(cid)
      if (subCategories.length > 1) {
        this.currentCategoryPath.push(cid)
      } else {
        // 如果有一个唯一SubCategory，使用SubCategory
        if (subCategories.length === 1) {
          cid = subCategories[0].serviceCategoryId
        }
        this.$router.push({name: scClient.MobileRouterName.selectExperiments, query: {categoryId: cid, orderId: this.order.id, isCreate: true}, params: {categoryId: cid, order: this.order, isCreate: true}})
      }
    },
    showArrow (category) {
      return this.findCategoriesById(category.serviceCategoryId).length > 1
    },
    onBackButtonClicked () {
      if (this.currentCategoryPath.length > 1) {
        this.currentCategoryPath.pop()
      }
    }
  }
}
</script>
<style>
  .sc_dialog-title {
    text-align: left;
    margin-top: -1rem;
  }

  .sc_dialog-title span {
    line-height: 24px;
    font-size: 15px;
    color: #303133;
    text-align: left;
  }

  .sc_am-back-button {
    position: initial;
    top: 40px;
    left: 20px;
    font-size: 18px;
    margin: 0;
    padding: 5px;
    display: block;
  }

  .sc_am-back-button.hide {
    display: none;
  }

  dl {
    cursor: pointer;
    border-left: 1px solid #eee;
    border-top: 1px solid #eee;
    border-right: 1px solid #eee
  }

  dl dt {
    border-bottom: 1px solid #eee;
    border-collapse: collapse;
    padding: 10px;
    margin: 0;
    vertical-align: middle;
    font-size: 14px;
  }

  dt i {
    float: right;
    margin: 5px
  }
</style>
