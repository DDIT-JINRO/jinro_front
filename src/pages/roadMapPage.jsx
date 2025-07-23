import { useCallback, useEffect, useState } from "react";
import { insertMission, selectMemberRoadmap } from "../api/roadMapApi";
import "../roadMap.css";
import Cloud from "../component/cloud";
import Character from "../component/character";
import { initData, MISSION_LIST, STAGE_POSITIONS } from "../data/roadmapStagedata";
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
  // 달력 여닫음
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 데이터 로딩 함수. (useCallback으로 재생성 방지)
  const LoadRoadmapData = useCallback(async () => {
    try {
      const res = await selectMemberRoadmap();
      setCharPosition(
        res.currentCharPosition > 0 ? res.currentCharPosition - 1 : 0
      );
      setCompletedMissions(res.completedMissions);
      setProgressMissions(res.progressMissions);
    } catch (error) {
      console.error("유저 로드맵 데이터를 불러오는 중 오류가 발생했습니다.", error);
    }
  }, []);

  useEffect(() => {
    LoadRoadmapData();
    initData();
  }, [LoadRoadmapData]);

  // 달력 여닫음
  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  const handleCloudClick = (stageId, isLocked, isCompleted) => {
    if (isCompleted) {
      return;
    }
    if (isLocked) {
      alert("이전 단계를 먼저 완료해주세요!");
      return;
    }

    setCharPosition(stageId - 1);

    insertMission(stageId)
      .then((res) => {
        if (res === "fail") return;
        LoadRoadmapData();
      })
      .catch((err) => {
        console.error("단계별 데이터를 불러오는 중 오류가 발생했습니다.", err);
      });
  };

  return (
    <>
      <div id="roadmap-background">
        {STAGE_POSITIONS.map((pos) => {
          const isLocked = checkIsLocked(pos.id, completedMissions);
          const isCompleted = completedMissions.some(
            (mission) => mission.rsId === pos.id
          );
          const isCurrent = charPosition === pos.id - 1;

          return (
            <Cloud
              key={pos.id}
              stageId={pos.id}
              position={pos.cloud}
              isCompleted={isCompleted}
              isProgress={progressMissions.some(
                (mission) => mission.rsId === pos.id
              )}
              isLocked={isLocked}
              onClick={
                isCurrent
                  ? null
                  : () => handleCloudClick(pos.id, isLocked, isCompleted)
              }
              isCurrent={isCurrent}
            />
          );
        })}

        <Character position={STAGE_POSITIONS[charPosition].char} />

        <MissionBox
          progressMissions={progressMissions}
          completedMissions={completedMissions}
          onUpdate={LoadRoadmapData}
          missionList={MISSION_LIST}
        />
        

        <div className={`calendar-slider ${isCalendarOpen ? "open" : ""}`}>
          <div className="calendar-toggle-button" onClick={toggleCalendar}>
            {isCalendarOpen 
            ? <i className="fa-solid fa-chevron-up"></i> 
            : <i className="fa-solid fa-chevron-down"></i>
          }
          </div>
          <div className="calendar-content">
            <CalendarView completedMissions={completedMissions} />
          </div>
        </div>
      </div>
      <div className="dont-show-again">
        <input type="checkbox" id="no-show" />
        <label htmlFor="no-show">24시간 보지 않기</label>
      </div>
    </>
  );
}

export default RoadMap;
