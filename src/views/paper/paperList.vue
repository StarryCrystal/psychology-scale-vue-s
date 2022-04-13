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
      <el-form-item>
        <el-button icon="el-icon-search" @click="searchBtn">搜索</el-button>
        <el-button style="color: #ff7670" @click="resetBtn" icon="el-icon-close"
          >重置</el-button
        >
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
      <el-table-column prop="questionTitle" label="问卷标题"></el-table-column>
      <el-table-column prop="questionDesc" label="问卷描述"></el-table-column>
      <el-table-column prop="questionOrder" label="问卷序号"></el-table-column>
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
      <el-table-column align="center" width="360" label="操作">
        <template slot-scope="scope">
           <el-button
            type="success"
            icon="el-icon-setting"
            size="small"
            @click="addWd(scope.row)"
            v-if="scope.row.questionType==1"
            >编辑问卷维度</el-button
          >
          <el-button
            type="success"
            icon="el-icon-setting"
            size="small"
            @click="addPaper(scope.row)"
            >设计试题</el-button
          >
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
    <!-- 新增试题设计弹框 -->
    <sys-dialog
      :title="addDialog.title"
      :width="addDialog.width"
      :height="addDialog.height"
      :visible="addDialog.visible"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <template slot="content">
        <el-container style="height: 100%">
          <!-- 左侧分类 -->
          <el-aside class="leftcontainer" width="200px">
            <div class="btns">
              <el-button @click="addPaperData('1')" class="btnitem" size="default"
                >单选题</el-button
              >
              <el-button @click="addPaperData('2')" class="btnitem" size="default"
                >多选题</el-button
              >
              <el-button @click="addPaperData('3')" class="btnitem" size="default"
                >单文本</el-button
              >
              <el-button @click="addPaperData('4')" class="btnitem" size="default"
                >多文本</el-button
              >
            </div>
          </el-aside>
          <!-- 右侧试题 -->
          <el-main style="padding-top: 1px">
            <el-form
              :model="customerFormDodel"
              ref="customerForm"
              label-width="50px"
              :inline="false"
              size="small"
            >
              <div :key="index" v-for="index in customerFormDodel.addModel.length">
                <!-- 单选、多选 -->
                <div
                  v-if="
                    customerFormDodel.addModel[index - 1].paperType == '1' ||
                    customerFormDodel.addModel[index - 1].paperType == '2'
                  "
                  class="papetitem"
                >
                  <!-- <el-row>：代表一行 ，里面的子元素会横向排列
                     <el-col ：代表的是列 
                     :span 代表所占的分数，总分数是 24
                      -->
                  <el-row>
                    <el-col :span="12" :offset="0">
                      <el-form-item :label="index + '、'" label-width="30px" size="small">
                        <el-input
                          v-model="customerFormDodel.addModel[index - 1].paperTitle"
                          size="small"
                        ></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12" :offset="0">
                       <el-select v-model="customerFormDodel.addModel[index - 1].paperCheck" placeholder="效度量"
                       size="small">
                          <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                        </el-select>
                      <el-select v-model="customerFormDodel.addModel[index - 1].wdId" placeholder="选择维度"
                        size="small"
                        v-if="questionType==1"
                        >
                        <el-option
                          v-for="item in wdForm.wdModel"
                          :key="item.wdId"
                          :label="item.wdName"
                          :value="item.wdId">
                        </el-option>
                      </el-select>
                      
                      <el-button
                        size="small"
                        icon="el-icon-plus"
                        @click="addChoice(index)"
                        >新增选项</el-button
                      >
                      <el-button
                        style="margin-left: 15px"
                        type="danger"
                        size="small"
                        icon="el-icon-delete"
                        @click="deletePaper(index)"
                        >删除试题</el-button
                      >
                    </el-col>
                  </el-row>
                  <el-form-item
                    :key="num"
                    v-for="num in customerFormDodel.addModel[index - 1].paperChoice
                      .length"
                    label=""
                    size="small"
                  >
                    <el-row>
                      <el-col :span="10" :offset="0">
                        <el-form-item :label="'选项' + num" size="small">
                          <el-input
                            v-model="
                              customerFormDodel.addModel[index - 1].paperChoice[num - 1]
                                .choiceText
                            "
                            size="small"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="4" :offset="0">
                        <el-form-item label="分数" size="small">
                          <el-input
                            v-model="
                              customerFormDodel.addModel[index - 1].paperChoice[num - 1]
                                .choiceValue
                            "
                            size="small"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="6" :offset="0">
                        <el-form-item label="序号" size="small">
                          <el-input
                            v-model="
                              customerFormDodel.addModel[index - 1].paperChoice[num - 1]
                                .choiceOrder
                            "
                            size="small"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="2" :offset="0">
                        <el-button
                          style="color: #ff7670; margin-left: 15px"
                          size="small"
                          circle
                          icon="el-icon-close"
                          @click="deleteChoice(index, num)"
                        ></el-button>
                      </el-col>
                    </el-row>
                  </el-form-item>
                </div>
                <!-- 单文本 -->
                <div
                  v-if="customerFormDodel.addModel[index - 1].paperType == '3'"
                  class="papetitem"
                >
                  <el-row>
                    <el-col :span="16" :offset="0">
                      <el-form-item :label="index + '、'" label-width="30px" size="small">
                        <el-input
                          v-model="customerFormDodel.addModel[index - 1].paperTitle"
                          size="small"
                        ></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col class="delBtn" :span="8" :offset="0">
                       <el-select v-model="customerFormDodel.addModel[index - 1].paperCheck" placeholder="效度量"
                       size="small">
                          <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                        </el-select>
                       <el-select v-model="customerFormDodel.addModel[index - 1].wdId" placeholder="选择维度"
                        size="small"
                        v-if="questionType==1"
                        >
                        <el-option
                          v-for="item in wdForm.wdModel"
                          :key="item.wdId"
                          :label="item.wdName"
                          :value="item.wdId">
                        </el-option>
                      </el-select>
                      <el-button
                        @click="deletePaper(index)"
                        style="margin-left: 15px"
                        type="danger"
                        icon="el-icon-delete"
                        size="small"
                        >删除试题</el-button
                      >
                    </el-col>
                  </el-row>
                </div>
                <!-- 多文本 -->
                <div
                  v-if="customerFormDodel.addModel[index - 1].paperType == '4'"
                  class="papetitem"
                >
                  <el-row>
                    <el-col :span="16" :offset="0">
                      <el-form-item :label="index + '、'" label-width="30px" size="small">
                        <el-input
                          v-model="customerFormDodel.addModel[index - 1].paperTitle"
                          type="textarea"
                          size="small"
                        ></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col class="delBtn" :span="8" :offset="0">
                       <el-select v-model="customerFormDodel.addModel[index - 1].paperCheck" placeholder="效度量"
                       size="small">
                          <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                        </el-select>
                          <el-select v-model="customerFormDodel.addModel[index - 1].wdId" placeholder="选择维度"
                        size="small"
                        v-if="questionType==1"
                        >
                        <el-option
                          v-for="item in wdForm.wdModel"
                          :key="item.wdId"
                          :label="item.wdName"
                          :value="item.wdId">
                        </el-option>
                      </el-select>
                      <el-button
                        @click="deletePaper(index)"
                        style="margin-left: 15px"
                        type="danger"
                        icon="el-icon-delete"
                        size="small"
                        >删除试题</el-button
                      >
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-form>
          </el-main>
        </el-container>
      </template>
    </sys-dialog>
    <!-- 新增维度设计弹框 -->
     <sys-dialog
      :title="addDialog.wdtitle"
      :width="addDialog.width"
      :height="addDialog.height"
      :visible="addDialog.wdvisible"
      @onClose="onWdClose"
      @onConfirm="onWdConfirm"
    >
       <template slot="content">
        <el-container style="height: 100%">
          <!-- 左侧分类 -->
          <el-aside class="leftcontainer" width="200px">
            <div class="btns">
              <el-button @click="addWdData()" class="btnitem" size="default"
                >新增维度</el-button
              >
            </div>
          </el-aside>
          <!-- 右侧试题 -->
          <el-main style="padding-top: 1px">
            <el-form
              :model="customerFormDodel"
              ref="customerForm"
              label-width="50px"
              :inline="false"
              size="small"
            >
              <div :key="index" v-for="index in wdForm.wdModel.length">
                <div
                  class="papetitem"
                >
                  <el-row>
                    <el-col :span="17" :offset="0">
                      <el-form-item :label="index + '、'" label-width="30px" size="small">
                        <el-input
                          v-model="wdForm.wdModel[index - 1].wdName"
                          size="small"
                        ></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col class="delBtn" :span="7" :offset="0">
                      <el-button
                        @click="deleteWd(index)"
                        style="margin-left: 15px"
                        type="danger"
                        icon="el-icon-delete"
                        size="small"
                        >删除</el-button
                      >
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-form>
          </el-main>
        </el-container>
      </template>
    </sys-dialog>
  </el-main>
