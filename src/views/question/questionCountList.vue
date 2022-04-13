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
      <!-- <el-form-item label="问卷标题">
        <el-input v-model="parms.questionTitle"  placeholder="请输入问卷标题关键字"></el-input>
      </el-form-item> -->
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
      <el-form-item label="学校">
        <el-select filterable v-model="tiaojian.school" placeholder="请选择学校">
          <el-option
            v-for="item in schoolList"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="年级">
        <el-select filterable v-model="tiaojian.grade" placeholder="请选择年级">
          <el-option
            v-for="item in gradeList"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="班级">
        <el-select filterable v-model="tiaojian.classes" placeholder="请选择班级">
          <el-option
            v-for="item in classesList"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
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
            >关闭</el-tag
          >
          <el-tag v-if="scope.row.questionStatus == '1'" type="success" size="normal"
            >调查中</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column align="center" width="400" label="操作">
        <template slot-scope="scope">
           <el-button
            v-if="scope.row.questionType==1"
            type="primary"
            icon="el-icon-edit"
            size="small"
            @click="lookWd(scope.row)"
            
            >维度分析</el-button
          >
          
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="small"
            @click="lookBtn(scope.row)"
            >查看票数</el-button
          >
           <el-button
            type="primary"
            icon="el-icon-edit"
            size="small"
            @click="outExcel(scope.row)"
            >导出</el-button
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
        <div id="printTotal" style="background-color:white;width:100%;height:100%;">
          <div style="display:flex;padding:15px 0 0 0;align-items:baseline;">
            <div style="font-size: 21px;font-weight: 800;padding: 10px 0 0 0;font-family:Microsoft-YaHei;margin-left:20px;color:#000;">{{this.leidatu.questionTitle}}</div>
          </div>
          <div style="background-color:#000;width:150px;height:5px;margin-left:20px;margin-top:10px;"></div>
          <p style="margin-left:20px;margin-right:20px;text-indent:2em;color:#000;font-family:Microsoft-YaHei;">{{this.leidatu.questionDesc}}</p>
          <div style="display:flex;width:100%;height:90%;margin-top:2.5%;">
            <div style="display:flex;width:25%;flex-direction:column;">
              <div style="display:flex;margin:0 auto;align-items:baseline;">
                <div style="font-size:120px;font-weight:800;font-family:Microsoft-YaHei;">{{this.leidatu.length}}</div><span style="font-family:Microsoft-YaHei;">人</span>
              </div>
              <div style="display:flex;border:1px solid #000;border-radius:50px;font-size:20px;font-family:Microsoft-YaHei;justify-content: center;width:200px;height:35px;align-items: center;margin:0 auto;">统计测评人数</div>
              <div style="display:flex;margin:0 auto;align-items:baseline;">
                <div style="font-size:120px;font-weight:800;font-family:Microsoft-YaHei;">99</div><span style="font-family:Microsoft-YaHei;">%</span>
              </div>
              <div style="display:flex;border:1px solid #000;border-radius:50px;font-size:20px;font-family:Microsoft-YaHei;justify-content: center;width:200px;height:35px;align-items: center;margin:0 auto;">作答有效性</div>
            </div>
            <div style="display:flex;width:75%;">
              <div style="display:flex;width:100%;height:100%;border:1px solid red;border-radius:50px;">
                <div style="display:flex;width:95%;height:95%;margin:0 auto;margin-top:1.5%">
                  <div style="display:flex;flex-direction:column;width:70%;margin-top:2%;">
                    <div style="font-size: 25px;font-weight: 800;font-family:Microsoft-YaHei;margin-left:20px;color:#000;">各模块作答情况</div>
                    <div style="font-size: 25px;font-weight: 800;font-family:Microsoft-YaHei;margin-left:20px;color:#000;">Answering Situation</div>
                    <div>
                      <table id="answering-situation">
                        <tr>
                          <th>模块</th>
                          <!-- <th>对应题目</th> -->
                          <th>总分值</th>
                          <th>平均分</th>
                              <th>风险率</th>
                        </tr>
                          <tr v-for="item in this.leidatu.voList">
                          <td>{{item.name}}</td>
                          <!-- <td>1-5</td> -->
                          <td>{{item.max}}</td>
                          <td>{{item.value}}</td>
                              <td>{{parseFloat((item.fxl*100).toPrecision(12))+"%"}}</td>
                        </tr>
                    
                      </table>
                    </div>
                  </div>
                  <div style="display:flex;flex-direction:column;margin-top:2%;">
                    <div style="margin:0 auto;">
                      <div style="font-size: 25px;font-weight: 800;font-family:Microsoft-YaHei;margin-left:20px;color:#000;">各模块雷达分布图</div>
                      <div style="font-size: 25px;font-weight: 800;font-family:Microsoft-YaHei;margin-left:20px;color:#000;">Rader Distribution</div>
                    </div>
                    <div>
                      <div id="myChart" style="width:280px;height:280px;margin:20px auto;">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </template> 
    </sys-dialog>

    <!-- 票数弹框 -->
    <sys-dialog
      :title="addDialog.title"
      :height="addDialog.height"
      :width="addDialog.width"
      :visible="addDialog.visible"
      :print="addDialog.print"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
    <!-- 票数弹框内容 -->
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
          <table style="width: 100%" border="1">
            <thead>
              <th>题目</th>
              <th>选项</th>
              <th>票数</th>
            </thead>
            <tbody>
              <template v-for="item in lookTableList">
                <tr v-for="(m, i) in item.paperChoice" :key="m.chioceId">
                  <td style="width:40%;text-align:center;" v-if='i == 0' :rowspan="item.paperChoice.length">{{item.paperTitle}}</td>
                  <td>{{m.choiceText}}</td>
                  <td>{{m.total}}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </template>

    </sys-dialog>


  </el-main>
