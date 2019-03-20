<template>
  <div class="ui form">
    <div class="ui fluid card">
      <div class="content" v-if="attr">
        <div class="ui items" v-for="(item,index) in attr.attrValue.value" :key="index" style="margin-top: 0.5rem;margin-bottom: 0;display: flex;">
          <div style="width: 70%;">
            <attr-display-box :displayItems="item" :showPopup="true"></attr-display-box>
          </div>
          <div style="width: 30%;text-align: right">
            <a class="right floated color" @click="deleteItems(item)" v-if="item" :class="{'_disabled': attr.attrValue.enable}"><i class="minus icon"></i>删除</a>
          </div>
        </div>
      </div>
      <div class="extra content" style="text-align: center;">
        <a class="right floated" @click="addItems" :class="{'_disabled': attr.attrValue.enable}"><i class="add icon"></i>添加</a>
      </div>
    </div>
    <div v-if="attr" :id="attributes[0].attrValue.value" class="ui longer modal">
      <i class="close icon" @click="confirmAddItems(false)"></i>
      <div class="image content" style="margin-top: 2.5rem;">
        <div class="ui form">
          <div class="field">
            <div style="display: flex;">
              <select name="skills1" class="ui fluid selection dropdown" v-model="selectedSearchType">
                <option :value=1  :key=1 selected>当前客户ID</option>
                <option :value=2  :key=2>其他客户名称</option>
              </select>
              <button v-if="selectedSearchType===1 || selectedSearchType===null" class="mini right floated ui primary button" @click="loadSerialNoItems"><i class="search icon"></i></button>
            </div>
            <div v-if="selectedSearchType===2" style="display: flex;margin-top: 1rem;">
              <div class="ui icon input">
                <input class="prompt" type="text" v-model="customNameEntered" placeholder="请输入">
              </div>
              <button class="mini right floated ui primary button" @click="loadSerialNoItems"><i class="search icon"></i></button>
            </div>
          </div>
          <div class="scrolling content" style="margin-top: 0.5rem;height: 400px;">
            <div class="color" v-if="resultFlag" style="text-align: center">暂无结果</div>
            <attr-result-box v-else :index="index" :resultList="serialNoList" :resultListChecked="serialNoListChecked" :fromSerialNo="true" @onCheckItem="onCheckItem" @onCheckAll="onCheckAll"></attr-result-box>
          </div>
        </div>
      </div>
      <div class="actions">
        <div class="ui positive right labeled icon button" :class="{'disabled': disabledConfirm}">确定<i class="checkmark icon"></i></div>
      </div>
    </div>
  </div>
</template>

<script>
import scClient from '../sc_client.js'
import scMeta from '../sc_meta.js'
export default {
  props: ['attr', 'index', 'attributes', 'attrPartA'],
  mounted () {
    window.$('.ui.fluid.selection.dropdown').dropdown()
  },
  data () {
    return {
      serialNoList: [],
      serialNoListChecked: [],
      taxSelected: null, // taxId
      customNameEntered: '',
      disabledConfirm: true,
      selectedSearchType: null, // 搜索类型
      resultFlag: false,
      createdItem: '' // 新增时构造
    }
  },
  watch: {
    'serialNoListChecked': function (val) {
      if (this.serialNoListChecked.length > 0) {
        this.disabledConfirm = false
      } else {
        this.disabledConfirm = true
      }
    }
  },
  methods: {
    loadSerialNoItems () {
      let data = {
        customerSearchTag: this.customNameEntered,
        type: this.selectedSearchType
      }
      window.$.dimmerShow('查询中')
      scClient.callRemoteMethod('loadPartAToProvideParamData', data, false, response => {
        // console.log('loadPartAToProvideParamData', response)
        window.$.dimmerHide()
        this.serialNoList = scClient.removeRepeats(this.attr.attrValue.value, response, 'lineIDName')
        this.resultFlag = this.serialNoList.length === 0
      })
    },
    onCheckItem (tar, serial) { // 单选，反选
      let checked = tar.target.checked
      let checkedList = this.serialNoListChecked
      if (checked) {
        checkedList.push(serial)
      } else {
        checkedList.forEach(item => {
          if (item.lineIDName === serial.lineIDName) {
            checkedList.splice(checkedList.indexOf(item), 1)
          }
        })
      }
    },
    onCheckAll (tar) { // 全选，反选
      let checked = tar.target.checked
      let geneElement = window.$('.check_gene_item')
      if (checked) {
        let list = this.serialNoList
        this.serialNoListChecked = []
        list.forEach(li => {
          this.serialNoListChecked.push(li)
        })
        for (let i = 0; i < geneElement.length; i++) {
          geneElement[i].checked = true
        }
      } else {
        this.serialNoListChecked = []
        for (let i = 0; i < geneElement.length; i++) {
          geneElement[i].checked = false
        }
      }
    },
    deleteItems (item) {
      this.createdItem = ''
      let attrs = this.attr.attrValue.value
      attrs.splice(attrs.indexOf(item), 1)
    },
    addItems () {
      let _this = this
      window.$('#' + this.attributes[0].attrValue.value + '').modal({
        closable: false,
        onApprove: function () {
          _this.confirmAddItems(true) // 处理没填写内容的情况
        }
      }).modal('show')
    },
    createdItems () {
      let list = this.attributes[1].attrValue.attributes // 构建serialNos
      let res = []
      list.forEach(li => {
        let obj = {}
        if (li.attrValue.meta.type === scMeta.ParamAttrType.Group) {
          obj = scClient.attrMetaHandler(li.attrValue.attributes[0], null, null)
        } else {
          obj = scClient.attrMetaHandler(li, null, null)
        }
        res.push(obj)
      })
      this.createdItem = res
      return res
    },
    confirmAddItems (confirm) { // 点击确认时重新组装元数据
      if (confirm) {
        let value = this.attr.attrValue.value
        let checkList = this.serialNoListChecked
        // let attrPartA = this.attrPartA
        checkList.forEach(checked => {
          let item = this.createdItems()
          for (let it of item) {
            if (checked.lineIDName && it.attrName === 'serialNos') {
              it.attrValue.value = checked.lineIDName
              it.attrValue.content = checked
            }
          }
          value.push(item)
        })
      }
      this.serialNoList = [] // 清空
      this.serialNoListChecked = []
    }
  }
}
</script>

<style scoped>
  .color {
    color: rgba(0, 0, 0, 0.4);
  }

</style>
