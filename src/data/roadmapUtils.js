// 구름 상태 상수
export const CLOUD_STATE = {
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  PROGRESS: 'progress',
  COMPLETED: 'completed',
};

// 구름 상태 결정 로직
export const getCloudState = (stageId, progressMissions, completedMissions) => {
  const isCompleted = completedMissions.some(m => m.rsId === stageId);
  if (isCompleted) {
    return CLOUD_STATE.COMPLETED;
  }

  const isProgress = progressMissions.some(m => m.rsId === stageId);
  if (isProgress) {
    return CLOUD_STATE.PROGRESS;
  }

  const isLocked = checkIsLocked(stageId, completedMissions);
  if (isLocked) {
    return CLOUD_STATE.LOCKED;
  }

  return CLOUD_STATE.UNLOCKED;
};

// 단계를 나눔
const STAGE_GROUPS = {
  1: [1],
  2: [2, 3, 4],
  3: [5, 6, 7],
  4: [8, 9, 10],
  5: [11],
};

// 몇 단계 인지 반환
export const getStageGroup = (stageId) => {
  for (const group in STAGE_GROUPS) {
    if (STAGE_GROUPS[group].includes(stageId)) {
      return parseInt(group, 10);
    }
  }
};

// 해당 단계의 미션중 하나라도 했는지 반환
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

// 잠김 여부 반환
export const checkIsLocked = (stageId, completedMissions) => {
  const currentGroup = getStageGroup(stageId);

  // 시작은 잠기지 않음
  if (currentGroup === 1) {
    return false;
  }

  // 클릭한 구름 기준 이전 단계를 완료 했는지에 대해 확인 
  const previousGroup = currentGroup - 1;
  return !isStageGroupCompleted(previousGroup, completedMissions);
};

export const formatDate = (date) => {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

