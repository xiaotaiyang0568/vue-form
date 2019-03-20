<template>
  <div class="ui middle aligned list">
    <div class="item" v-if="!quotePrice">
      <div class="right floated content" style="margin-top: 0.1rem; margin-bottom: 0.1rem"><i class="meta right floated">{{merchandise.duration}}</i></div>
      <div class="content" style="margin-top: 0.1rem; margin-bottom: 0.1rem">周期:</div>
    </div>
    <div class="item">
      <div class="right floated content" style="margin-top: 0.1rem; margin-bottom: 0.1rem"><i class="meta right floated">{{merchandise.settledPrice | priceFormat}}</i></div>
      <div class="content" style="margin-top: 0.1rem; margin-bottom: 0.1rem">成交价:</div>
    </div>
    <div class="item">
      <div class="right floated content" style="margin-top: 0.1rem; margin-bottom: 0.1rem"><i class="meta right floated">{{merchandise.ballparkPrice | priceFormat}}</i></div>
      <div class="content" style="margin-top: 0.1rem; margin-bottom: 0.1rem">价格预测:</div>
    </div>
    <div class="item" v-if="!quotePrice">
      <div class="right floated content" style="margin-top: 0.1rem; margin-bottom: 0.1rem"><i class="meta right floated">{{merchandise.formalPrice | priceFormat}}</i></div>
      <div class="content" style="margin-top: 0.1rem; margin-bottom: 0.1rem">正式报价:</div>
    </div>
    <div class="item" v-if="!quotePrice">
      <div class="right floated content" style="margin-top: 0.1rem; margin-bottom: 0.1rem"><i class="meta right floated">{{merchandise.createTime}}</i></div>
      <div class="content" style="margin-top: 0.1rem; margin-bottom: 0.1rem">创建日期:</div>
    </div>
    <div class="item">
      <div class="right floated content" style="margin-top: 0.1rem; margin-bottom: 0.1rem"><i class="meta right floated">{{merchandise.updateTime}}</i></div>
      <div class="content" style="margin-top: 0.1rem; margin-bottom: 0.1rem">修改日期:</div>
    </div>
  </div>
</template>
<script>
export default {
  created () {},
  props: ['merchandise', 'quotePrice'],
  filters: {
    priceFormat (val) {
      if (!val) return ''
      return parseInt(val)
    }
  }
}
</script>
