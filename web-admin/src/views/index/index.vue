<template>
  <div class="page">
    <div class="wx-editor-box">
      <div class="tw-list-panel">
        <ul>
          <li v-for="(item,index) in twList" :key="index">{{item.title}} </li>
        </ul>
      </div>
      <div class="tw-edit-panel">
        <div class="tw-edit-header">
          <div class="a">标题 <input type="text" v-model="curTwForm.title" placeholder=""> </div>
          <div class="a">描述 <input v-model="curTwForm.subtitle" type="text"></div>
        </div>
        <div class="wx-editor">
          
          <vue-html5-editor v-model="curTwForm.content" :height="600"></vue-html5-editor>
        </div>
        <div class="upload-img">
          上传封面图片: use element-ui上传
        </div>
        <div class="buttons">
          <button @click="add">添加推文</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
export default {
  name: "list",
  created() {
    // this.fetchData()
  },
  data() {
    return {
      content: "1111111",
      curTwForm: {
        content: "",
        title: "",
        subtitle: ""
      },
      twList: []
    };
  },
  methods: {
    add() {
      // check 是否存在ID 做add 或update
      let newItem = _.clone(this.curTwForm);
      this.twList.push(newItem);
      // console.log(newItem)
    }
  },
  mounted() {}
};

// 47.95.245.220
// root
// Badou666
</script>

<style scoped>
.page {
  padding: 20px;
}
.wx-editor-box {
  display: flex;
}
.tw-list-panel {
  width: 200px;
  flex-shrink: 0;
  border: 1px solid red;
  background: #fff;
}
.tw-edit-panel {
  flex-grow: 2;
}
</style>
