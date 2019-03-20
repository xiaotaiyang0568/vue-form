<template>
  <div>
    <div class="ui items position" v-if="resultList && resultList.length>0" v-for="(gene, index) in resultList" :key="index">
      <div style="display: flex;">
        <div class="ui checkbox" style="margin-top: 20px;">
          <input type="checkbox" name="example" @click="onCheckItem($event, gene)" class="check_gene_item">
          <label></label>
        </div>
        <div class="item position">
          <div class="content">
            <a class="header">{{gene.symbol}}</a>
            <div class="meta">
              <span style="color: rgba(0, 0, 0, 0.4);">基因ID：{{gene.geneID}}，{{gene.NMID}}</span>
            </div>
            <div class="extra" style="color: rgba(0, 0, 0, 0.4);">
              {{gene.synonyms}}
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
    onCheckItem (tar, gene) {
      this.$emit('onCheckItem', tar, gene)
    }
  }
}
</script>
