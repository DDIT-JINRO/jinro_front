import axios from 'axios'

export const API_SERVER_HOST = 'http://localhost:8080'
const prefix = `${API_SERVER_HOST}/roadmap`

axios.defaults.withCredentials = true;
// async 함수의 리턴은 무조건 Promise
// res.data를 반환한다고 착각하지 않기

export const selectMemberRoadmap = async () => {
   const res = await axios.get(`${prefix}/selectMemberRoadmap`);
   return res.data;
}