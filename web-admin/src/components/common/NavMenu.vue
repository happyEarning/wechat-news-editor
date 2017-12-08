<template>
  <el-row class="tac">
    <el-col :style="{minHeight:'100%'}" class="clearfix">
      <el-menu :default-active="activeIndex" class="el-menu-nav" theme="dark">
        <div class="nav-logo">
         LOGO
        </div>
        <el-menu-item index="1" @click="goView('/')">
          <i class="el-icon-menu"></i>首页
        </el-menu-item>
        <el-menu-item index="2" @click="goView('/index2')">
          <i class="el-icon-menu"></i>首页2
        </el-menu-item>
        <el-menu-item index="2" @click="goView('/index4')">
          <i class="el-icon-menu"></i>自动回复
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>
<script>
export default {
  name: "nav-menu",
  data() {
    return {
      activeIndex: "1-1"
    };
  },
  computed: {
    user: function() {
      return this.$store.state.user ? this.$store.state.user : {};
    }
  },
  watch: {
    $route: function() {}
  },
  methods: {
    goView: function(path) {
      this.$router.push({
        path: path
      });
    }
  },
  mounted: function() {
    // this.setActiveIndex()
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-menu-nav {
  min-height: 100%;
}

.nav-logo {
  text-align: center;
  padding: 5px 0;
  border-bottom: 1px solid #a0a0a0;
}
</style>
