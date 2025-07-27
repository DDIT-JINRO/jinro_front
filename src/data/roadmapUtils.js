import { CLOUD_STATE, STAGE_GROUPS } from "./roadmapStagedata";

/**
 * 주어진 스테이지 ID에 해당하는 구름의 현재 상태를 반환
 * @param {number} stageId - 확인할 스테이지의 ID.
 * @param {Array} progressMissions - 현재 진행 중인 미션 목록.
 * @param {Array} completedMissions - 완료된 미션 목록.
 * @returns {string} CLOUD_STATE에 정의된 구름 상태 문자열 ('completed', 'progress', 'locked', 'unlocked')
 */
export const getCloudState = (stageId, progressMissions, completedMissions) => {

  // 완료 미션 중에 스테이지 아이디와 같은게 있으면 완료 상태
  const isCompleted = completedMissions.some(m => m.rsId === stageId);
  if (isCompleted) {
    return CLOUD_STATE.COMPLETED;
  }

  // 진행 중 미션 중에 스테이지 아이디와 같은게 있으면 진행 상태
  const isProgress = progressMissions.some(m => m.rsId === stageId);
  if (isProgress) {
    return CLOUD_STATE.PROGRESS;
  }

  // 잠김 상태가 반환 되면 잠김 상태
  const isLocked = checkIsLocked(stageId, completedMissions);
  if (isLocked) {
    return CLOUD_STATE.LOCKED;
  }

  // 그 외에는 해금 상태
  return CLOUD_STATE.UNLOCKED;
};

/**
 * 특정 스테이지가 잠금 상태인지 여부 확인
 * 이전 단계의 미션 완료 여부에 따라 잠금 상태를 결정
 * @param {number} stageId - 확인할 스테이지의 ID.
 * @param {Array} completedMissions - 완료된 미션 목록.
 * @returns {boolean} 스테이지가 잠금 상태이면 true, 아니면 false.
 */
export const checkIsLocked = (stageId, completedMissions) => {
  // 클릭한 미션의 단계
  const currentGroup = getStageGroup(stageId);

  // 시작은 잠기지 않음
  if (currentGroup === 1) {
    return false;
  }

  // 클릭한 구름 기준 이전 단계를 완료 했는지에 대해 확인 
  const previousGroup = currentGroup - 1;
  return !isStageGroupCompleted(previousGroup, completedMissions);
};

// 1 ~ 완성 단계 반환 함수
export const getStageGroup = (stageId) => {
  for (const group in STAGE_GROUPS) {
    if (STAGE_GROUPS[group].includes(stageId)) {
      return parseInt(group, 10);
    }
  }
};

// 해당 단계 미션 수행 완료 여부 반환 함수
const isStageGroupCompleted = (groupNumber, completedMissions) => {
  // 없는 그룹이면 false
  if (!STAGE_GROUPS[groupNumber]) return false;

  const groupMissions = STAGE_GROUPS[groupNumber];
  for (const id of groupMissions) {
    for (const mission of completedMissions) {
      if (mission.rsId === id) return true;
    }
  }
  return false;
};

// 데이터 포멧 변환 함수 (date 타입 => 0000-00-00)
export const formatDate = (date) => {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

