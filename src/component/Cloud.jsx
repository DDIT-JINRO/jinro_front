import React from "react";
import "../roadMap.css";

const prefix = `src/assets/roadmap/images/`;

function Cloud({ stageId, position, isCompleted, isCurrent, isProgress }) {
  let imgSrc;
	let unlocked;

  if (stageId === 1) {
    imgSrc = "cloud_start.png";
  } else if (stageId === 11) {
		if (!isCompleted && !isProgress) {
			imgSrc = "cloud_finishi_lock.png";
		} else {
			imgSrc = "cloud_finishi_unlock.png";
		}
  } else if (isCompleted || isProgress) {
    imgSrc = "cloud1_unlock.png";
  } else {
    imgSrc = "cloud1_lock.png";
  }

	if(!isCompleted && !isProgress) {
		unlocked = "locked";
	} else {
		unlocked = "unlocked";
	}

  const { top, left } = position;

  const cloudClass = `cloud ${stageId} ${unlocked}`;

  return (
    <div className={cloudClass} style={{ top: top, left: left }}>
      <img src={`${prefix}${imgSrc}`} alt={`Cloud ${stageId}`} />
    </div>
  );
}

export default Cloud;
