<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {}
  },
  created: function () {
    // 每次进入app check 用户是否登录
    // const _this = this;
    
  },
  mounted: function () {

  }
}
</script>

<style>
#app {
  height: 100%;
}
</style>
