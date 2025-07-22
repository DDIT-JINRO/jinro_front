import { useEffect, useState } from "react";
import { selectMemberRoadmap } from "../api/roadMapApi";
import "../roadMap.css";
import Cloud from "../component/Cloud";
import { STAGE_POSITIONS } from "../data/roadmapStagedata";

function RoadMap() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isMissionComplete, setIsMissionComplete] = useState(false);

  const characterPosition = STAGE_POSITIONS[currentStage].char;

  useEffect(() => {
    selectMemberRoadmap().then((res) => {
      setCurrentStage(res[0].rsId);
      setIsMissionComplete(res[0].roadComplete);
    });
  }, []);

  return (
    <div id="roadmap-background">
      {STAGE_POSITIONS.map((pos) => (
        <Cloud key={pos.id} stageId={pos.id} position={pos.cloud} />
      ))}
    </div>
  );
}

export default RoadMap;
