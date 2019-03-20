<template>
  <div class="ui form">
    <div class="field" :class="{'_disabled': attr.attrValue.enable}" v-if="attr.attrName==='genecardNo'">
      <div style="display: flex;margin-top: 12px;width: 70%;">
        <div class="ui icon input">
          <input v-model.trim.number="attr.attrValue.value" :placeholder="attr.attrValue.meta.placeholder">
        </div>
        <button class="mini right floated ui primary button" @click="loadGenecardItems"><i class="search icon"></i>
        </button>
      </div>

      <div class="ui fluid card" v-show="showExtraInfo">
        <div class="content">
          <a class="header">癌肿：{{attributes[1].attrValue.attributes[1].attrValue.value | filterNone}}</a>
          <div class="meta">
            <span class="date">功能方向：{{attributes[1].attrValue.attributes[2].attrValue.value | filterNone}}</span>
          </div>
          <div class="description">
            预定状态：{{attributes[1].attrValue.attributes[3].attrValue.value | filterNone}} {{attributes[1].attrValue.attributes[4].attrValue.value | filterFormat}}
          </div>
        </div>
      </div>
    </div>

    <div class="field" :class="{'_disabled': attr.attrValue.enable}" v-else>
      <input v-model="attr.attrValue.value" :placeholder="attr.attrValue.meta.placeholder">
    </div>
  </div>
</template>

<script>
import scClient from '../sc_client.js'
import scMeta from '../sc_meta.js'
export default {
  created () {
    this.showExtraInfo = this.attr.attrName === 'genecardNo' && this.attr.attrValue.value !== null
  },
  props: ['attr', 'index', 'attributes'],
  data () {
    return {
      showExtraInfo: false
    }
  },
  watch: {},
  methods: {
    loadGenecardItems () {
      window.$.dimmerShow('查询中')
      scClient.callRemoteMethod('loadBSMLibGeneCardNoDetail', this.attr.attrValue.value, false, response => {
        console.log('loadBSMLibGeneCardNoDetail', response)
        window.$.dimmerHide()
        let attrs = this.attributes
        if (attrs[0].attrValue.value === scMeta.ExtraInfo.Mode.GenecardNo) { // 属性位置须和sc_meta.js中定义的一致
          let groupAttrs = attrs[1].attrValue.attributes
          groupAttrs[1].attrValue.value = response.cellCancer
          groupAttrs[2].attrValue.value = response.geneCardFunction
          groupAttrs[3].attrValue.value = response.geneCardApplyStatus
          groupAttrs[4].attrValue.value = response.applyOperator
          this.showExtraInfo = true
        }
      })
    }
  },
  filters: {
    filterFormat (val) {
      if (val) {
        return '，预定人：' + val
      }
      return '，预定人：无'
    },
    filterNone (val) {
      if (val) {
        return val
      }
      return '无'
    }
  }
}

</script>

<style scoped>
</style>
