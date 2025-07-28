import axios from 'axios'
const backUrl = import.meta.env.VITE_BACK_END_URL;

const prefix = `${backUrl}/roadmap`

axios.defaults.withCredentials = true;
// async 함수의 리턴은 무조건 Promise
// res.data를 반환한다고 착각하지 않기

// 현재 로그인한 멤버의 로드맵 정보를 조회
export const selectMemberRoadmap = async () => {
   const res = await axios.get(`${prefix}/selectMemberRoadmap`);
   return res.data;
}

// 전체 미션 목록을 조회
export const selectMissionList = async () => {
   const res = await axios.get(`${prefix}/selectMissionList`);
   return res.data;
}

/**
 * 특정 미션을 완료 상태로 업데이트
 * @param {number} rsId - 완료할 미션의 ID
 */
export const updateCompleteMission = async (rsId) => {
   const res = await axios.post(`${prefix}/updateCompleteMission`, {rsId : rsId});
   return res.data;
}
 
/**
 * 새로운 미션 삽입
 * @param {number} rsId - 미션 ID
 * @param {string} dueDate - 완료 예정일 (YYYY-MM-DD 형식)
 */
export const insertMission = async (rsId, dueDate) => {
   const res = await axios.post(`${prefix}/insertMission`, {rsId : rsId, dueDate : dueDate});
   return res.data;
}

/**
 * 미션의 완료 예정일 업데이트
 * @param {number} rsId - 미션 ID
 * @param {string} newDueDate - 새로운 완료 예정일 (YYYY-MM-DD 형식)
 */
export const updateDueDate = async (rsId, newDueDate) => {
   const res = await axios.post(`${prefix}/updateDueDate`, {rsId : rsId, dueDate : newDueDate});
   return res.data;
}

// 로드맵 결과 데이터를 조회
export const selectResultData = async () => {
   const res = await axios.get(`${prefix}/selectResultData`);
   return res.data;
}