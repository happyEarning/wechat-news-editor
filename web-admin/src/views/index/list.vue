<template>
  <div class="page">
    <div class="flex search-box">
      <el-form :inline="true">
        <el-button type="primary" @click="addTag">新增</el-button>
      </el-form>
    </div>
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column prop="key" label="关键词" width="180">
      </el-table-column>
      <el-table-column prop="value" label="value" width="180">
      </el-table-column>
      <el-table-column prop="date" label="创建时间">
        <template scope="scope">
          {{$moment(scope.row.createdAt).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="200" class-name="cell-cneter">
        <template scope="scope">
          <el-button @click="editItem(scope)" type="text">编辑</el-button>
          <el-button @click="deleteItem(scope)" type="text">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @current-change="handleCurrentChange" :current-page="searchModel.pageNo" :page-size="20" layout="total, prev, pager, next" :total="dataCount" class="flex pagination">
    </el-pagination>
    <el-dialog title="编辑标签" :visible.sync="dialogFormVisible">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="关键词" prop="key">
          <el-input v-model="form.key"></el-input>
        </el-form-item>
        <el-form-item label="回复" prop="value">
          <el-input v-model="form.value"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveTag">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "list",
  created() {
    this.fetchData();
    this.getCount();
  },
  activated() {
    const breadcrumbs = [{ text: "标签", url: "" }];
    this.$store.commit("updateBreadcrumb", breadcrumbs);
  },
  data() {
    return {
      tableData: [],
      dataCount: 0,
      searchModel: {
        type: "",
        pageNo: 1,
        pageSize: 20
      },
      dialogFormVisible: false,
      form: {
        key: "",
        value: ""
      },
      rules: {
        key: { required: true, message: "请选择关键词", trigger: "blur" },
        value: { required: true, message: "请输入内容", trigger: "blur" }
      }
    };
  },
  methods: {
    addTag() {
      this.form = { key: "", value: "" };
      this.dialogFormVisible = true;
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },
    handleCurrentChange(val) {
      console.log(val)
      this.searchModel.pageNo = +val;
      this.fetchData();
    },
    fetchData: function() {
      let pageSize = this.searchModel.pageSize,
        skip = (this.searchModel.pageNo - 1) * pageSize;
      let query = {};
      if (this.searchModel.type) {
        query.type = this.searchModel.type;
      }
      Site.http.get(
        "/rest/messages",
        {
          query: JSON.stringify(query),
          sort: "-createdAt",
          skip: skip,
          limit: pageSize
        },
        data => {
          this.tableData = data;
        }
      );
    },
    getCount() {
      let query = {};
      if (this.searchModel.type) {
        query.type = this.searchModel.type;
      }
      Site.http.get("/rest/messages/count", {query: JSON.stringify(query)}, data => {
        this.dataCount = data.count;
      });
    },
    editItem(scope) {
      this.form = Object.assign({}, scope.row);
      this.dialogFormVisible = true;
    },
    deleteItem(scope) {
      this.$confirm("确认删除？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          Site.http.delete("/rest/messages/" + scope.row._id, {}, data => {
            this.$message({
              type: "success",
              message: "删除成功!"
            });
            this.fetchData();
            this.getCount();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    saveTag() {
      this.$refs.form.validate(result => {
        if (result) {
          this.dialogFormVisible = false;
          this.postData();
        } else {
        }
      });
    },
    postData() {
      if (this.form._id) {
        Site.http.patch(
          "/rest/messages/" + this.form._id,
          { key: this.form.key, value: this.form.value },
          data => {
            this.fetchData();
            this.getCount();
            this.$refs.form.resetFields();
          }
        );
      } else {
        Site.http.post("/rest/messages", this.form, data => {
          this.fetchData();
          this.getCount();
          this.$refs.form.resetFields();
        });
      }
    },
    typeChange() {
      this.searchModel.pageNo = 1;
      this.fetchData();
      this.getCount();
    }
  }
};
</script>

<style scoped>
.page {
  padding: 20px;
}
</style>
