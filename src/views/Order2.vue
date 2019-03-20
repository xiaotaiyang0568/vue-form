<template>
  <div>
    <div class="ui fluid card">
      <div class="content">
        <!--
        <i class="right floated like icon"></i>
        <i class="right floated star icon"></i>
        -->
        <i class="right floated">订单号</i>
        <div class="header">上海新华医院</div>
        <div class="meta">
          郑浩， 华东区， 业务员: 曹鸿飞
        </div>
        <div class="ui divider"></div>
        <div class="description">
          <div class="ui fluid accordion">
            <div v-for="m in mercs" :key="m.id">
              <div class="title" :class="modified(m.isModified)">
                <i class="dropdown icon"></i>
                {{m.name}}{{m.id}}
                <i class="meta right floated">创建人</i>
              </div>
              <div class="content">
                <div style="margin-left: 1rem;">

                  <div class="meta">
                    <div class="ui middle aligned list">
                      <div class="item" v-for="i in items" :key="i">
                        <div class="right floated content" style="margin-top: 0.1rem; margin-bottom: 0.1rem">
                          <i class="meta right floated">2018/01/01</i>
                        </div>
                        <div class="content" style="margin-top: 0.1rem; margin-bottom: 0.1rem">

                          创建日期:
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 class="ui horizontal divider">
                    <i class="meta">实验信息</i>
                  </h3>

                  <div class="ui middle aligned divided list">
                    <div class="item" v-for="i in items" :key="i">
                      <div class="right floated content" style="margin-top: 0.3rem; margin-bottom: 0.3rem">
                        <div class="ui fitted checked checkbox">
                          <input type="checkbox" checked="">
                          <label></label>
                        </div>
                      </div>
                      <div class="content" style="margin-top: 0.3rem; margin-bottom: 0.3rem">
                        <i class="eye dropper icon"></i>
                        实验 {{i}}
                      </div>
                    </div>
                  </div>
                  <h3 class="ui divider"></h3>
                </div>
              </div>
            </div>

            <div class="title">
              <i class="meta plus icon"></i>
              <i class="meta">新建商品</i>
            </div>
            <div class="content">
              <p>Three common ways for a prospective owner to acquire a dog is from pet shops, private owners, or shelters.</p>
              <p>A pet shop may be the most convenient way to buy a dog. Buying a dog from a private owner allows you to assess the pedigree and upbringing of your dog before choosing to take it home. Lastly, finding your dog from a shelter, helps give a good home to a dog who may not find one so readily.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="extra content">
        <!--
        <span class="left floated"><a class="delete" v-on:click="remove"><i class="trash icon"></i>删除</a></span>
        <router-link :to="{ name: 'Orders' }"><span class="right floated">返回<i class="angle left icon"></i></span></router-link>
        -->
        <div>
          <button class="ui button" v-on:click="remove">作废订单</button>
          <router-link :to="{ path: '/orders2#ID8' }">
            <button class="ui right floated button"><i class="angle left icon"></i>返回</button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Order2',
  data () {
    return {
      mercs: [
        /*
        {id: 1, name: '商品', isModified: false},
        {id: 2, name: '商品', isModified: false},
        {id: 3, name: '商品', isModified: false}
        */

        {id: 1, name: '商品'},
        {id: 2, name: '商品'},
        {id: 3, name: '商品'}

      ],
      items: [1, 2, 3]
    }
  },
  created () {
  },
  mounted () {
    window.$('.ui.accordion').accordion()
  },
  methods: {
    getStr () {
      return new Date().getTime() + ''
    },
    modified (val) {
      return val ? 'modified' : ''
    },
    remove (event) {
      this.mercs[1].isModified = true
      // this.mercs[1] = {id: 2, name: '修改后的商品', isModified: true}
      // window.alert('delete it')
      this.$router.push({name: 'Orders2', query: { plan: this.getStr() }})
    },
    detail (event) {
    }

  }
}
</script>

<style scoped>
/*
  .ui.shape {
    display: inherit;
  }
  .ui.shape.animating .sides {
    position: relative;
  }

  .ui.shape .animating.side {
    position: absolute;
    top: 0px;
    left: 0px;
    display: block;
    z-index: 100;
  }*/
.modified {
  font-weight: bold;
}
</style>
