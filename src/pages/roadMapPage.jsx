import { useEffect, useState } from "react";
import { selectMemberRoadmap } from "../api/roadMapApi";
import "../roadMap.css";
import Cloud from "../component/cloud";
import Character from "../component/character";
import { STAGE_POSITIONS } from "../data/roadmapStagedata";
import { checkIsLocked } from "../data/roadmapUtils";
import CalendarView from "../component/calendarView";
import MissionBox from "../component/missionBox";

function RoadMap() {
  // 현재 캐릭터가 있는 스테이지
  const [charPosition, setCharPosition] = useState(0);
  // 현재 수주한 미션들
  const [progressMissions, setProgressMissions] = useState([]);
  // 완료된 미션들
  const [completedMissions, setCompletedMissions] = useState([]);

  useEffect(() => {
    selectMemberRoadmap().then((res) => {
      setCharPosition(res.currentCharPosition - 1);
      setCompletedMissions(res.completedMissions);
      setProgressMissions(res.progressMissions);
      
      console.log(res);
    });
  }, []);

  const handleCloudClick = (stageId, isLocked, isCompleted) => {
    if (isCompleted) {
      alert("이미 완료한 미션입니다.");
      return;
    }

    if (isLocked) {
      alert("이전 단계를 먼저 완료해주세요!");
      return;
    }

    // 잠겨있지 않다면 미션 수주 등 다음 로직을 실행합니다.
    console.log(`${stageId}번 미션을 수주할 수 있습니다.`);
    setCharPosition(stageId - 1);
  };

  return (
    <>
      <div id="roadmap-background">
        {STAGE_POSITIONS.map((pos) => {
          const isLocked = checkIsLocked(pos.id, completedMissions);
          const isCompleted = completedMissions.some((mission) => mission.rsId === pos.id);

          return (
            <Cloud
              key={pos.id}
              stageId={pos.id}
              position={pos.cloud}
              isCompleted={isCompleted}
              isProgress={progressMissions.some((mission) => mission.rsId === pos.id)}
              isLocked={isLocked}
              onClick={() => handleCloudClick(pos.id, isLocked, isCompleted)}
            />);
        })}

        <Character position={STAGE_POSITIONS[charPosition].char} />

        <MissionBox progressMissions={progressMissions} completedMissions={completedMissions}/>

        <CalendarView/>

      </div>
      <div className="dont-show-again">
        <input type="checkbox" id="no-show" />
        <label htmlFor="no-show">24시간 보지 않기</label>
      </div>
    </>
  );
}

export default RoadMap;
