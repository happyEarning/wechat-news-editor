<template>
  <div class="page">
    <el-button type="primary" @click="save">上传推文模版</el-button> <br>
    <div class="wx-editor-box">
      <div class="tw-list-panel">
        <ul>
          <li class="tw-item tw-item-title">文章列表</li>
          <li class="tw-item" v-for="(item,index) in twList" :key="index" @click="chooseTw(item)">
            <div class="tw-title">{{item.title}}</div> 
            <span class="remove-item" @click.stop="removeItem(item)">X</span>
          </li>
        </ul>
      </div>
      <div class="tw-edit-panel">
        <div class="tw-edit-header">
          <div class="form-item">标题 <input type="text" v-model="curTwForm.title" placeholder=""> </div>
          <div class="form-item">描述 <input v-model="curTwForm.digest" type="text"></div>
          <div class="form-item">作者 <input v-model="curTwForm.author" type="text"></div>
        </div>
        <div class="wx-editor">
          <vue-html5-editor v-model="curTwForm.content" :height="350"></vue-html5-editor>
        </div>
        <div class="upload-img">
          上传封面图片:
          <el-upload class="avatar-uploader" name="image" action="http://rt.badoutec.com/services/biz/index/uploadImg2" :show-file-list="false" :on-success="handleAvatarSuccess">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>
        <div class="form-item" >原文地址 <input v-model="curTwForm.content_source_url" type="text"></div>
        <div class="buttons">
          <el-button type="primary" @click="add">保存推文</el-button> <br>
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
    this.fetchData()
  },
  data() {
    return {
      content: "",
      curTwForm: {
        content: "",
        title: "",
        digest: "",
        thumbData: {}
      },
      twList: [],
    };
  },
  computed:{
    imageUrl(){
      return this.curTwForm.thumbData && this.curTwForm.thumbData.url?  (Site.http.imgBaseUrl + this.curTwForm.thumbData.url) : ''
    }
  },
  methods: {
    fetchData(){
      let curId = this.$route.params.id
      if(curId){
        Site.http.get('/rest/news/'+curId,{},data=>{
          if(data.articles){
            this.twList = data.articles
          }
        })
      }
    },
    add() {
      if(!this.curTwForm.title){
        this.$notify.error('标题不能为空')
        return
      }
      if(!this.curTwForm.content){
        this.$notify.error('内容不能为空')
        return
      }
      if(!this.curTwForm.thumb_media_id){
        this.$notify.error('封面图片不能为空')
        return
      }
      if(!this.curTwForm.content_source_url){
        this.$notify.error('原文地址不能为空')
        return
      }
      if(!this.curTwForm.id){
        console.log(11)
        let newItem = _.clone(this.curTwForm);
        newItem.id = Date.now()
        this.twList.push(newItem);
      }
      this.curTwForm = {}
      this.imageUrl = ''
    },
    handleAvatarSuccess(res, file) {
      // this.imageUrl = Site.http.imgBaseUrl + res.picture.url;
      this.curTwForm.thumbData = res.picture;
      this.curTwForm.thumb_media_id = res.picture.mediaId;
    },
    chooseTw(item) {
      this.curTwForm = item;
    },
    removeItem(delItem) {
      this.twList.forEach((item, index) => {
        if (item == delItem) {
          if(item == this.curTwForm){
            this.curTwForm  =  {}
          }
          this.twList.splice(index, 1);
        }
      });
    },
    save() {
      console.log(this.twList);
      Site.http.post("biz/index/saveArticle", this.twList, data => {
        this.$notify.success('上传成功，请去模版列表页选择发布！')
      });
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
  margin-top: 10px;
}
.tw-list-panel {
  width: 300px;
  flex-shrink: 0;
  background: #fff;
}
.tw-edit-panel {
  flex-grow: 2;
}
.tw-item-title{
  font-weight: bold;
}
.tw-item {
  padding: 0 10px;
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
}
.tw-title{
  width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.remove-item {
  cursor: pointer;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 128px;
  height: 128px;
  line-height: 128px;
  text-align: center;
  background: #fff;
}

.avatar {
  width: 128px;
  height: 128px;
  display: block;
}
.buttons{
 padding: 10px 20px;
}
.upload-img{
 padding: 10px 20px;
}
.form-item{
  padding: 10px 20px;
}
.form-item input{
  width: 300px;
  height: 30px;
  border: 1px solid #d0d0d0;
  border-radius:4px;
}
</style>
