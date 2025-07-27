import "../css/roadmap/missionTooltip.css";

/**
 * 구름 위에 마우스를 올렸을 때 미션 이름을 보여주는 툴팁 컴포넌트
 * @param {object} mission - 표시할 미션의 정보
 * @param {object} position - 툴팁이 표시될 위치 (x, y 좌표)
 */
function MissionTooltip({ mission, position }) {
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