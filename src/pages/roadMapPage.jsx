import { useCallback, useEffect, useState } from "react";
import { insertMission, selectMemberRoadmap } from "../api/roadMapApi";
import "../roadMap.css";
import Cloud from "../component/cloud";
import Character from "../component/character";
import { initData, STAGE_POSITIONS, MISSION_LIST} from "../data/roadmapStagedata";
import { checkIsLocked } from "../data/roadmapUtils";
import CalendarView from "../component/calendarView";
import MissionBox from "../component/missionBox";
import TutorialBtn from "../component/tutorialBtn";
import TutorialModal from "../component/tutorialModal";
import AcceptMissionModal from "../component/acceptMissionModal";
import MissionTooltip from "../component/missionTooltip";

function RoadMap() {
  // 현재 캐릭터가 있는 스테이지
  const [charPosition, setCharPosition] = useState(0);
  // 현재 수주한 미션들
  const [progressMissions, setProgressMissions] = useState([]);
  // 완료된 미션들
  const [completedMissions, setCompletedMissions] = useState([]);
  // 달력 여닫음
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // 튜토리얼 모달 여닫음
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  // 미션 수락 모달 여닫음
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  // 클릭한 미션 정보
  const [selectedMission, setSelectedMission] = useState(null);
  // 호버 미션 정보
  const [hoveredMission, setHoveredMission] = useState(null);
  // 마우스 커서 위치
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 }); 

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
      console.error(
        "유저 로드맵 데이터를 불러오는 중 오류가 발생했습니다.",
        error
      );
    }
  }, []);

  useEffect(() => {
    initData();
    LoadRoadmapData();
  }, [LoadRoadmapData]);

  // 달력 여닫음
  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  // 구름 클릭
  const handleCloudClick = (stageId, isLocked, isCompleted) => {
    if (isCompleted || isLocked) {
      if (isLocked) alert("이전 단계를 먼저 완료해주세요!");
      return;
    }

    const missionInfo = MISSION_LIST[stageId - 1];
    if (missionInfo) {
      setSelectedMission(missionInfo); // 클릭한 미션 정보 state에 저장
      setIsAcceptModalOpen(true); // 모달 열기
    }
  };

  // 미션 수락 버튼
  const handleAcceptMission = () => {
    if (!selectedMission) return;

    setCharPosition(selectedMission.rsId - 1); // 캐릭터 위치 이동
    insertMission(selectedMission.rsId) // 미션 수주 API 호출
      .then((res) => {
        if (res === "fail") return;
        LoadRoadmapData(); // 데이터 새로고침
      })
      .catch((err) => {
        console.error("미션 수주 중 오류가 발생했습니다.", err);
      });

    handleDeclineMission(); // 모달 닫기
  };

  // 미션 거절 또는 닫음
  const handleDeclineMission = () => {
    setIsAcceptModalOpen(false);
    setSelectedMission(null);
  };

  // 튜토리얼 모달 닫는 함수
  const handleCloseModal = () => {
    setIsClosing(true); // 우선 '사라지는 중' 상태로 변경

    setTimeout(() => {
      setIsTutorialOpen(false);
      setIsClosing(false);
    }, 500);
  };

  // 마우스 커서 위치 업데이트
  const handleMouseMove = (e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  // 마우스 호버 했을 때
  const handleCloudMouseEnter = (stageId) => {
    const missionInfo = MISSION_LIST[stageId - 1];
    if (missionInfo) {
      setHoveredMission(missionInfo);
    }
  };

  // 마우스 땠을 때
  const handleCloudMouseLeave = () => {
    setHoveredMission(null);
  };

  return (
    <>
      <div id="roadmap-background" onMouseMove={handleMouseMove}>
        <TutorialBtn
          isTutorialOpen={isTutorialOpen}
          setIsTutorialOpen={setIsTutorialOpen}
        />

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
              onMouseEnter={() => handleCloudMouseEnter(pos.id)}
              onMouseLeave={handleCloudMouseLeave}
            />
          );
        })}

        <Character position={STAGE_POSITIONS[charPosition].char} />

        <MissionBox
          progressMissions={progressMissions}
          completedMissions={completedMissions}
          onUpdate={LoadRoadmapData}
        />

        <CalendarView
          completedMissions={completedMissions}
          isCalendarOpen={isCalendarOpen}
          toggleCalendar={toggleCalendar}
        />
      </div>
      <div className="dont-show-again">
        <input type="checkbox" id="no-show" />
        <label htmlFor="no-show">24시간 보지 않기</label>
      </div>
      {isAcceptModalOpen && (
        <AcceptMissionModal
          mission={selectedMission}
          onAccept={handleAcceptMission}
          onClose={handleDeclineMission}
        />
      )}

      {isTutorialOpen && (
        <TutorialModal onClose={handleCloseModal} isClosing={isClosing} />
      )}

      {hoveredMission && (
        <MissionTooltip mission={hoveredMission} position={cursorPosition} />
      )}
    </>
  );
}

export default RoadMap;
