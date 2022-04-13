import http from '@/utils/http'
//保存试题
export async function savePaperApi(parm){
    return await http.post("/api/syspaper/savePaper",parm)
}
//查询试题列表
export async function getPaperListApi(parm){
    return await http.get("/api/syspaper/getPaperList",parm)
}
//查询维度列表
export async function getWdListApi(parm){
    return await http.get("/api/syswd/getWdList",parm)
}
//保存维度
export async function saveWdApi(parm){
    return await http.post("/api/syswd/saveWd",parm)
}