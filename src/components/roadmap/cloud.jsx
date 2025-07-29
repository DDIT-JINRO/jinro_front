import "../../css/roadmap/roadmapPage.css";
import { CLOUD_STATE } from "../../data/roadmapStagedata";

const prefix = `/src/assets/roadmap/images/`;

/**
 * 로드맵의 각 단계를 나타내는 구름 컴포넌트 (미션 상태에 따라 다른 이미지 표시)
 * @param {number} stageId - 현재 구름의 단계 ID
 * @param {object} position - 구름의 위치 (top, left)
 * @param {string} state - 구름의 현재 상태
 * @param {function} onClick - 구름 클릭 시 실행될 함수
 * @param {boolean} isCurrent - 현재 캐릭터가 이 구름에 위치하는지 여부
 * @param {function} onMouseEnter - 마우스가 구름 진입 시 실행될 함수
 * @param {function} onMouseLeave - 마우스가 구름 이탈 시 실행될 함수
 */
function Cloud({stageId, position, state, onClick, isCurrent, onMouseEnter, onMouseLeave,}) {
  // 이미지 링크
  let imgSrc;

  // 스테이지 ID와 상태에 따라 이미지 선택
  if (stageId === 1) {
    // 시작 구름은 항상 동일한 이미지
    imgSrc = "cloud_start.png";
  } else if (stageId === 11) {
    // 마지막 구름은 완료 여부에 따라 이미지 변경
    if (state === CLOUD_STATE.COMPLETED) {
      imgSrc = "cloud_finish_unlock.png";
    } else {
      imgSrc = "cloud_finishi_lock.png";
    }
  } else {
    // 그 외 일반 구름은 완료/진행 중 여부에 따라 이미지 변경
    if (state === CLOUD_STATE.COMPLETED || state === CLOUD_STATE.PROGRESS) {
      imgSrc = "cloud1_unlock.png";
    } else {
      imgSrc = "cloud1_lock.png";
    }
  }

  const { top, left } = position;

  const cloudClass = `cloud ${state} ${isCurrent ? "current" : ""}`;

  return (
    <div
      className={cloudClass}
      style={{ top: top, left: left }}
      data-stage={stageId}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <img src={`${prefix}${imgSrc}`} alt={`Cloud ${stageId}`} />
    </div>
  );
}

export default Cloud;
