<template>
  <div class="ui form">
    <div class="field" v-if="attrs !== ''" v-for="(item, index) in attrs" :key="index" style="margin: 0;">
      <label v-if="item">{{item.attrValue.meta.label}}</label>
      <control v-if="item" v-show="show_if(item, item.attrValue.value, index, attributes)" :is="getCtlByType(item.attrValue.meta.type)" :special="false" :attrPartA="attrPartA" :attr="item" :index="index" :attributes="attributes"></control>
    </div>
  </div>
</template>

<script>
import scCtlReg from '../sc_ctl_reg.js'
import scMeta from '../sc_meta.js'
export default {
  created () {
    this.getCtlByType = scCtlReg.getCtlByType
  },
  props: ['attr', 'index', 'attributes', 'attrPartA'],
  mounted () {
  },
  data () {
    return {
    }
  },
  watch: {
  },
  methods: {
    show_if (attr, aVal, index, attributes) {
      if (!attr.attrValue.meta.show_if) {
        return true
      } else {
        let obj = {}
        attributes.forEach(item => {
          obj[item.attrName] = item.attrValue.value
        })
        return attr.attrValue.meta.show_if(attr, index, attributes, obj)
      }
    }
  },
  computed: {
    attrs () {
      if (this.attr) {
        return this.attr.attrValue.attributes
      } else {
        let attrs = this.attributes
        if (attrs === '' || !attrs) return attrs
        let res = []
        attrs.forEach(attr => {
          if (attr.attrValue.attributes && attr.attrValue.meta.type === scMeta.ParamAttrType.Object) {
            attr = attr.attrValue.attributes[0]
          }
          res.push(attr)
        })
        return res
      }
    }
  }
}

</script>

<style scoped>

</style>
