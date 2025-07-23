import React from "react";
import "../missionTooltip.css";

function MissionTooltip({ mission, position }) {
  // 툴팁 위치를 커서 옆으로 살짝 이동시키기 위한 스타일
  const style = {
    top: `${position.y}px`,
    left: `${position.x}px`,
  };

  return (
    <div className="mission-tooltip" style={style}>
      {mission.stepName}
    </div>
  );
}

export default MissionTooltip;