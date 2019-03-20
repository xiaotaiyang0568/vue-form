<template>
  <div class="ui mini form">
    <div class="field" style="width: 110px;">
      <select class="ui fluid selection dropdown enum" v-model="realValue" :disabled="readonly">
        <option value="" disabled selected>{{defaultValue}}</option>
        <option v-for="item in extraInfo" :value="item.value" :key="item.value">{{item.label}}</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  created () {},
  mounted () {
    window.$('.ui.fluid.selection.dropdown.enum').dropdown()
  },
  data () {
    return {
      realValue: null
    }
  },
  props: ['readonly', 'unit', 'experiment'],
  watch: {
    'realValue': function (val) {
      this.unit.realValue = val
      this.experiment.isModify = true
      this.$emit('modifyUnit', this.experiment.isModify)
    }
  },
  computed: {
    extraInfo () {
      return this.unit.extraInfo
    },
    defaultValue () {
      return this.unit.extraInfo[parseInt(this.unit.realValue) - 1].label
    }
  }
}
</script>
