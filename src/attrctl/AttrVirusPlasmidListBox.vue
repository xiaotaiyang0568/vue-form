<template>
  <div class="ui form">
    <div class="ui fluid card">
      <div class="content" v-if="attr">
        <div class="color" style="font-size: 1em;">{{headerContent}}</div>
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
        <a class="right floated" @click="addItems"><i class="add icon" :class="{'_disabled': attr.attrValue.enable}"></i>添加</a>
      </div>
    </div>
    <div v-if="attr" :id="attr.attrName" class="ui longer modal">
      <i class="close icon" @click="confirmAddItems(false)"></i>
      <div class="image content" style="margin-top: 2.5rem;">
        <div class="ui form">
          <attr-group-box :index="index" :attributes="validTargetNoAttr"></attr-group-box>

          <div class="inline fields">
            <label>类型</label>
            <div class="field" v-for="(item,index) in typeOptions" :key="index">
              <div class="ui radio checkbox type">
                <input type="radio" name="frequency" :value="item.value" v-model="attr.attrValue.attributes[2].attrValue.value">
                <label>{{item.label}}</label>
              </div>
            </div>
          </div>

          <div class="field" v-show="attr.attrValue.attributes[2].attrValue.value">
            <div style="display: flex;">
              <select name="skills1" class="ui fluid selection dropdown contract" v-model="selectedSearchType">
                <option :value=1  :key=1 selected>当前客户ID</option>
                <option :value=2  :key=2>合同号</option>
              </select>
              <button v-if="selectedSearchType===1 || selectedSearchType===null" class="mini right floated ui primary button" @click="loadContractNoItems"><i class="search icon"></i></button>
            </div>
            <div v-if="selectedSearchType===2" style="display: flex;margin-top: 1rem;">
              <div class="ui icon input">
                <input class="prompt" type="text" v-model="contractNoEntered" placeholder="请输入">
              </div>
              <button class="mini right floated ui primary button" @click="loadContractNoItems"><i class="search icon"></i></button>
            </div>
          </div>

          <div class="scrolling content" style="margin-top: 0.5rem;height: 300px;">
            <div class="color" v-if="resultFlag" style="text-align: center">暂无结果</div>
            <attr-result-box v-else :index="index" :resultList="contractNoList" :resultListChecked="contractNoListChecked" :fromContractNo="true" @onCheckItem="onCheckItem" @onCheckAll="onCheckAll"></attr-result-box>
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
export default {
  props: ['attr', 'index', 'attributes'],
  mounted () {
    window.$('.ui.fluid.selection.dropdown.contract').dropdown()
    window.$('.ui.radio.checkbox.type').checkbox()
  },
  data () {
    return {
      contractNoList: [],
      contractNoListChecked: [],
      taxSelected: null, // taxId
      contractNoEntered: '',
      disabledConfirm: true,
      selectedSearchType: null, // 搜索类型
      virusPlasmid: null,
      resultFlag: false,
      createdItem: '' // 新增时构造
    }
  },
  watch: {
    'contractNoListChecked': function (val) {
      if (this.contractNoListChecked.length > 0) {
        this.disabledConfirm = false
      } else {
        this.disabledConfirm = true
      }
    }
  },
  methods: {
    loadContractNoItems () {
      let data = {
        type: this.attr.attrValue.attributes[2].attrValue.value,
        entered: this.contractNoEntered,
        status: this.selectedSearchType
      }
      scClient.callRemoteMethod('loadBSMBVirusPlasmidInfo', data, false, response => {
        // console.log('loadBSMBVirusPlasmidInfo', response)
        this.contractNoList = scClient.removeRepeats(this.attr.attrValue.value, response, 'contractNo')
        this.resultFlag = this.contractNoList.length === 0
      })
    },
    onCheckItem (tar, serial) { // 单选，反选
      let checked = tar.target.checked
      let checkedList = this.contractNoListChecked
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
        let list = this.contractNoList
        this.contractNoListChecked = []
        list.forEach(li => {
          this.contractNoListChecked.push(li)
        })
        for (let i = 0; i < geneElement.length; i++) {
          geneElement[i].checked = true
        }
      } else {
        this.contractNoListChecked = []
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
      window.$('#' + this.attr.attrName + '').modal({
        closable: false,
        onApprove: function () {
          _this.confirmAddItems(true) // 处理没填写内容的情况
        }
      }).modal('show')
    },
    createdItems () {
      let list = this.attr.attrValue.attributes // 构建serialNos
      let res = []
      list.forEach(li => {
        let obj = {}
        if (li.attrName === 'attrsGroup') {
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
        let checkList = this.contractNoListChecked
        let attrs = this.attr.attrValue.attributes // 组装
        checkList.forEach(checked => {
          let item = this.createdItems()
          for (let it of item) {
            if (checked[it.attrName]) {
              it.attrValue.value = checked[it.attrName]
              it.attrValue.content = checked
            } else {
              attrs.forEach(at => {
                if (at.attrName === it.attrName) {
                  it.attrValue.value = at.attrValue.value
                  at.attrValue.value = [] // 清空
                }
              })
            }
          }
          value.push(item)
        })
      }
      this.contractNoList = [] // 清空
      this.contractNoListChecked = []
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
    },
    typeOptions () {
      return [{
        value: 1,
        label: '病毒'
      }, {
        value: 2,
        label: '质粒'
      }]
    },
    validTargetNoAttr () {
      return [this.attr.attrValue.attributes[3]]
    }
  }
}
</script>

<style scoped>
  .color {
    color: rgba(0, 0, 0, 0.4);
  }

</style>
