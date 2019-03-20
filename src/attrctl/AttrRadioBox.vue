<template>
  <div class="ui form" v-if="attr && attr.attrValue" :class="{'radio-display': attr.attrValue.meta.row}">
    <div class="field" v-if="attr" v-for="(item,index) in attr.attrValue.options"
         :class="{'radio-width': attr.attrValue.meta.row}" :key="index">
      <div class="ui radio checkbox" :class="{'_disabled': attr.attrValue.enable}">
        <input type="radio" :value="item.key" v-model="attr.attrValue.value">
        <label>{{item.value}}</label>
        <div class="radio-extra" v-if="item.extraValue && attr.attrValue.meta.enumId === BioAnalysisSet"
             v-html="item.extraValue.split('^').toString().replace(/,/g, '<br>')"></div>
      </div>
    </div>
  </div>
</template>

<script>
import scMeta from '../sc_meta.js'
export default {
  created () {
    this.BioAnalysisSet = scMeta.DictIds.BioAnalysisSet
  },
  props: ['attr', 'index', 'attributes', 'fromGene', 'attrPartA'],
  mounted () {
    window.$('.ui.radio.checkbox').checkbox()
  },
  data () {
    return {
      input: ''
    }
  },
  watch: {
    'attr.attrValue.value': function (val) {
      if (this.fromGene) {
        this.$emit('getSelected', val)
      }
    }
  },
  methods: {
    onChanged (item) {
    }
  },
  computed: {}
}

</script>

<style scoped>
  .radio-display {
    display: flex;
  }

  .radio-width {
    width: 50%;
  }

  .radio-extra {
    margin-left: 1em;
  }

</style>
