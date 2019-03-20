<template>
  <div class="ui form">
    <div class="field">
      <label></label>
      <textarea v-model="parameter.parameterText"></textarea>
    </div>
  </div>
</template>

<script>
import global from '../../sc_global.js'
export default {
  created () {},
  mounted () {},
  data () {
    return {}
  },
  props: ['parameter'],
  watch: {
    'parameter.parameterText': function (val) {
      this.parameter.parameterText = val
      this.parameter.isModify = true
      this.$emit('modifyUnit', this.parameter.isModify)
      this.checkTextLength(val)
    }
  },
  methods: {
    checkTextLength (textContent) {
      let byteLength = textContent.trim().replace(/[^\x00-\xff]/g, '***').length // '***'替换非Ascii字符占位，以计算字节长度
      if (byteLength > global.MaxLength.Textarea) {
        this.$emit('checkTextContentLength', false, this.parameter.metaParameterName)
      }
      this.$emit('checkTextContentLength', true, null)
    }
  }
}
</script>
