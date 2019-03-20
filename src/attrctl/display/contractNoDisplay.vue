<template>
  <div>
    <div class="ui items position" v-if="resultList && resultList.length>0" v-for="(item, index) in resultList" :key="index">
      <div style="display: flex;">
        <div class="ui checkbox" style="margin-top: 20px;">
          <input type="checkbox" name="example" @click="onCheckItem($event, item)" class="check_gene_item">
          <label></label>
        </div>
        <div class="item position">
          <div class="content">
            <a class="header">{{item.contractNo}}</a>
            <div class="meta">
              <span style="color: rgba(0, 0, 0, 0.4);">{{item.productName}}</span>
            </div>
            <div class="extra" style="color: rgba(0, 0, 0, 0.4);">
              {{item.customerName}}，{{item.enterpriseName}}<br>业务员：{{item.employeeName}}
            </div>
          </div>
        </div>
      </div>
      <div class="ui divider"></div>
    </div>
  </div>
</template>
<script>
export default {
  props: ['resultList'],
  methods: {
    onCheckItem (tar, item) {
      this.$emit('onCheckItem', tar, item)
    }
  }
}
</script>
