<template>
  <div id="app">
    <div class="ui fixed inverted menu">
      <div class="ui container">
        <a href="#" class="header item">
          {{pageTitle}}
        </a>
        <div class="right item">
          <a class="ui inverted" style="color: #ffffff;">{{userName}}</a>
        </div>
      </div>
    </div>
    <div class="ui main container">
    </div>
    <transition name="fade" mode="out-in" keep-alive>
      <div class="overlay msg">
        <div class="ui container">
          <div class="ui message" :class="this.messageClass" v-if="this.message">
            <i class="close icon" v-on:click="msgClose"></i>
            <div class="header"></div>
            <p>{{message}}</p>
          </div>
        </div>
      </div>
    </transition>
    <div class="ui container">
      <transition name="fade" mode="out-in" keep-alive>
      <div class="ui modal confirm">
        <i class="close icon"></i>
        <div class="header">
          {{confirmTitle}}
        </div>
        <div class="description">
          <div class="ui header" style="margin-left: 1rem;">
            <p>{{confirmContent}}</p>
          </div>
        </div>
        <div class="actions">
          <div class="ui black deny button">取消</div>
          <div class="ui positive right button">确定</div>
        </div>
      </div>
      </transition>

      <div class="ui inverted dimmer">
        <div class="ui text loader">{{dimmerText}}</div>
      </div>

      <transition :name="transitionName" mode="out-in" keep-alive>
        <keep-alive>
          <router-view class="router" v-if="$route.meta.keepAlive"></router-view>
        </keep-alive>
      </transition>
      <transition :name="transitionName" mode="out-in" keep-alive>
        <router-view class="router" v-if="!$route.meta.keepAlive"></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
import {mapState, mapMutations} from 'vuex'
import scClient from './sc_client.js'
// import global from '../../webdev2/src/sc/sc_global.js'
export default {
  name: 'App',
  created () {
    this.initSCMetaData()
  },
  data () {
    return {
      message: '',
      messageClass: 'success',
      transitionName: 'slide-left',
      confirmContent: '',
      confirmTitle: '',
      pageTitle: window.document.title,
      dimmerText: ''
    }
  },
  mounted () {
    window.alert = this.msgError
    window.$.msg = this.msg
    window.$.msgError = this.msgError
    window.$.confirm = this.confirm
    window.$.dimmerShow = this.dimmerShow
    window.$.dimmerHide = this.dimmerHide
    window.$('.overlay.msg').visibility({
      type: 'fixed',
      offset: 50 // give some space from top of screen
    })
  },
  methods: {
    ...mapMutations(['initSCMetaData']),
    msg (content) {
      this.messageClass = 'success'
      this.message = content
      window.$('.overlay.msg').transition('show')
    },
    msgError (content) {
      this.messageClass = 'error'
      this.message = content
    },
    msgClose () {
      this.message = undefined
    },
    confirm (title, content, ok, cancel) {
      this.confirmTitle = title
      this.confirmContent = content
      window.$('.ui.modal.confirm')
        .modal({
          closable: false,
          onDeny: function () {
            cancel()
            return true
          },
          onApprove: function () {
            ok()
            return true
          }
        }).modal('show')
    },
    dimmerShow (content) {
      this.dimmerText = content
      window.$('.ui.inverted.dimmer').dimmer('show')
    },
    dimmerHide () {
      window.$('.ui.inverted.dimmer').dimmer('hide')
    }
  },
  watch: {
    '$route' (to, from) {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
      this.transitionName = toDepth === fromDepth ? 'fade' : this.transitionName
      // console.log(this.transitionName)
      this.pageTitle = window.document.title
      // 路由活动时，关闭modal对话框
      window.$('.ui.modal.quote-result').modal('hide')
      window.$('.ui.modal.confirm').modal('hide')
      window.$('.ui.longer.modal').modal('hide')
    }
  },
  computed: {
    ...mapState(['SCMetaData']),
    userName () {
      let un = this.SCMetaData.scUserInfo ? this.SCMetaData.scUserInfo.name : ''
      return this.$route.name !== scClient.MobileRouterName.login ? ('欢迎你，' + un) : ''
    }
  }
}
</script>

<style>
#app {
  /*
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  */
}
.msg {

}

._disabled {
  pointer-events:none;
}
</style>
