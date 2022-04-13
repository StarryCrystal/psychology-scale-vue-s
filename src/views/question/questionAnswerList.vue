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
      <el-form-item label="学生姓名">
        <el-input v-model="parms.wxname"></el-input>
      </el-form-item>
      <el-form-item label="学校">
        <el-select filterable v-model="parms.school" placeholder="请选择学校">
          <el-option
            v-for="item in schoolList"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="年级">
        <el-select filterable v-model="parms.grade" placeholder="请选择年级">
          <el-option
            v-for="item in gradeList"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="班级">
        <el-select filterable v-model="parms.classes" placeholder="请选择班级">
          <el-option
            v-for="item in classesList"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="searchBtn">搜索</el-button>
        <el-button style="color: #ff7670" @click="resetBtn" icon="el-icon-close"
          >重置</el-button
        >
         <el-button icon="el-icon-edit" @click="handle">维度分析</el-button>
         <el-button icon="el-icon-edit" @click="pdf"  v-loading.fullscreen.lock="loading">导出pdf</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格列表 -->
    <el-table :height="tableHeight" :data="tableList" border stripe row-key="openid" ref="table">
         <el-table-column
        type="selection"
        width="55"
        :reserve-selection="true">
      </el-table-column>
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
      <el-table-column prop="name" label="答题人姓名"></el-table-column>
      <el-table-column prop="questionStatus" label="状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.questionStatus == '0'" type="danger" size="normal"
            >关闭</el-tag
          >
          <el-tag v-if="scope.row.questionStatus == '1'" type="success" size="normal"
            >调查中</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column align="center" width="300" label="操作">
        <template slot-scope="scope">
          <!-- <el-button
            v-if="scope.row.questionType==1"
            type="primary"
            icon="el-icon-edit"
            size="small"
            @click="lookWd(scope.row)"
            >维度分析</el-button
          > -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="small"
            @click="lookBtn(scope.row)"
            >答题详情</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 答题详情弹框 -->
    <sys-dialog
      :title="addDialog.title"
      :height="addDialog.height"
      :width="addDialog.width"
      :visible="addDialog.visible"
      :print="addDialog.print"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <template slot="content">
        <div id="printTotal">
          <div
            style="
              text-align: center;
              font-size: 21px;
              font-weight: 600;
              padding: 10px 0px;
            "
          >
            {{ questionTitle }}
          </div>
          <div class="item" v-for="(paper, index) in paperList" :key="index">
              <!-- 标题 -->
                <div class="title">
                  {{index+1+'、'+paper.paperTitle}}
                </div>
                <!-- 试题选项 -->
      <div class="choiceList">
        <!-- 判断是单选、多选、单文本、多文本 -->
        <!-- 单选 -->
        <el-radio-group  v-model="paper.checkedChioceIds[0]"  v-if="paper.paperType == '1'">
          <el-radio disabled :label="choice.chioceId"  v-for="choice in paper.paperChoice" :key="choice.chioceId">{{choice.choiceText}}</el-radio>
        </el-radio-group>


        <el-checkbox-group v-model="paper.checkedChioceIds" v-if="paper.paperType == '2'">
          <el-checkbox disabled :label="choice.chioceId" v-for="choice in paper.paperChoice" :key="choice.chioceId">{{choice.choiceText}}</el-checkbox>
        </el-checkbox-group>

        <!--单文本-->
          <el-input
            placeholder="无"
            v-model="paper.paperValue"
            :disabled="true"  v-if="paper.paperType == '3'">
          </el-input>
         <!--多文本-->
          <el-input
            type="textarea"
            :rows="4"
            :disabled="true"
            placeholder="无"
            v-model="paper.paperValue"  v-if="paper.paperType == '4'">
          </el-input>
        </div>
          </div>
        </div>
      </template>
    </sys-dialog>

     <!-- 维度弹框 -->
    <sys-dialog
      :title="wdDialog.title"
      :height="wdDialog.height"
      :width="wdDialog.width"
      :visible="wdDialog.visible"
      :print="wdDialog.print"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
    <!-- 维度弹框内容 -->
      <template slot="content">
        <div id="printTotal">
          <div style="text-align: center;font-size: 21px;font-weight: 600;padding: 10px 0px;"></div>
          <div id="myChart" style="width:500px;height:400px;margin:0 auto;"></div>
        </div>
      </template>
    </sys-dialog>

  </el-main>
</template>

