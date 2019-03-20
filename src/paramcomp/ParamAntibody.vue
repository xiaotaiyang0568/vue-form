<template>
  <div class="ui form">
    <attr-group-box :attributes="attributes" style="margin: 0em 0em 1em;"></attr-group-box>
    <div class="field">
      <div class="ui checkbox">
        <input type="checkbox" v-model="partBCheck" :class="{'_disabled': attributes[1].attrValue.enable}">
        <label>乙方提供</label>
      </div>
      <div class="ui card" v-show="partBCheck" >
        <div class="content">
          <div class="color" style="font-size: 1em;">{{headerContent}}</div>
          <div class="ui items" v-for="(item,index) in attributes[1].attrValue.value" :key="index" style="margin-top: 0.5rem;margin-bottom: 0;display: flex;">
            <div style="width: 70%;">
              <attr-display-box :displayItems="item" :showPopup="true"></attr-display-box>
            </div>
            <div style="width: 30%;text-align: right">
              <a class="right floated color" @click="deleteItems(item)" v-if="item" :class="{'_disabled': attributes[1].attrValue.enable}"><i class="minus icon"></i>删除</a>
            </div>
          </div>
        </div>
        <div class="extra content" style="text-align: center;">
          <a class="right floated" @click="addItems" :class="{'_disabled': attributes[1].attrValue.enable}"><i class="add icon"></i>添加</a>
        </div>
      </div>
    </div>

    <div v-if="attributes" :id="attributes[1].attrName" class="ui longer modal">
      <i class="close icon" @click="confirmAddItems(false)"></i>
      <div class="image content" style="margin-top: 2.5rem;">
        <div class="ui form">
          <div class="field">
            <select name="skills1" class="ui fluid selection dropdown" v-model="selectedSearchType">
              <option :value=1 :key=1 selected>蛋白名</option>
              <option :value=2 :key=2>基因名</option>
              <option :value=3 :key=3>基因ID</option>
            </select>
            <div style="display: flex;margin-top: 12px;">
              <div class="ui icon input">
                <input class="prompt" type="text" v-model="entered" placeholder="请输入">
              </div>
              <button class="mini right floated ui primary button" @click="loadAntibodyItems"><i class="search icon"></i></button>
            </div>
          </div>
          <div class="scrolling content" style="margin-top: 0.5rem;height: 400px;">
            <div class="color" v-if="resultFlag" style="text-align: center">暂无结果</div>
            <attr-result-box v-else :resultList="antibodyList" :resultListChecked="antibodyListChecked" :fromAntibody="true" @onCheckItem="onCheckItem" @onCheckAll="onCheckAll"></attr-result-box>
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
  props: ['attributes', 'params'],
  mounted () {
    window.$('.ui.fluid.selection.dropdown').dropdown()
    window.$('.ui.checkbox').checkbox()
    if (this.attributes[1].attrValue.value.length > 0) {
      this.partBCheck = true
    }
  },
  data () {
    return {
      partBCheck: false,
      antibodyList: [],
      antibodyListChecked: [],
      resultFlag: false,
      disabledConfirm: true,
      selectedSearchType: null, // 查询类型
      entered: '' // 输入
    }
  },
  watch: {
    'partBCheck': function (val) {
      if (!val) {
        this.attributes[1].attrValue.value = []
      }
    },
    'antibodyListChecked': function (val) {
      if (this.antibodyListChecked.length > 0) {
        this.disabledConfirm = false
      } else {
        this.disabledConfirm = true
      }
    }
    /*,
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
    loadAntibodyItems () {
      let data = {
        entered: this.entered,
        type: this.selectedSearchType
      }
      window.$.dimmerShow('查询中')
      scClient.callRemoteMethod('loadBSMBAntiBodyInfo', data, false, response => {
        // console.log('loadBSMBAntiBodyInfo', response)
        window.$.dimmerHide()
        this.antibodyList = scClient.removeRepeats(this.attributes[1].attrValue.value, response, 'antibodyGuid')
        this.resultFlag = this.antibodyList.length === 0
      })
    },
    onCheckItem (tar, serial) { // 单选，反选
      let checked = tar.target.checked
      let checkedList = this.antibodyListChecked
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
        let list = this.antibodyList
        this.antibodyListChecked = []
        list.forEach(li => {
          this.antibodyListChecked.push(li)
        })
        for (let i = 0; i < geneElement.length; i++) {
          geneElement[i].checked = true
        }
      } else {
        this.antibodyListChecked = []
        for (let i = 0; i < geneElement.length; i++) {
          geneElement[i].checked = false
        }
      }
    },
    deleteItems (item) {
      this.createdItem = ''
      let attrs = this.attributes[1].attrValue.value
      attrs.splice(attrs.indexOf(item), 1)
    },
    addItems () {
      let _this = this
      window.$('#' + this.attributes[1].attrName + '').modal({
        closable: false,
        onApprove: function () {
          _this.confirmAddItems(true) // 处理没填写内容的情况
        }
      }).modal('show')
    },
    createdItems () {
      let list = this.attributes[1].attrValue.attributes
      let res = []
      list.forEach(li => {
        let obj = {}
        obj = scClient.attrMetaHandler(li, null, null)
        res.push(obj)
      })
      this.createdItem = res
      return res
    },
    confirmAddItems (confirm) { // 点击确认时重新组装元数据
      if (confirm) {
        let value = this.attributes[1].attrValue.value
        let checkList = this.antibodyListChecked
        checkList.forEach(checked => {
          let item = this.createdItems()
          for (let it of item) {
            if (checked[it.attrName]) {
              it.attrValue.value = checked[it.attrName]
              it.attrValue.content = checked
            }
          }
          value.push(item)
        })
      }
      this.antibodyList = [] // 清空
      this.antibodyListChecked = []
    }
  },
  computed: {
    headerContent () {
      let res = ''
      let content = this.attributes[1].attrValue.meta.list
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
  .radio-display {
    display: flex;
  }

  .radio-width {
    width:50%;
  }

</style>
