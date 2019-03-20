<template>
<div>
  <div class="ui checkbox" style="margin-top: 1rem;" v-if="resultList && resultList.length>0">
    <input type="checkbox" name="example" @click="onCheckAll" :checked="isCheckedAll">
    <label>全选</label>
  </div>
  <gene-display v-if="fromGene" :resultList="resultList" @onCheckItem="onCheckItem"></gene-display>
  <serial-no-display v-if="fromSerialNo" :resultList="resultList" @onCheckItem="onCheckItem"></serial-no-display>
  <cell-display v-if="fromCell" :resultList="resultList" @onCheckItem="onCheckItem"></cell-display>
  <contract-no-display v-if="fromContractNo" :resultList="resultList" @onCheckItem="onCheckItem"></contract-no-display>
  <antibody-display v-if="fromAntibody" :resultList="resultList" @onCheckItem="onCheckItem"></antibody-display>
</div>
</template>
<script>
import geneDisplay from './display/geneDisplay.vue'
import serialNoDisplay from './display/serialNoDisplay.vue'
import cellDisplay from './display/cellDisplay.vue'
import contractNoDisplay from './display/contractNoDisplay.vue'
import antibodyDisplay from './display/antibodyDisplay.vue'
export default {
  props: ['resultList', 'resultListChecked', 'fromSerialNo', 'fromGene', 'fromCell', 'fromContractNo', 'fromAntibody'],
  data () {
    return {
      checkedList: []
    }
  },
  methods: {
    onCheckItem (tar, item) {
      this.$emit('onCheckItem', tar, item)
    },
    onCheckAll (tar) {
      this.$emit('onCheckAll', tar)
    }
  },
  components: {
    geneDisplay,
    serialNoDisplay,
    cellDisplay,
    contractNoDisplay,
    antibodyDisplay
  },
  computed: {
    isCheckedAll () {
      let flag = false
      let checked = this.resultListChecked
      let listAll = this.resultList
      if (checked.length > 0 && listAll.length > 0 && checked.length === listAll.length) {
        flag = true
      }
      return flag
    }
  }
}
</script>
<style>
  .position {
    margin-bottom: 0;margin-top: 0;
  }
</style>
