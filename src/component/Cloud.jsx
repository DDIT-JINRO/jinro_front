import React from "react";
import { CLOUD_STATE } from "../data/roadmapUtils";
import '../css/roadmap/roadmap.css';

const prefix = `/src/assets/roadmap/images/`;

function Cloud({
  stageId,
  position,
  state,
  onClick,
  isCurrent,
  onMouseEnter,
  onMouseLeave,
}) {
  let imgSrc;

  // state에 따라 이미지 선택
  switch (state) {
    case CLOUD_STATE.LOCKED:
      imgSrc = stageId >= 11 ? "cloud_finishi_lock.png" : "cloud1_lock.png";
      break;
    case CLOUD_STATE.COMPLETED:
    case CLOUD_STATE.PROGRESS:
      if (stageId === 1) {
        imgSrc = "cloud_start.png";
      } else if (stageId === 11) {
        imgSrc = "cloud_finish_unlock.png";
      } else {
        imgSrc = "cloud1_unlock.png";
      }
      break;
    case CLOUD_STATE.UNLOCKED:
    default:
      if (stageId === 1) {
        imgSrc = "cloud_start.png";
      } else if (stageId === 11) {
        imgSrc = "cloud_finishi_lock.png"; // 완료되지 않은 마지막 단계
      } else {
        imgSrc = "cloud1_lock.png"; // 아직 시작 안 한 미션
      }
      break;
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
