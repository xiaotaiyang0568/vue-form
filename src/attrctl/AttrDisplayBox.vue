<template>
  <div>
    <div class="item position">
      <div class="content">
        <div v-if="showPopup">
          <div class="header parta" style="color: #2185D0;font-weight: 600;">{{headerContent}}</div>
          <div class="ui special popup">
            <div class="ui meta">{{popupContent}}</div>
          </div>
        </div>
        <a class="header" v-else>{{headerContent}}</a>
        <div class="meta">
          <span style="color: rgba(0, 0, 0, 0.4);">{{descriptionContent}}</span>
        </div>
        <div class="extra" style="color: rgba(0, 0, 0, 0.4);">
          {{extraContent}}
        </div>
      </div>
    </div>
    <div class="ui divider" style="margin: 0.5rem;"></div>
  </div>
</template>
<script>
import scMeta from '../sc_meta.js'
export default {
  mounted () {
    window.$('.header.parta').popup({
      inline: true
    })
    this.getDetail()
  },
  watch: {
    'displayItems': {
      handler: function (val) {
        window.$('.header.parta').popup({
          inline: true
        })
        this.getDetail()
      },
      deep: true
    }
  },
  props: ['displayItems', 'showPopup'],
  data () {
    return {
      detail: {}
    }
  },
  methods: {
    commonHandler (from) {
      let res = ''
      let disItems = this.displayItems
      disItems.forEach(item => {
        let position = item.attrValue.meta.position
        let opts = item.attrValue.options
        let cell = item.attrValue.meta.cell
        let value = ''
        if (opts && opts.length > 0) {
          opts.forEach(opt => {
            if (opt.key === item.attrValue.value) { // 找到字典中key对应的value
              value = opt.value
            }
          })
        } else if (cell) {
          value = cell.label
        } else {
          value = item.attrValue.value
        }
        if (position === scMeta.Position.Header && from === scMeta.Position.Header) {
          res = res === '' ? value : res + ',' + value
        } else if (position === scMeta.Position.Description && from === scMeta.Position.Description) {
          res = res === '' ? value : res + ',' + value
        } else if (position === scMeta.Position.Extra && from === scMeta.Position.Extra) {
          res = res === '' ? value : res + ',' + value
        }
      })
      return res
    },
    getDetail () {
      let attr = this.displayItems.find(item => item.attrValue.meta.getDetail !== undefined)
      if (attr) {
        let params = attr.attrValue.value
        attr.attrValue.meta.getDetail(params, response => {
          this.detail = response
          this.$nextTick(vm => {
            window.$('.header.parta').popup({
              inline: true
            })
          })
        })
      }
    }
  },
  computed: {
    headerContent () {
      return this.commonHandler(scMeta.Position.Header)
    },
    descriptionContent () {
      return this.commonHandler(scMeta.Position.Description)
    },
    extraContent () {
      return this.commonHandler(scMeta.Position.Extra)
    },
    popupContent () {
      let res = ''
      for (let key in this.detail) {
        // 提示框的内容不需要包括Guid,lineIDName,antibodyNo,contractNo,cellNamePub
        if (key.indexOf('Guid') === -1 && key.indexOf('GUID') === -1 && key.indexOf('lineIDName') === -1 && key.indexOf('antibodyNo') === -1 && key.indexOf('contractNo') === -1 && key.indexOf('cellNamePub') === -1) {
          res = this.detail[key] + '；' + res
        }
      }
      return res.substring(0, res.length - 1)
    }
  }
}
</script>