</template>

<script>
import { getListApi,getQuestionTitleList } from "@/api/question";
import SysDialog from "@/components/system/SysDialog.vue";
import { savePaperApi, getPaperListApi,getWdListApi,saveWdApi } from "@/api/paper";
import { getToken, setToken, removeToken } from '@/utils/auth'
export default {
  //注册组件
  components: {
    SysDialog,
  },
  data() {
    return {
      options: [{
          value: '0',
          label: '非效度量'
        }, {
          value: '1',
          label: '效度量'
        }],
        value: '',

      //问卷类型
      questionType:"",
      //问卷id
      questionId: "",
      //试题绑定的数据域
      customerFormDodel: {
        addModel: [],
      },
      //维度表单
      wdForm:{
        wdModel:[],
      },
      //弹框属性
      addDialog: {
        title: "",
        width: 1200,
        height: 600,
        visible: false,
        wdvisible:false,
        wdtitle:"",
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
        userId:"",
      },
       questionTitleList:[],
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 200;
    });
  },
  methods: {
    // 删除选项
    deleteChoice(index, num) {
      this.customerFormDodel.addModel[index - 1].paperChoice.splice(num - 1, 1);
    },
    //新增选择题的选项
    addChoice(index) {
      console.log(index);
      this.customerFormDodel.addModel[index - 1].paperChoice.push({
        choiceText: "",
        choiceOrder: "",
      });
    },
    //删除维度
    deleteWd(index){
        this.wdForm.wdModel.splice(index - 1, 1);
    },

    //删除试题
    deletePaper(index) {
      this.customerFormDodel.addModel.splice(index - 1, 1);
    },
    //弹框确认事件
    async onConfirm() {
      if (this.customerFormDodel.addModel.length < 1) {
        this.$message.warning("请设计试题!");
        return;
      }
      let res = await savePaperApi(this.customerFormDodel.addModel);
      if (res && res.code == 200) {
        this.addDialog.visible = false;
        this.$message.success(res.msg);
      }
      console.log(this.customerFormDodel.addModel);
    },
    //弹框关闭事件
    onClose() {
      this.addDialog.visible = false;
    },
    //弹框关闭事件
    onWdClose() {
      this.addDialog.wdvisible = false;
    },
    //维度弹框确认事件
    async onWdConfirm() {
      if (this.wdForm.wdModel.length < 1) {
        this.$message.warning("请设计维度!");
        return;
      }
      let res = await saveWdApi(this.wdForm.wdModel);
      if (res && res.code == 200) {
        this.addDialog.wdvisible = false;
        this.$message.success(res.msg);
      }
      console.log("wdsave",this.wdForm.wdModel);
    },
    //维度弹框新增事件
    async addWd(row){
        if(row.questionStatus=='1'){
          //调查中，不允许修改题目和选项，或者会对答题数据造成影响
          this.$message.error("该问卷正在调查中，不允许修改题目造成已答题的数据错误");
        }else{
            //清空数据
          this.wdForm.wdModel = [];
            //设置问卷id
          this.questionId = row.questionId;
          //先查询该问卷是否存在维度，如果存在，回显；
          //不存在，初始维度表单数据
          let res = await getWdListApi({ questionId: this.questionId });
          if (res && res.code == 200) {
          console.log("维度");
          console.log(res);
          if (res.data && res.data.length > 0) {
            //设置返回的维度数据
            this.wdForm.wdModel = res.data;
          } else {
            this.addWdData();
          }
        } else {
          this.addWdData();
          }
        //设置弹框属性
        this.addDialog.wdtitle = "设计维度";
          this.addDialog.wdvisible = true;
        }
        
        
    },

    //设计试题按钮
    async addPaper(row) {
      if(row.questionStatus=='1'){
          //调查中，不允许修改题目和选项，或者会对答题数据造成影响
          this.$message.error("该问卷正在调查中，不允许修改题目造成已答题的数据错误");
      }else{
         //清空数据
        this.wdForm.wdModel = [];
        console.log(row);
        //清空数据
        this.customerFormDodel.addModel = [];
        //设置问卷id
        this.questionId = row.questionId;
        let wdres = await getWdListApi({ questionId: this.questionId });
        if (wdres.data && wdres.data.length > 0) {
            //设置返回的维度数据
            this.wdForm.wdModel = wdres.data;
        }
        
        if(this.wdForm.wdModel.length==0&&row.questionType==1){
          //先设计维度，再设计试题
          console.log("sss",row.questionType);
           this.$message.error("请先设计分段试卷的涉及维度，再设计试题");
        }else{
            //先查询该问卷是否存在试题，如果存在，回显；
            //不存在，初始表单数据，默认展示一个单选题
            let res = await getPaperListApi({ questionId: this.questionId });
            if (res && res.code == 200) {
              if (res.data && res.data.length > 0) {
                //设置返回的试题数据
                this.customerFormDodel.addModel = res.data;
                console.log("xxx",this.customerFormDodel.addModel);
              } else {
                this.addPaperData("1");
              }
            } else {
              this.addPaperData("1");
            }
            //设置弹框属性
            this.addDialog.title = "为【" + row.questionTitle + "】设计试题";
            this.questionType = row.questionType;
            this.addDialog.visible = true;
        }
      
      }
      
    },
    //新增维度前端
    addWdData(){
       //试题的数据格式，根据数据库字段所得
      let objModel = {
        questionId: "",
        wdName:"",
      };
      //设置问卷id
      objModel.questionId = this.questionId;
      //设置到表单绑定的数据域
      this.wdForm.wdModel.push(objModel);
    },

    addPaperData(type) {
      //试题的数据格式，根据数据库字段所得
      let objModel = {
        paperId: "",
        questionId: "",
        paperTitle: "",
        paperType: "",
        paperOrder: "",
        //试题的选项
        paperChoice: [],
      };
      //如果是单选题或者多选题，需要设置选项
      if (type == "1" || type == "2") {
        let obj = {
          choiceText: "",
          choiceOrder: "",
        };
        objModel.paperChoice.push(obj);
      }
      //设置问卷id
      objModel.questionId = this.questionId;
      //设置试题的类型
      objModel.paperType = type;
      //设置到表单绑定的数据域
      this.customerFormDodel.addModel.push(objModel);
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
        //分页总条数
        this.parms.total = res.data.total;
      }
      let ress = await getQuestionTitleList();
      this.questionTitleList = ress.data;
    },
  },
};
</script>

<style lang="scss" scoped>
.leftcontainer {
  border-right: 1px solid #e8eaec;
}
.wd{
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}
.btns {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-right: 10px;
}
.btnitem {
  width: 100%;
  margin-left: 0px;
  margin-bottom: 10px;
}
.delBtn {
  display: flex;
  justify-content: flex-end;
  padding-right: 15px;
}
.papetitem {
  border-bottom: 1px solid #e8eaec;
  padding-top: 20px;
}
</style>
