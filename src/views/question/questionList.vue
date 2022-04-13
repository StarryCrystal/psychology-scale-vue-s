<template>
  <el-main>
    <!-- 模糊查询 -->
    <el-form
      :model="parms"
      ref="searchForm"
      label-width="80px"
      :inline="true"
      size="small"
    >
       <el-form-item label="问卷标题">
        <el-select filterable v-model="parms.questionTitle" placeholder="请输入问卷标题关键字">
          <el-option
            v-for="item in questionTitleList"
            :key="item.questionId"
            :label="item.questionTitle"
            :value="item.questionTitle">
          </el-option>
        </el-select>
      </el-form-item>
        <el-button icon="el-icon-search" @click="searchBtn">搜索</el-button>
        <el-button style="color: #ff7670" @click="resetBtn" icon="el-icon-close"
          >重置</el-button
        >
        <el-button type="primary" @click="addBtn" icon="el-icon-plus">新增</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格列表 -->
    <el-table :height="tableHeight" :data="tableList" border stripe>
      <el-table-column prop="questionImg" width="80" label="问卷图片" align="center">
        <template slot-scope="scope">
          <el-image
            style="width: 50px; height: 50px; border-radius: 50%"
            :src="scope.row.questionImg"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="questionType" label="类型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.questionType == '0'" type="success" size="normal"
            >总分制</el-tag
          >
          <el-tag v-if="scope.row.questionType == '1'" type="success" size="normal"
            >分段制</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="questionTitle" label="问卷标题"></el-table-column>
      <el-table-column prop="questionDesc" label="问卷描述"></el-table-column>
      <el-table-column prop="questionOrder" label="问卷序号"></el-table-column>
      <el-table-column prop="questionCode" label="二维码">
        <template slot-scope="scope">
          <div class="demo-image__preview" v-if="scope.row.questionCode">
            <el-image 
              style="width: 100px; height: 100px"
              :src="scope.row.questionCode" 
              :preview-src-list="scope.row.questionCodes">
            </el-image>
          </div>
           <el-button type="primary"  v-if="!scope.row.questionCode" icon="el-icon-edit" size="small" @click="codeImgBtn(scope.row)"
            >生成二维码</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="questionStatus" label="状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.questionStatus == '0'" type="danger" size="normal"
            >关闭/待发布</el-tag
          >
          <el-tag v-if="scope.row.questionStatus == '1'" type="success" size="normal"
            >调查中</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column align="center" width="180" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="small" @click="editBtn(scope.row)"
            >编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteBtn(scope.row)"
            >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 
    @size-change 页容量改变时触发的事件
    @current-change 页数改变时触发的事件
    :current-page  当前第几页 
    :page-sizes 
    :page-size  没有查询几条
     :total 总条数
    -->
    <el-pagination
      @size-change="sizeChange"
      @current-change="currentChange"
      :current-page.sync="parms.currentPage"
      :page-sizes="[10, 20, 40, 80, 100]"
      :page-size="parms.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="parms.total"
      background
    >
    </el-pagination>
    <!-- 新增弹框 -->
    <sys-dialog
      :title="addDialog.title"
      :width="addDialog.width"
      :height="addDialog.height"
      :visible="addDialog.visible"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <template slot="content">
        <el-form
          :model="addModel"
          ref="addForm"
          :rules="rules"
          label-width="80px"
          :inline="false"
          size="small"
        >
         <el-form-item prop="questionType" label="问卷类型">
            <el-radio-group v-model="addModel.questionType">
              <el-radio :label="'0'">总分制</el-radio>
              <el-radio :label="'1'">分段制</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="questionTitle" label="问卷标题">
            <el-input v-model="addModel.questionTitle"></el-input>
          </el-form-item>
          <el-form-item prop="questionDesc" label="问卷描述">
            <el-input type="textarea" v-model="addModel.questionDesc"></el-input>
          </el-form-item>
          <el-form-item prop="questionOrder" label="问卷序号">
            <el-input v-model="addModel.questionOrder"></el-input>
          </el-form-item>
          <el-form-item prop="questionStatus" label="问卷状态"  v-if="addModel.editType!='0'">
            <el-radio-group v-model="addModel.questionStatus">
              <el-radio :label="'1'">发布</el-radio>
              <el-radio :label="'0'">停用/待发布</el-radio>
            </el-radio-group>
          </el-form-item>
           <el-form-item prop="isRandom" label="随机出题">
            <el-radio-group v-model="addModel.isRandom">
              <el-radio :label="'1'">是</el-radio>
              <el-radio :label="'0'">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="questionImg" label="问卷图片">
            <!-- el-upload
            action ：图片上传请求的地址
            :auto-upload 自动上传 
             -->
            <el-upload
              :action="onUpLoad()"
              :on-success="onSuccess"
              :file-list="fileList"
              list-type="picture-card"
              :auto-upload="true"
              :limit="1"
            >
              <i slot="default" class="el-icon-plus"></i>
              <div slot="file" slot-scope="{ file }">
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-preview"
                    @click="handlePictureCardPreview(file)"
                  >
                    <i class="el-icon-zoom-in"></i>
                  </span>
                  <span
                    v-if="!disabled"
                    class="el-upload-list__item-delete"
                    @click="handleRemove(file)"
                  >
                    <i class="el-icon-delete"></i>
                  </span>
                </span>
              </div>
            </el-upload>
            <el-dialog :visible.sync="dialogVisible">
              <img width="100%" :src="dialogImageUrl" alt="" />
            </el-dialog>
          </el-form-item>
        </el-form>
      </template>
    </sys-dialog>
  </el-main>
</template>

