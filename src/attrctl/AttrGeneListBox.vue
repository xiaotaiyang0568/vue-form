<template>
  <div class="ui form">
    <div class="ui fluid card">
      <div class="content" v-if="attr">
        <div class="color" style="font-size: 1em;">{{headerContent}}</div>
        <div class="ui items" v-for="(item,index) in attr.attrValue.value" :key="index" style="margin-top: 0.5rem;margin-bottom: 0;display: flex;">
          <div style="width: 80%;">
            <attr-display-box :displayItems="item"></attr-display-box>
          </div>
          <div style="width: 20%;text-align: right">
            <a class="right floated color" @click="deleteItems(item)" v-if="item[1].attrValue.value || item[2].attrValue.value" :class="{'_disabled': attr.attrValue.enable}"><i class="minus icon"></i>删除</a>
          </div>
        </div>
      </div>
      <div class="extra content" style="text-align: center;">
        <a class="right floated" @click="addItems" :class="{'_disabled': attr.attrValue.enable}"><i class="add icon"></i>添加</a>
      </div>
    </div>
    <div v-if="attr" :id="attr.attrName" class="ui longer modal">
      <i class="close icon" @click="confirmAddItems(false)"></i>
      <div class="image content" style="margin-top: 2.5rem;">
        <div class="ui form">
          <attr-radio-box :attr="createdItemWithTax" :fromGene="true" :index="index" :attributes="attributes" @getSelected="getSelected"></attr-radio-box>
          <attr-search-box :attr="createdItem" :fromGene="true" :index="index" :attributes="attributes" @getEntered="getEntered" @loadGeneItems="loadGeneItems"></attr-search-box>
          <div class="scrolling content" style="margin-top: 0.5rem;height: 400px;">
            <div class="color" v-if="resultFlag" style="text-align: center">暂无结果</div>
            <attr-result-box v-else :index="index" :resultList="geneList" :resultListChecked="geneListChecked" :fromGene="true" @onCheckItem="onCheckItem" @onCheckAll="onCheckAll"></attr-result-box>
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
  },
  data () {
    return {
      geneList: [],
      geneListChecked: [],
      taxSelected: null, // taxId
      customNameEntered: '', // geneName
      disabledConfirm: true,
      resultFlag: false,
      createdItem: '' // 新增时构造
    }
  },
  watch: {
    'geneListChecked': function (val) {
      if (this.geneListChecked.length > 0) {
        this.disabledConfirm = false
      } else {
        this.disabledConfirm = true
      }
    }
  },
  methods: {
    getSelected (val) {
      this.taxSelected = val
    },
    getEntered (val) {
      this.customNameEntered = val
    },
    loadGeneItems () {
      let data = {
        taxId: this.taxSelected,
        entered: this.customNameEntered
      }
      window.$.dimmerShow('查询中')
      scClient.callRemoteMethod('loadGeneItems', data, false, response => {
        // console.log('loadGeneItems', response)
        window.$.dimmerHide()
        this.geneList = scClient.removeRepeats(this.attr.attrValue.value, response, 'geneGuid')
        this.resultFlag = this.geneList.length === 0
      })
    },
    onCheckItem (tar, gene) { // 单选，反选
      let checked = tar.target.checked
      let checkedList = this.geneListChecked
      if (checked) {
        checkedList.push(gene)
      } else {
        checkedList.forEach(item => {
          if (item.geneGuid === gene.geneGuid) {
            checkedList.splice(checkedList.indexOf(item), 1)
          }
        })
      }
    },
    onCheckAll (tar) { // 全选，反选
      let checked = tar.target.checked
      let geneElement = window.$('.check_gene_item')
      if (checked) {
        let list = this.geneList
        this.geneListChecked = []
        list.forEach(li => {
          this.geneListChecked.push(li)
        })
        for (let i = 0; i < geneElement.length; i++) {
          geneElement[i].checked = true
        }
      } else {
        this.geneListChecked = []
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
      let list = this.attr.attrValue.attributes
      let res = []
      list.forEach(li => {
        let obj = scClient.attrMetaHandler(li, null, null)
        res.push(obj)
      })
      this.createdItem = res
      return res
    },
    confirmAddItems (confirm) {
      if (confirm) {
        let value = this.attr.attrValue.value
        let checkList = this.geneListChecked
        checkList.forEach(checked => {
          let item = this.createdItems()
          for (let it of item) {
            if (checked[it.attrName]) {
              it.attrValue.value = checked[it.attrName]
            }
          }
          value.push(item)
        })
      }
      this.geneList = [] // 清空
      this.geneListChecked = []
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
    createdItemWithTax () {
      let items = this.createdItems()
      if (items === '') return
      return items.find(it => it.attrName === 'taxId')
    }
  }
}
</script>

<style scoped>
  .color {
    color: rgba(0, 0, 0, 0.4);
  }

</style>