<script>
import { getListApi, getTotalListApi , getAnswerList,getWdByOpenids,viewpdf,getQuestionTitleList} from "@/api/question";
import SysDialog from "@/components/system/SysDialog.vue";
import { getToken, setToken, removeToken } from '@/utils/auth'
import axios from 'axios'
export default {
  //注册组件
  components: {
    SysDialog,
  },
  data() {
    return {
      loading: false,
      schoolList: [],
      gradeList:[
        '一年级',
        '二年级',
        '三年级',
        '四年级',
        '五年级',
        '六年级',
        '七年级',
        '八年级',
        '九年级'
      ],
      classesList:[
        '1班','2班','3班','4班','5班','6班',
        '7班','8班','9班','10班','11班','12班',
        '13班','14班','15班','16班','17班','18班',
        '19班','20班'
      ],
      questionTitle: "",
      //统计表格的数据
      lookTableList: [],
      addDialog: {
        title: "答题详情",
        height: 500,
        width: 950,
        visible: false,
        print:true
      },
       wdDialog:{
        title: "维度分析",
        height: 500,
        width: 950,
        visible: false,
        print:true
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
        wxname:"",
        school:"",
        grade:"",
        classes:"",
      },
      paperList:[],
      leidatu:{
        indicator:[],
        data:[],
        names:[],
        questionTitle:'',
      },
      questionTitleList:[],
    };
  },
  created() {
     this.getGradeList();
    this.getClassList();
    this.getList();
    //只获取一次学校列表,在页面加载完成后
    this.getSchoolList();
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 200;
    });
  },
  methods: {
     //获取年级列表
      async getGradeList(){
         axios.get('https://starrykii.club:8099/wxapi/wxuser/getGradeList').then(
           res=>{
             console.log(res);
              //给表格数据赋值
              this.gradeList = res.data.data;
           }
         );
      },
      //获取班级列表
      async getClassList(){
         axios.get('https://starrykii.club:8099/wxapi/wxuser/getClassList').then(
           res=>{
             console.log(res);
              //给表格数据赋值
              this.classesList = res.data.data;
           }
         );
      },
    //获取学校列表
    async getSchoolList(){
      axios.get('https://starrykii.club:8099/wxapi/school/getSchoolListByName',{
        params:{
          schoolName : ''
        }
      }).then(res=>{
        console.log("学校列表",res);
        //给表格数据赋值
        this.schoolList = res.data.data;
      })
    },
    //弹框确认
    onConfirm() {
      this.addDialog.visible = false;
      this.wdDialog.visible = false;
    },
    //弹框的关闭
    onClose() {
      this.addDialog.visible = false;
      this.wdDialog.visible = false;
    },


    //查看答题信息
    async lookBtn(row) {
      axios.get('https://starrykii.club:8099/wxapi/home/getMyPaperListShow',{
          params: {
            openid:row.openid,
            questionId:row.questionId
          }
        }).then(res=>{
          this.paperList=res.data.data.listPaper;
          console.log(this.paperList)
        })
    this.addDialog.visible = true;

    },

    async lookWd(row) {
      this.wdDialog.visible = true;
    },
     drawLine(){
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById('myChart'))
      // 绘制图表
      var option ={
        tooltip : {
          trigger: 'item',
        },
          title: { 
            text: this.leidatu.questionTitle,
            textStyle:{
                  fontSize:"16"
              }
            },
          legend: {
            // type: 'scroll',
            // bottom: 40,
            orient: 'vertical',
            right: '5%',
            textStyle: {
                color:'#DFE0E5',
                fontWeight: 'bold'
            },
            data:this.leidatu.names,
            textStyle:{
                color:"#000",
                fontSize:"12"
            }
          },
          radar: {
          // shape: 'circle',
          center:['50%','35%'],
          radius:100,
          indicator: this.leidatu.indicator,
          
          splitNumber: 0, // 雷达图圈数设置
          name: {
            textStyle: {
                color: '#000',
                padding:[-10,-10]
            },
          },
          //雷达图背景的颜色，在这儿随便设置了一个颜色，完全不透明度为0，就实现了透明背景
        splitArea : {
            show : false,
            areaStyle : {
                color: 'rgba(255,0,0,0)', // 图表背景的颜色
            },
        },
        splitLine : {
            show : true,
            lineStyle : {
                width : 1,
                color: '#1890ff', // 设置网格的颜色
            },
        },
        // 设置雷达图中间射线的颜色
        axisLine: {
            lineStyle: {
                // width:0.5,
                color: '#1890ff',
            },
        },
          },
        toolbox: {
          top:'40%',
          left: '5%',
          show : true,
          feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: true},
            saveAsImage : {show: true},
          }
        },
        calculable : true,
        series: [
          {
            // name: 'Budget vs spending',
            type: 'radar',
            symbol: "none",
            
            data: this.leidatu.data
          }
        ]
      };
      myChart.setOption(option);
        // 让图表跟随屏幕自动的去适应
        window.addEventListener('resize', function () {
            myChart.resize()
        })

    },
    //重置按钮
    resetBtn() {
      this.parms.questionTitle = "";
      this.parms.wxname="";
      this.parms.school="";
      this.parms.grade="";
      this.parms.classes="";
      this.getList();
    },
    //搜索按钮
    searchBtn() {
      this.getList();
    },
    //获取列表
    async getList() {
      this.parms.userId = getToken();
      let res = await getAnswerList(this.parms);
      if (res && res.code == 200) {
        //给表格数据赋值
        this.tableList = res.data;
      }
      console.log(res);
      let ress = await getQuestionTitleList();
      this.questionTitleList = ress.data;
    },
   async pdf(){
      var arr =this.$refs.table.selection;
      var qId = '';
      var qtile='';
      if(arr.length>0){
         qId = arr[0].questionId;
         qtile = arr[0].questionTitle;
         var openids = [];
      var isFD = true ; 
       for ( var i = 0; i <arr.length; i++){
         if(arr[i].questionType !='1'){
           //不是分段类型试卷，没有雷达图分析
           //直接退出循环，中断
              this.$message.error('只能选择分段式试卷进行维度分析');
                isFD=false;
                break;
            }
            if(arr[i].questionId !=qId){
                this.$message.error('只能选择同一张问卷的数据,请搜索问卷标题进行筛选');
                isFD=false;
                break;
            }
              // console.log(arr[i].openid);
              openids.push(arr[i].openid);
          }
          if(isFD){
               this.loading=true;
              // console.log(openids)
              var openids = {
                questionId:qId,
                openids:openids
              }
              let res = await viewpdf(openids);
              let url = res.data.data;
              if(res.data.code==200){
                  console.log("url",url);
                 let a = document.createElement('a')
                  // a.setAttribute('download', '学生维度数据.pdf')
                  a.setAttribute('target', '_blank')
                  a.setAttribute('href', url);
                  a.click();
                  // window.open(url);
                  this.loading=false;
              }
          }

      }else{
        this.$message.error('未选择数据条目');
      }      
    },
    //获取到选中行的数据
    async handle() {
      console.log("duoxuan",this.$refs.table.selection)
      var arr =this.$refs.table.selection;
      var qId = '';
      var qtile='';
      if(arr.length>0){
         qId = arr[0].questionId;
         qtile = arr[0].questionTitle;
         var openids = [];
      var isFD = true ; 
       for ( var i = 0; i <arr.length; i++){
         if(arr[i].questionType !='1'){
           //不是分段类型试卷，没有雷达图分析
           //直接退出循环，中断
              this.$message.error('只能选择分段式试卷进行维度分析');
                isFD=false;
                break;
            }
            if(arr[i].questionId !=qId){
                this.$message.error('只能选择同一张问卷的数据,请搜索问卷标题进行筛选');
                isFD=false;
                break;
            }
              // console.log(arr[i].openid);
              openids.push(arr[i].openid);
          }
          if(isFD){
              // console.log(openids)
              var openids = {
                questionId:qId,
                openids:openids
              }
              let res = await getWdByOpenids(openids);
              console.log('sss',res.data);
              if (res.data && res.data.code == 200) {
                  console.log('sss',res.data);
                  // this.$message.success('查询成功');
                  //给雷达图数据赋值
                  this.leidatu.indicator=res.data.data.maxList;
                  this.leidatu.names=res.data.data.names;
                  this.leidatu.data=res.data.data.stuWdVos;
                  this.leidatu.questionTitle=qtile;
                  //打开窗口,画雷达图
                  this.wdDialog.visible = true;
                  this.$nextTick(() => {
                  // this.tableHeight = window.innerHeight - 200;
                  this.drawLine();
                  // this.initCharts();
              });
              }
          }

      }else{
        this.$message.error('未选择数据条目');
      }      
    },
    
  },
};
</script>

<style lang="scss" scoped>

</style>
