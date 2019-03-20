<template>
  <div>
    <div class="ui center aligned basic segment">
      <div class="ui teal labeled icon button">
        创建新订单
        <i class="add icon"></i>
      </div>
    </div>

      <div class="ui right aligned basic segment percent" style="margin-top: -1rem; padding:0.5rem">
        <span>{{this.loaderMessage.percent}}</span>
      </div>

    <div class="ui three stackable cards" id="cards">
    <!--<transition-group name="list" tag="div" class="ui three stackable cards">-->
      <div class="ui card animating transition in scale" v-for="order in orders" :key="order" :id="'ID'+order">
        <div class="content">
          <!--
          <i class="right floated like icon"></i>
          <i class="right floated star icon"></i>
          -->
          <i class="right floated">订单号: {{order}}</i>
          <div class="header">上海新华医院</div>
          <div class="meta">
            郑浩， 华东区， 业务员: 曹鸿飞
          </div>

          <div class="description">
            <p>细胞学实验, 其他实验...</p>
          </div>
        </div>
        <div class="extra content">
          <a class="delete" v-on:click="remove"><span class="left floated"><i class="copy icon"></i>删除</span></a>
          <router-link :to="{ name: 'Order2' }"><span class="right floated">查看<i class="angle right icon"></i></span></router-link>
        </div>
      </div>
    </div>
    <!--</transition-group>-->
    <!--Loader-->
    <div class="ui center aligned basic segment">
    <div class="ui centered inline text" :class="this.loaderMessage.cls" :key="'loader'">
      {{this.loaderMessage.msg}}
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Orders',
  data () {
    return {
      loaded: false,
      ordersCountPerPage: 9,
      ordersTotalCount: -1,
      orders: []
    }
  },
  /*
  beforeRouteEnter (to, from, next) {
    console.log('beforeRouteEnter')
    console.log(window.$('.stackable.cards'))
    next(vm => {
      vm.loaded = false
      console.log('beforeRouteEnter next')
      console.log(window.$('.stackable.cards'))
    })
  },
  beforeRouteUpdate (to, from, next) {
    console.log('beforeRouteUpdate')
    console.log(window.$('.stackable.cards'))
    next(vm => {
      vm.loaded = false
      console.log('beforeRouteUpdate next')
      console.log(window.$('.stackable.cards'))
    })
  },
  beforeRouteLeave (to, from, next) {
    console.log('beforeRouteLeave')
    console.log(window.$('.stackable.cards'))
    next(vm => {
      vm.loaded = false
      console.log('beforeRouteLeave next')
      console.log(window.$('.stackable.cards'))
    })
  },
  */
  mounted () {
    // var self = this
    this.ordersTotalCount = 90
    this.visibility()
    // this.observer()
  },
  destroyed () {
    console.log('destroyed')
  },
  computed: {
    loaderMessage: function () {
      if (this.ordersTotalCount === -1) {
        return {
          msg: '载入中...',
          cls: 'active loader',
          percent: ''
        }
      } else if (this.ordersTotalCount === 0) {
        return {
          msg: '没有检索到记录',
          cls: '',
          percent: ''
        }
      } else if (this.orders.length < this.ordersTotalCount) {
        return {
          msg: '更多内容载入中...' + this.orders.length + '/' + this.ordersTotalCount,
          cls: 'active loader',
          percent: this.orders.length + '/' + this.ordersTotalCount + ' 项'
        }
      } else if (this.orders.length >= this.ordersTotalCount) {
        return {
          msg: '全部加载完毕',
          cls: '',
          percent: this.orders.length + ' 项'
        }
      }
    }
  },
  methods: {
    attached () {
      console.log('I am attached')
      this.visibility()
    },
    visibility () {
      var self = this
      window.$('.stackable.cards').visibility({
        once: false,
        debug: false,
        // update size when new content loads
        observeChanges: true,
        // load content on bottom edge visible
        onBottomVisible: function () {
          self.loadMore()
        }
      })
      console.log('visibility installed')
    },
    loadMore () {
      if (this.orders.length >= this.ordersTotalCount) {
        // 如果到达总数量， 则不再触发load操作
        console.log('end load')
        return
      }

      // 加载数据
      var data = this.fetchData()
      for (var i = 0; i < data.length; i++) {
        this.orders.push(data[i])
      }
      console.log(this.orders.length + ' loaded') // => '更新完成'

      // 如果加载前一页完毕后，仍然没有充满屏幕, 需要自动加载下一页
      var self = this
      this.$nextTick(function () {
        var $cards = window.$('.stackable.cards')
        var bottomVisible = window.$(window).scrollTop() + window.innerHeight - $cards.offset().top - $cards.height() >= 0
        if (bottomVisible) {
          self.loadMore()
        }
      })
    },
    fetchData () {
      var data = []
      var curCount = this.orders.length
      for (var i = 1; i <= this.ordersCountPerPage; i++) {
        data.push(curCount + i)
      }
      return data
    },
    remove (event) {
      console.log(window.$('.card'))
    }
  }
}
</script>

<style>
.percent {
  color: gray;
}
</style>
