<template>
  <div class="page">
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column prop="mediaId" label="mediaId" width="180">
      </el-table-column>
      <el-table-column prop="title" label="首篇标题" width="180">
      </el-table-column>
      <el-table-column prop="date" label="创建时间">
        <template scope="scope">
          {{$moment(scope.row.createdAt).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="200" class-name="cell-cneter">
        <template scope="scope">
          <el-button @click="sendItem(scope)" type="text">发布</el-button>
          <el-button @click="goItem(scope)" type="text">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "detail",
  data() {
    return {
      tableData: []
    };
  },
  computed: {},
  activated: function() {
    const breadcrumbs = [{ text: "list", url: "" }];
    this.$store.commit("updateBreadcrumb", breadcrumbs);
    this.fetchData();
  },
  methods: {
    fetchData() {
      Site.http.get("/rest/news/", {}, data => {
        this.tableData = data.map(item => {
          if (item.articles && item.articles[0]) {
            item.title = item.articles[0].title;
          }
          return item;
        });
      });
    },
    goItem(scope) {
      this.$router.push({
        path: "/detail/" + scope.row._id
      });
    },
    sendItem(scope) {
      Site.http.post(
        "biz/index/sendNews",
        { media_id: scope.row.mediaId },
        data => {
           this.$notify.success('发布成功！')
        }
      );
    }
  }
};
</script>

<style>
.form {
  max-width: 750px;
}

.qrcode-img {
  max-width: 250px;
}

.img-list {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

.item-img {
  max-width: 250px;
  margin: 10px;
}
</style>