</template>

<script>
import { getListApi, getTotalListApi,getTotalWdListApi,getTotalListByTjApi,getQuestionTitleList } from "@/api/question";
import SysDialog from "@/components/system/SysDialog.vue";
import { getToken, setToken, removeToken } from '@/utils/auth';
import axios from 'axios';
// import * as echarts from "echarts"
// const echarts = require('echarts');
export default {
  //注册组件
  components: {
    SysDialog,
  },
  data() {
    return {
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
        '19班','20班','21班'
      ],
      questionTitle: "",
      //统计表格的数据
      lookTableList: [],
      centerDialogVisible: false,
      addDialog: {
        title: "票数统计",
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
      },
      tiaojian:{
        school:"",
        grade:"",
        classes:"",
      },
      leidatu:{
        indicator:[],
        data:[],
        names:[],
        length:'',
        voList:[],
        questionTitle:'',
        questionDesc:'',
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
    //查看票数
    async lookBtn(row) {
      if(this.tiaojian.school==''&&this.tiaojian.grade==''&&this.tiaojian.classes==''){
              //查询统计数据
              let res = await getTotalListApi({ questionId: row.questionId });
              if (res && res.code == 200) {
                console.log('统计数据',res.data.listPaper);
                this.lookTableList = res.data.listPaper;
                this.questionTitle = res.data.questionTitle;
              }
               this.addDialog.visible = true;
      }else{
        console.log("带参数查询")
              //查询统计数据
              let res = await getTotalListByTjApi({ 
                questionId: row.questionId ,
                school:this.tiaojian.school,
                grade:this.tiaojian.grade,
                classes:this.tiaojian.classes
              });
              if (res && res.code == 200) {
                console.log('统计数据',res.data.listPaper);
                this.lookTableList = res.data.listPaper;
                this.questionTitle = res.data.questionTitle;
              }
               this.addDialog.visible = true;
      }
    },
    outExcel (row) {
        let that = this;
        let url = "https://starrykii.club:8099/wxapi/home/exportAll?questionId="+row.questionId+"&school="+that.tiaojian.school+"&grade="+that.tiaojian.grade+"&classes="+that.tiaojian.classes
        let a = document.createElement('a')
        a.setAttribute('download', '学生维度数据.xlsx')
        a.setAttribute('target', '_blank')
        a.setAttribute('href', url);
        a.click();
          // axios.get('https://starrykii.club:8099/wxapi/home/outExcel',{
          //     params: {
          //       questionId:row.questionId,
          //       school:that.tiaojian.school,
          //       grade:that.tiaojian.grade,
          //       classes:that.tiaojian.classes
          //     }
          //   }).then(res=>{
          //     console.log("url",res);

          //   })
    },
    async lookWd(row){
      let that = this;
        //每个人的数据
       axios.get('https://starrykii.club:8099/wxapi/home/getWdByQuestionId',{
              params: {
                questionId:row.questionId,
                school:that.tiaojian.school,
                grade:that.tiaojian.grade,
                classes:that.tiaojian.classes
              }
            }).then(res=>{
              that.leidatu.data=res.data.data.stuWdVos;
              that.leidatu.names=res.data.data.names;
              that.leidatu.indicator=res.data.data.maxList;
              that.leidatu.length = res.data.data.length;
              that.leidatu.voList = res.data.data.voList;
              that.leidatu.questionTitle=row.questionTitle;
               that.leidatu.questionDesc=row.questionDesc;
              this.wdDialog.visible = true;
              this.$nextTick(() => {
              this.drawLine(row);
              });
            }).catch(err=>{
               this.$message.error('符合筛选条件的问卷还未有用户参与回答');
            })
    },
    drawLine(row){
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById('myChart'))
      // 绘制图表
      var option ={
        tooltip : {
          trigger: 'item',
        },
          title: { 
            show:false,
            text: ''+row.questionTitle+' '+this.tiaojian.school+' '+this.tiaojian.grade+' '+this.tiaojian.classes,
            textStyle:{
                  fontSize:"16"
              }
            },
          // legend: {
          //   // type: 'scroll',
          //   // bottom: 40,
          //   orient: 'vertical',
          //   right: '5%',
          //   textStyle: {
          //       color:'#DFE0E5',
          //       fontWeight: 'bold'
          //   },
          //   data:this.leidatu.names,
          //   textStyle:{
          //       color:"#000",
          //       fontSize:"12"
          //   }
          // },
          radar: {
          // shape: 'circle',
          center:['50%','50%'],
          radius:80,
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
            // mark : {show: true},
            // dataView : {show: true, readOnly: true},
            // saveAsImage : {show: true},
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
      this.tiaojian.school="";
      this.tiaojian.grade="";
      this.tiaojian.classes="";
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
table {
  // width: 300px;
  text-align: center;
  border-collapse: collapse; /* 为table设置这个属性 */
}
::v-deep .el-dialog__header{
  background-color: #1890ff;
 
}
::v-deep .el-dialog__title{
   color: #fff;
}
::v-deep .el-dialog__wrapper{
  margin-left: 150px;
  border-radius: 10px;
}
::v-deep .el-icon-close:before{
  color: #fff;
}
#answering-situation {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

#answering-situation td, #answering-situation th {
  border: 1px solid #ddd;
  padding: 8px;
}

#answering-situation tr:nth-child(even){background-color: #f2f2f2;}

#answering-situation tr:hover {background-color: #ddd;}

#answering-situation th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #4CAF50;
  color: white;
}
</style>
