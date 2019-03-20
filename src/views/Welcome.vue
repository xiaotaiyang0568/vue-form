<template>
  <div class="loader">
    <img src="static/img/logo2.jpg" style="height: 5rem; display: block; margin-top: 45%; margin-left: auto; margin-right: auto;"/>
    <div class="tips" style="text-align: center;">努力加载中</div>
    <div></div>
    <div></div>
  </div>
</template>

<script>
import {mapMutations} from 'vuex'
export default {
  created () {
    this.initSCMetaData()
  },
  methods: {
    ...mapMutations(['initSCMetaData'])
  }
}
</script>

<style scoped>
</style>
