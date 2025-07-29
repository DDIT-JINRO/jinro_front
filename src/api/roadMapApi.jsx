import axios from "axios";
const backUrl = import.meta.env.VITE_BACK_END_URL;

const prefix = `${backUrl}/roadmap`;

axios.defaults.withCredentials = true;
// async 함수의 리턴은 무조건 Promise
// res.data를 반환한다고 착각하지 않기

// 현재 로그인한 멤버의 로드맵 정보를 조회
export const selectMemberRoadmap = async () => {
  try {
    const res = await axios.get(`${prefix}/selectMemberRoadmap`);

    if (!res.data) { 
      throw new Error("로드맵 정보를 불러오는 중 오류가 발생하였습니다.");
    }

    return res.data;
  } catch (error) {
    handleApiError(error, "로드맵 정보 조회"); 
  }
};

// 전체 미션 목록을 조회
export const selectMissionList = async () => {
  try {
    const res = await axios.get(`${prefix}/selectMissionList`);

    if (!res.data) { 
      throw new Error("미션 리스트를 불러오는 중 오류가 발생하였습니다.");
    }

    return res.data;
  } catch (error) {
    handleApiError(error, "로드맵 정보 조회"); 
  }
};

/**
 * 특정 미션을 완료 상태로 업데이트
 * @param {number} rsId - 완료할 미션의 ID
 */
export const updateCompleteMission = async (rsId) => {
  if (!rsId || typeof rsId !== "number" || rsId <= 0) {
    throw new Error("유효하지 않은 미션 ID입니다.");
  }

  try {
    const res = await axios.post(`${prefix}/updateCompleteMission`, { rsId: rsId });

    if (!res.data) { 
      throw new Error("미션 완료 중 오류가 발생하였습니다.");
    }

    return res.data;
  } catch (error) {
    handleApiError(error, "로드맵 정보 조회"); 
  }
};

/**
 * 새로운 미션 삽입
 * @param {number} rsId - 미션 ID
 * @param {string} dueDate - 완료 예정일 (YYYY-MM-DD 형식)
 */
export const insertMission = async (rsId, dueDate) => {
  if (!rsId || typeof rsId !== 'number') {
    throw new Error('유효하지 않은 미션 ID입니다.');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dueDate || !dateRegex.test(dueDate)) {
    throw new Error('올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요.');
  }

  try {
    const res = await axios.post(`${prefix}/insertMission`, { rsId: rsId, dueDate: dueDate });

    if (!res.data || res.data === "fail") {
      throw new Error("미션 수락 중 오류가 발생했습니다.");
    }

    return res.data;
  } catch (error) {
    handleApiError(error, "로드맵 정보 조회"); 
  }
};

/**
 * 미션의 완료 예정일 업데이트
 * @param {number} rsId - 미션 ID
 * @param {string} newDueDate - 새로운 완료 예정일 (YYYY-MM-DD 형식)
 */
export const updateDueDate = async (rsId, newDueDate) => {

  if (!rsId || typeof rsId !== 'number') {
    throw new Error('유효하지 않은 미션 ID입니다.');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!newDueDate || !dateRegex.test(newDueDate)) {
    throw new Error('올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요.');
  }
  try {
    const res = await axios.post(`${prefix}/updateDueDate`, { rsId: rsId, dueDate: newDueDate });

    if (!res.data) {
      throw new Error("미션 완료 예정 날짜 수정 중 오류가 발생했습니다.");
    }

    return res.data;

  } catch (error) {
    handleApiError(error, "로드맵 정보 조회"); 
  }

};

// 로드맵 결과 데이터를 조회
export const selectResultData = async () => {
  try {
    const res = await axios.get(`${prefix}/selectResultData`);

    if (!res.data) { 
      throw new Error("결과 데이터를 불러오는 중 오류가 발생했습니다.");
    }

    return res.data;
  } catch (error) {
    handleApiError(error, "로드맵 정보 조회"); 
  }
};

/**
 * Axios 에러를 처리하고 일관된 에러 메시지를 생성하여 throw하는 함수
 * @param {Error} error - catch 블록에서 받은 에러 객체
 * @param {string} contextMessage - 어떤 작업 중에 에러가 발생했는지 알려주는 문맥 메시지
 */
const handleApiError = (error, contextMessage) => {
  let errorMessage = "알 수 없는 오류가 발생했습니다.";

  if (error.response) {
    // 서버가 응답했으나 에러 상태 코드일 때
    errorMessage = error.response.data?.message || `${contextMessage} 중 서버에 문제가 발생했습니다.`;
  } else if (error.request) {
    // 요청은 보냈으나 응답을 받지 못했을 때
    errorMessage = "서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.";
  }
  
  throw new Error(errorMessage);
};