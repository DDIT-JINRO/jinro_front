import { useEffect, useState } from "react";
import { selectMemberRoadmap } from "../api/roadMapApi";
import "../roadMap.css";
import Cloud from "../component/cloud";
import { STAGE_POSITIONS } from "../data/roadmapStagedata";

function RoadMap() {
  // 현재 캐릭터가 있는 스테이지
  const [charPosition, setCharPosition] = useState(0);

  // 현재 수주한 미션들
  const [progressMissions, setProgressMissions] = useState([]);

  // 완료된 미션들
  const [completedMissions, setCompletedMissions] = useState([]);

  const characterPosition = STAGE_POSITIONS[charPosition].char;

  useEffect(() => {
    selectMemberRoadmap().then((res) => {
      setCharPosition(res.currentCharPosition);
      setCompletedMissions(res.completedMissions);
      setProgressMissions(res.progressMissions);
    });
  }, []);

  return (
    <div id="roadmap-background">
      {STAGE_POSITIONS.map((pos) => (
        <Cloud
          key={pos.id}
          stageId={pos.id}
          position={pos.cloud}
          isCompleted={completedMissions.includes(pos.id)}
          isCurrent={charPosition === pos.id}
          isProgress={progressMissions.includes(pos.id)}
        />
      ))}
    </div>
  );
}

export default RoadMap;