<script>
import { getListApi, addApi, editApi, deleteApi,codeImg ,getQuestionTitleList} from "@/api/question";
import SysDialog from "@/components/system/SysDialog.vue"
import { getToken, setToken, removeToken } from '@/utils/auth'
import { baseUrl, imageUrl } from "@/settings";
export default {
  //注册组件
  components: {
    SysDialog,
  },
  data() {
    return {
      codeUrl: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      srcList: [
        'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'
      ],
      fileList: [],
      dialogImageUrl: "",
      dialogVisible: false,
      disabled: false,
      //表单验证规则
      rules: {
        questionImg: [
          {
            trigger: "change",
            required: true,
            message: "请上传图片",
          },
        ],
        questionTitle: [
          {
            trigger: "change",
            required: true,
            message: "请填写问卷标题",
          },
        ],
        questionDesc: [
          {
            trigger: "change",
            required: true,
            message: "请填写问卷描述",
          },
        ],
        questionStatus: [
          {
            trigger: "change",
            required: true,
            message: "请选择问卷状态",
          },
        ],
        questionOrder: [
          {
            trigger: "change",
            required: true,
            message: "请选择问卷序号",
          },
        ],
      },
      //新增或编辑表单绑定的数据域
      addModel: {
        editType: "", //0 新增 1 编辑
        questionId: "",
        questionTitle: "",
        questionDesc: "",
        questionImg: "",
        questionStatus: "",
        questionOrder: "",
        questionType:"",
        isRandom:"",
        userId:"",
      },
      //弹框属性
      addDialog: {
        title: "",
        width: 760,
        height: 410,
        visible: false,
      },
      //表格的高度
      tableHeight: 0,
      //表格数据
      tableList: [],
      //列表参数
      parms: {
        currentPage: 1,
        pageSize: 10,
        questionTitle: "",
        total: 0, //分页用的总条数
        userId:"",//查询对应角色的数据
      },
      questionTitleList:[],
    };
  },
  created() {
    this.getList();
    console.log(getToken());
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 200;
    });
  },
  methods: {
    //图片上传成功的回调
    onSuccess(response, file, fileList) {
      console.log(response);
      console.log(file);
      console.log(fileList);
      this.addModel.questionImg = 'https://starrykii.club:8089' + response;
      this.$message.success("图片上传成功!");
      console.log(this.addModel);
    },
    //图片删除
    handleRemove() {
      this.fileList = [];
      this.addModel.questionImg = "";
    },
    //图片上传请求方法
    onUpLoad() {
      return imageUrl;
    },
    //点击预览
    handlePictureCardPreview(file) {
      console.log(file);
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    //新增按钮
    addBtn() {
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置编辑类型  新增 还是 编辑
      this.addModel.editType = "0";
      // 清空图片
      this.fileList = [];
      //设置弹框属性
      this.addDialog.title = "新增问卷";
      this.addDialog.visible = true;
    },
    //生成二维码
    async codeImgBtn(row){
      console.log(row);
      let res = await codeImg({ questionId: row.questionId });
        if (res && res.code == 200) {
          //信息提示
          this.$message.success(res.msg);
          //刷新表格
          this.getList();
        }
    },
    //删除按钮
    async deleteBtn(row) {
      console.log(row);
      //信息提示
      let confirm = await this.$myconfirm("确定删除该数据吗？");
      if (confirm) {
        let res = await deleteApi({ questionId: row.questionId });
        if (res && res.code == 200) {
          //信息提示
          this.$message.success(res.msg);
          //刷新表格
          this.getList();
        }
      }
    },
    //编辑按钮
    editBtn(row) {
      console.log(row);
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置编辑类型  新增 还是 编辑
      this.addModel.editType = "1";
      //设置弹框属性
      this.addDialog.title = "编辑问卷";
      this.addDialog.visible = true;
      // 清空图片
      this.fileList = [];
      //表单数据赋值
      this.$objCoppy(row, this.addModel);
      //图片回显处理
      if (row.questionImg) {
        let obj = {};
        obj.url = row.questionImg;
        this.fileList.push(obj);
      }
    },
    //弹框确认
    onConfirm() {
      //表单验证
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          let res = null;
          this.addModel.userId = getToken();
          if (this.addModel.editType == "0") {
            //新增
            this.addModel.questionStatus='0';
            res = await addApi(this.addModel);
          } else {
            res = await editApi(this.addModel);
          }
          if (res && res.code == 200) {
            console.log(res);
            //刷新列表
            this.getList();
            //信息提示
            this.$message.success(res.msg);
            this.addDialog.visible = false;
          }
        }
      });
    },
    //弹框关闭
    onClose() {
      this.addDialog.visible = false;
    },
    //重置按钮
    resetBtn() {
      this.parms.questionTitle = "";
      this.getList();
    },
    //搜索按钮
    searchBtn() {
      this.getList();
    },
    //页数改变时触发
    currentChange(val) {
      this.parms.currentPage = val;
      this.getList();
    },
    //页容量改变时触发
    sizeChange(val) {
      this.parms.pageSize = val;
      this.parms.currentPage = 1;
      this.getList();
    },
    //获取列表
    async getList() {
      this.parms.userId = getToken();
      let res = await getListApi(this.parms);
      if (res && res.code == 200) {
        //给表格数据赋值
        this.tableList = res.data.records;
        for ( var i = 0; i <this.tableList.length; i++){
          this.tableList[i].questionCodes = [];
          if(this.tableList[i].questionCode){
            this.tableList[i].questionCodes.push(this.tableList[i].questionCode);
          } 
        }
        console.log("table--",this.tableList);
        //分页总条数
        this.parms.total = res.data.total;
      }
      let ress = await getQuestionTitleList();
      this.questionTitleList = ress.data;
    },
  },
};
</script>

<style lang="scss" scoped></style>
