import request from '@/utils/request'
import http from '@/utils/http'
export async function login(parm){
return http.post("/api/user/login",parm)
}
export function getInfo(token) {
return http.get("/api/user/getInfo",{userId:token})
}

export function logout() {
return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
})
}
//编辑学校
export async function editSchool(parm){
return await http.postWx("wxapi/school/editSchool",parm)
}
//新增学校
export async function addSchool(parm){
return await http.postWx("wxapi/school/addSchool",parm)
}
//删除学校
export async function deleteSchool(parm){
    return await http.deletewx("wxapi/school",parm)
}
