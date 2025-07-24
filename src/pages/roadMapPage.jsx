import "../css/roadmap/roadMap.css";
import Cloud from "../component/cloud";
import Character from "../component/character";
import { STAGE_POSITIONS } from "../data/roadmapStagedata";
import { checkIsLocked } from "../data/roadmapUtils";
import CalendarView from "../component/calendarView";
import MissionBox from "../component/missionBox";
import TutorialBtn from "../component/tutorialBtn";
import TutorialModal from "../component/tutorialModal";
import AcceptMissionModal from "../component/acceptMissionModal";
import MissionTooltip from "../component/missionTooltip";

// 커스텀 훅 임포트
import { useRoadmapData } from "../hooks/useRoadmapData";
import { useModalManager } from "../hooks/useModalManager";
import { useRoadmapInteraction } from "../hooks/useRoadmapInteraction";

function RoadMap() {
  // 1. 데이터 관리 훅
  const {
    missionList,
    charPosition,
    setCharPosition,
    progressMissions,
    completedMissions,
    isLoading,
    reloadRoadmapData,
  } = useRoadmapData();

  // 2. 모달 관리 훅
  const { tutorialModal, acceptMissionModal } = useModalManager(
    missionList,
    reloadRoadmapData,
    setCharPosition
  );

  // 3. UI 상호작용 훅
  const { calendar, tooltip, eventHandlers } =
    useRoadmapInteraction(missionList);

  // 로딩 중일 때 표시할 UI (옵션)
  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <>
      <div id="roadmap-background" onMouseMove={eventHandlers.onMouseMove}>
        <TutorialBtn onClick={tutorialModal.open} />

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
                isCurrent || isLocked || isCompleted
                  ? null
                  : () => acceptMissionModal.open(pos.id)
              }
              isCurrent={isCurrent}
              onMouseEnter={() => eventHandlers.onCloudEnter(pos.id)}
              onMouseLeave={eventHandlers.onCloudLeave}
            />
          );
        })}

        <Character position={STAGE_POSITIONS[charPosition].char} />

        <MissionBox
          progressMissions={progressMissions}
          completedMissions={completedMissions}
          onUpdate={reloadRoadmapData}
          missionList={missionList}
        />

        <CalendarView
          completedMissions={completedMissions}
          isCalendarOpen={calendar.isOpen}
          toggleCalendar={calendar.toggle}
        />
      </div>
      <div className="dont-show-again">
        <input type="checkbox" id="no-show" />
        <label htmlFor="no-show">24시간 보지 않기</label>
      </div>

      {acceptMissionModal.isOpen && (
        <AcceptMissionModal
          mission={acceptMissionModal.mission}
          onAccept={acceptMissionModal.accept}
          onClose={acceptMissionModal.close}
        />
      )}

      {tutorialModal.isOpen && (
        <TutorialModal
          onClose={tutorialModal.close}
          isClosing={tutorialModal.isClosing}
          isAnimating={tutorialModal.isAnimating}
        />
      )}

      {tooltip.mission && (
        <MissionTooltip mission={tooltip.mission} position={tooltip.position} />
      )}
    </>
  );
}

export default RoadMap;
