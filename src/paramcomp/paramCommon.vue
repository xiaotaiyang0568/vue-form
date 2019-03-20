<template>
  <div class="ui form" v-if="attributes">
    <attr-group-box :index="index" :attributes="attributes"></attr-group-box>
  </div>
</template>

<script>
import scCtlReg from '../sc_ctl_reg.js'
export default {
  created () {
    this.getCtlByType = scCtlReg.getCtlByType
  },
  props: ['attributes', 'index', 'params'],
  data () {
    return {
    }
  },
  watch: {
    /*
     'attributes': {
     handler: function (val) {
     this.params.isModify = true
     this.$emit('modifyUnit', true)
     },
     deep: true
     }
     */
  },
  methods: {
  },
  computed: {
  }
}

</script>

<style scoped>

</style>
