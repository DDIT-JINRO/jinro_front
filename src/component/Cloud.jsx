import React from "react";
import "../roadMap.css";

function Cloud({ stageId, position, isCurrent, isUnlocked, onClick }) {
  const current = isCurrent ? "current" : "";
  const unlocked = isUnlocked ? "unlocked" : "";
  const { top, left } = position;

  const cloudClass = `cloud ${current} ${unlocked}`;

  return (
    <div
      className={cloudClass}
      style={{ top: top, left: left }}
      onClick={isUnlocked ? onClick : null}
    >
      <img src="src/assets/roadmap/images/cloud1_unlock.png" alt={`Cloud ${stageId}`} />
      {isUnlocked && <div className="glow-effect"></div>}
    </div>
  );
}

export default Cloud;
