<template>
  <div class="ui middle aligned divided list">
    <div class="item" v-for="exp in candidateExperiments" :key="exp.metaExperimentId">
      <div class="right floated content" style="margin-top: 0.3rem; margin-bottom: 0.3rem">
        <div class="ui fitted checked checkbox">
          <input :checked="isChecked" type="checkbox" @click="selectExperiment($event, exp)">
          <label></label>
        </div>
      </div>
      <div class="content" style="margin-top: 0.3rem; margin-bottom: 0.3rem">
        <i class="eye dropper icon"></i>
        {{exp.experimentName}}
      </div>
    </div>
    <!--<div class="ui middle aligned divided list" v-if="candidateExperiments!==null && candidateExperiments && candidateExperiments.length===0 && isChecked">-->
      <!--该商品分类没有可选实验-->
    <!--</div>-->
  </div>
</template>

<script>
export default {
  created () {},
  props: ['candidateExperiments', 'isChecked'],
  methods: {
    selectExperiment (tar, exp) {
      this.$emit('selectExperiment', tar, exp)
    }
  }
}
</script>
