<template>
  <div class="ui form">
    <div class="ui fluid card">
      <div class="content" v-if="attr">
        <div class="color" style="font-size: 1em;">{{headerContent}}</div>
        <div class="summary" v-for="(item,index) in attr.attrValue.value" :key="index" style="margin-top: 0.5rem;display: flex;">
          <div style="width: 80%;" @click="editItems(item)" :class="{'_disabled': attr.attrValue.enable}">
            <a class="date" style="font-size: 1.1rem;font-weight: 600;">{{metaContent(item, true)}}</a><br>
            <a class="date">{{metaContent(item, false)}}</a>
          </div>
          <div style="width: 20%;text-align: right">
            <a class="right floated color" @click="deleteItems(item)" :class="{'_disabled': attr.attrValue.enable}"><i class="minus icon"></i>删除</a>
          </div>
        </div>
      </div>
      <div class="extra content" style="text-align: center;">
        <a class="right floated" @click="addItems" :class="{'_disabled': attr.attrValue.enable}"><i class="add icon"></i>添加</a>
      </div>
    </div>
    <div v-if="attr" :id="attr.attrName" class="ui longer modal">
      <i class="close icon" @click="confirmAddItems(null)"></i>
      <div class="image content" style="margin-top: 1rem;">
        <div class="ui form">
          <attr-group-box :index="index" :attributes="selectedItem"></attr-group-box>
        </div>
      </div>
      <div class="actions">
        <div class="ui positive right labeled icon button">确定<i class="checkmark icon"></i></div>
      </div>
    </div>
  </div>
</template>

<script>
import scMeta from '../sc_meta.js'
import scClient from '../sc_client.js'
export default {
  props: ['attr', 'index', 'attributes'],
  mounted () {
  },
  data () {
    return {
      isEdit: false,
      selectedItem: [] // 选中的行
    }
  },
  watch: {
  },
  methods: {
    editItems (item) {
      this.isEdit = true
      this.selectedItem = item
      window.$('#' + this.attr.attrName + '').modal('show')
    },
    deleteItems (item) {
      this.selectedItem = []
      let attrs = this.attr.attrValue.value
      attrs.splice(attrs.indexOf(item), 1)
    },
    addItems () {
      this.isEdit = false
      let list = this.attr.attrValue.attributes
      let value = this.attr.attrValue.value
      let res = []
      list.forEach(li => {
        let obj = scClient.attrMetaHandler(li, null, null)
        if (li.attrValue.meta.type === scMeta.ParamAttrType.Group) { // 处理列表中存在组
          let attr = li.attrValue.attributes // value
          let aArr = []
          attr.forEach(at => {
            aArr.push(scClient.attrMetaHandler(at, null, null))
          })
          obj.attrValue.value = aArr
          obj.attrValue.attributes = aArr
        }
        res.push(obj)
      })
      value.splice(value.length - 1, 0, res) // 新增
      this.selectedItem = res
      let _this = this
      window.$('#' + this.attr.attrName + '').modal({
        closable: false,
        onApprove: function () {
          _this.confirmAddItems(res) // 处理没填写内容的情况
        }
      }).modal('show')
    },
    confirmAddItems (item) {
      let value = this.attr.attrValue.value
      if (item === null) {
        if (this.isEdit) return // 编辑时关闭dialog不删除
        value.splice(value.indexOf(this.selectedItem), 1)
        this.selectedItem = []
      }
    },
    metaContent (item, isTitle) {
      let res = ''
      if (item instanceof Array) {
        item.forEach(con => {
          if (con.attrValue.value) {
            let opts = con.attrValue.options
            let value = ''
            if (opts && opts.length > 0) {
              opts.forEach(opt => {
                if (opt.key === con.attrValue.value) { // 找到字典中key对应的value
                  value = opt.value
                }
              })
            } else {
              if (con.attrValue.meta.type && con.attrValue.meta.type !== scMeta.ParamAttrType.Group) {
                value = con.attrValue.value
              }
            }
            if (value !== '') {
              res = res === '' ? value : res + ',' + value
            }
          }
        })
      } else {
        Object.keys(item).forEach(key => {
          let value = item[key]
          res = res === '' ? value : res + ',' + value
        })
      }
      if (typeof res === 'number') {
        if (isTitle) {
          return ''
        } else {
          return res
        }
      }
      let arr = res.split(',')
      if (arr.length > 1) {
        if (isTitle) {
          res = arr[0]
        } else {
          arr.splice(0, 1)
          res = arr.length === 1 ? arr[0] : arr.join(',')
        }
      } else {
        if (isTitle) {
          res = arr[0]
        } else {
          res = ''
        }
      }
      return res
    }
  },
  computed: {
    headerContent () {
      let res = ''
      let content = this.attr.attrValue.meta.list
      Object.keys(content).forEach(con => {
        let label = content[con].label
        if (label && label !== '') {
          res = res === '' ? label : res + ',' + label
        }
      })
      return res
    }
  }
}
</script>

<style scoped>
  .color {
    color: rgba(0, 0, 0, 0.4);
  }

</style>
