<template>
  <div v-if="label !== optionsLabel.merchanStatus" class="column" style="width:50% !important;">
    <div class="mini ui form">
      <div class="field">
        <label>{{label}}</label>
        <select name="skills1" class="ui fluid selection dropdown" v-model="selectedVal" :class="{'disabled': disabled}">
          <option value="" disabled selected>请选择</option>
          <option v-for="opt in options" :key="opt.value" :value="opt.value">{{opt.label}}</option>
        </select>
      </div>
    </div>
  </div>
  <div v-else class="column">
    <div class="mini ui form">
      <div class="field">
        <label>{{label}}</label>
        <select name="skills2" class="ui fluid selection dropdown" v-model="selectedVal">
          <option value="" disabled selected>请选择</option>
          <option v-for="opt in options" :key="opt.value" :value="opt.value">{{opt.label}}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import global from '../../sc_global.js'
export default {
  created () {
    this.optionsLabel = global.FilterOptionsLabel
  },
  mounted () {
    window.$('.ui.fluid.selection.dropdown').dropdown()
  },
  data () {
    return {
      selectedVal: this.selected,
      optionsLabel: null
    }
  },
  computed: {
  },
  props: ['label', 'options', 'params', 'selected', 'cleanFilterOptionsValue', 'disabled'],
  watch: {
    'selectedVal': function (val) {
      let l = this.label
      let la = global.FilterOptionsLabel
      if (l === la.regionFatherName) {
        this.params.regionFatherName = val
      } else if (l === la.regionName) {
        this.params.regionName = val
      } else if (l === la.merchanStatus) {
        this.params.merchanStatus = val !== '' ? val : null
      } else if (l === la.merchanCreateDT) {
        this.params.merchanCreateDT = val
      } else if (l === la.merchanUpdateDT) {
        this.params.merchanUpdateDT = val
      }
    },
    'cleanFilterOptionsValue': function (val) {
      window.$('.ui.fluid.selection.dropdown').dropdown('clear')
      this.selectedVal = ''
    }
  },
  methods: {
  }
}
</script>
<style>
</style>
