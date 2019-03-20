<template>
  <div class="ui form" v-if="attr && attr.attrValue" :class="{'radio-display': attr.attrValue.meta.row}">
    <div class="field" v-if="attr" v-for="(item,index) in optionsValue" :class="{'radio-width': attr.attrValue.meta.row}" :key="index">
      <div class="ui checkbox" :class="{'_disabled': attr.attrValue.enable}">
        <input type="checkbox" :value="item.key" v-model="checkValue">
        <label>{{item.value}}</label>
      </div>
      <attr-group-box :attributes="item.checkedList"></attr-group-box>
    </div>
  </div>
</template>

<script>
import scClient from '../sc_client.js'

export default {
  props: ['attr', 'index', 'attributes'],
  created () {
  },
  mounted () {
    window.$('.ui.checkbox').checkbox()
  },
  data () {
    return {
      input: ''
    }
  },

  methods: {
  },
  computed: {
    optionsValue () {
      let meta = this.attr.attrValue.meta
      let attrValue = this.attr.attrValue
      let options = attrValue.options
      let checkVal = this.checkValue // 取得界面checkbox选择的结果，比如[0,1]
      // console.log('取得界面checkbox选择的结果')
      // console.log(checkVal)
      options.forEach(opt => {
        let idx = checkVal.indexOf(opt.key)
        if (idx >= 0 && !opt.checked) { // 如果当前选项已经被选中（check）， 且状态是没有被选中，则新建一个
          // Vue.set(opt, 'checked', true)
          let _checkedList = attrValue.value[idx]
          let checkedList = []

          _checkedList.forEach(v => {
            let vAttrName = v.attrName
            if (vAttrName !== meta.keyAttrName) {
              checkedList.push(v)
            }
          })
          // console.log('True')
          opt.checked = true

          opt.checkedList = checkedList
          // console.log(opt)
        } else if (idx < 0 && opt.checked) { // 当前选项取消选中（uncheck），且状态是被选中，则修改选中状态并清空相关信息
          // console.log('False')
          // Vue.set(opt, 'checked', true)
          opt.checked = false
          opt.checkedList = []
          // console.log(opt)
        }
      })
      // console.log(options)
      return options
    },
    checkValue: {
      // getter
      get: function () {
        // return this.attr.attrValue.value
        // return []
        let resVal = []
        let value = this.attr.attrValue.value
        let meta = this.attr.attrValue.meta
        if (value === null) {
          return resVal
        }
        value.forEach(item => {
          item.forEach(v => {
            let vAttrValue = v.attrValue
            let vAttrName = v.attrName
            if (vAttrName === meta.keyAttrName) {
              if (vAttrValue.value !== null) {
                resVal.push(vAttrValue.value)
              }
            }
          })
        })
        return resVal
      },
      // setter
      set: function (newValue) {
        // console.log('newValue')
        // console.log(newValue)
        if (newValue === null) {
          newValue = []
        }

        let meta = this.attr.attrValue.meta
        if (this.attr.attrValue.value === null) {
          this.attr.attrValue.value = []
        }

        let removed = []
        let add = newValue
        this.attr.attrValue.value.forEach(item => {
          item.forEach(v => {
            let vAttrValue = v.attrValue
            let vAttrName = v.attrName
            if (vAttrName === meta.keyAttrName) {
              if (newValue.indexOf(vAttrValue.value) < 0) {
                removed.push(item)
              } else {
                let i = add.indexOf(vAttrValue.value)
                if (i > -1) {
                  add.splice(i, 1)
                }
              }
            }
          })
        })

        removed.forEach(item => {
          let index = this.attr.attrValue.value.indexOf(item)
          if (index > -1) {
            this.attr.attrValue.value.splice(index, 1)
          }
        })

        let keyAttrName = meta.keyAttrName
        let addRawValue = []
        add.forEach(val => {
          addRawValue.push({[keyAttrName]: val})
        })
        /*
         console.log('meta')
         console.log(meta)
         console.log('addRawValue')
         console.log(addRawValue)
         */
        let addedAttrValue = scClient.attrValueHandler(this.attr.attrName, meta, {[this.attr.attrName]: addRawValue})
        /*
         console.log('addedAttrValue')
         console.log(addedAttrValue)
         */
        addedAttrValue.forEach(val => {
          this.attr.attrValue.value.push(val)
        })
      }
    }
  }
}

</script>

<style scoped>
  .radio-display {
    display: flex;
  }

  .radio-width {
    width:50%;
  }

</style>
