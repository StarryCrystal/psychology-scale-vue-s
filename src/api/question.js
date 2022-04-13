import http from '@/utils/http'
//获取列表
export async function getListApi(parm){
    return await http.get("/api/question/list",parm)
}
//获取答题列表
export async function getAnswerList(parm){
    return await http.get("/api/question/getAnswerList",parm)
}
//生成二维码
export async function codeImg(parm){
    return await http.get("/api/question/codeImg",parm)
}
//新增问卷
export async function addApi(parm){
    return await http.post("/api/question",parm)
}
//编辑
export async function editApi(parm){
    return await http.put("/api/question",parm)
}
//删除
export async function deleteApi(parm){
    return await http.delete("/api/question",parm)
}
//统计查询
export async function getTotalListApi(parm){
    return await http.get("/api/question/getTotalList",parm)
}
//统计查询
export async function getTotalListByTjApi(parm){
    return await http.get("/api/question/getTotalListTj",parm)
}
//问卷各维度总分
export async function getTotalWdListApi(parm){
    return await http.get("/api/question/getWdMax",parm)
}
//编辑微信学生用户
export async function getWdByOpenids(parm){
    return await http.postWx("wxapi/home/getWdByOpenids",parm)
}

//编辑微信学生用户
export async function viewpdf(parm){
    return await http.postWx("wxapi/home/savepdf",parm)
}

//统计查询
export async function getQuestionTitleList(parm){
    return await http.get("/api/question/getQuestionTitleList",parm)
}