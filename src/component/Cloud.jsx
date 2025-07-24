import React from "react";
import '../css/roadmap/roadmap.css';

const prefix = `src/assets/roadmap/images/`;

function Cloud({
  stageId,
  position,
  isCompleted,
  isProgress,
  isLocked,
  onClick,
  isCurrent,
  onMouseEnter,
  onMouseLeave,
}) {
  let imgSrc;

  if (isLocked) {
    imgSrc = stageId >= 11 ? "cloud_finishi_lock.png" : "cloud1_lock.png";
  } else {
    if (stageId === 1) {
      imgSrc = "cloud_start.png";
    } else if (stageId === 11) {
      imgSrc = "cloud_finishi_unlock.png";
    } else if (isCompleted || isProgress) {
      imgSrc = "cloud1_unlock.png";
    } else {
      imgSrc = "cloud1_lock.png"; // 잠겨있지는 않지만, 아직 시작 안 한 미션
    }
  }

  const { top, left } = position;

  const cloudClass = `cloud ${isLocked ? "locked" : "unlocked"} ${
    isCompleted ? "completed" : "uncompleted"
  } ${isCurrent ? "current" : ""}`;

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
