<template>
  <div>
    <div class='column'>
      <h2 class='ui teal image header'>
        <div class='content'></div>
      </h2>
      <form class='ui large form'>
        <div class='ui stacked segment'>
          <div class='field'>
            <div class='ui left icon input'>
              <i class='user icon'></i>
              <input type='text' v-model.trim='account' placeholder='请输入账号'>
            </div>
          </div>
          <div class='field'>
            <div class='ui left icon input'>
              <i class='lock icon'></i>
              <input type='password' name='password' v-model.trim='password' placeholder='请输入密码'>
            </div>
          </div>
          <div class='ui fluid large teal submit button' @click='login'>登录</div>
        </div>
        <div class='ui error message'></div>
      </form>
    </div>
  </div>
</template>
<script>
import scClient from '../sc_client.js'
import {mapMutations} from 'vuex'
import {SCMetaData} from '../data.js'
// import md5 from 'js-md5'
export default {
  created () {},
  mounted () {},
  data () {
    return {
      account: '',
      password: ''
    }
  },
  methods: {
    ...mapMutations(['initSCMetaData']),
    login () {
      let account = this.account
      let pass = this.password
      if (account === '' || pass === '') {
        window.$.msg('请输入账号和密码')
        return
      }
      scClient.scMetaDataHandler(SCMetaData)
      scClient.closeMsg() // 关闭会话过期
      this.initSCMetaData()
      this.$router.push({name: scClient.MobileRouterName.orders})
      /**
      let params = {'UserId': account, 'Password': md5(pass), 'AppVersion': '1.2'}
      scClient.callRemoteMethod('gcidifc/userLogin', params, true, response => {
        // console.log('gcidifc/userLogin', response)
        scClient.callRemoteMethod('loadSCMetaData', null, false, response => {
          scClient.scMetaDataHandler(response)
          scClient.closeMsg() // 关闭会话过期
          this.initSCMetaData()
          this.$router.push({name: scClient.MobileRouterName.orders})
        })
      })
      */
    }
  }
}
</script>
<style scoped>
  .ui.stacked.segment:after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0%;
    border-top: none;
    width: 100%;
    height: 6px;
    visibility: visible;
  }
</style>
