<template>
  <div class="column" style="width:50% !important;">
    <div class="mini ui form" v-if="attr">
      <div class="field">
        <select name="skills1" class="ui fluid selection dropdown date" v-model="selectedVal" :class="{'disabled': attr.attrValue.enable}">
          <option value="" disabled selected>请选择</option>
          <option v-for="opt in AttrDateOptions" :key="opt.value" :value="opt.value">{{opt.label}}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import scClient from '../sc_client.js'
export default {
  created () {
    this.AttrDateOptions = scClient.AttrDateBoxOptions
    this.initialize()
  },
  mounted () {
    window.$('.ui.fluid.selection.dropdown.date').dropdown()
  },
  data () {
    return {
      selectedVal: null,
      AttrDateOptions: null
    }
  },
  props: ['attr', 'attributes'],
  computed: {},
  watch: {
    'attr': {
      handler: function (val) {
        this.initialize()
      },
      deep: true
    },
    'selectedVal': function (val) {
      if (typeof val === 'string') {
        this.attr.attrValue.attributes[0].attrValue.value = val.split(',')[0]
        this.attr.attrValue.attributes[1].attrValue.value = val.split(',')[1]
      }
    }
  },
  methods: {
    initialize () {
      let selected = this.AttrDateOptions.find((d) => {
        let attrs = this.attr.attrValue.attributes
        let month = attrs[1].attrValue.value
        if (month < 10) {
          month = '0' + month
        }
        return d.value === attrs[0].attrValue.value + ',' + month
      })
      if (selected) {
        this.selectedVal = selected.value
      }
    }
  }
}
</script>
