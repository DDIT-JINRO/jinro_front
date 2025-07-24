import "../css/roadmap/roadMap.css";
import Cloud from "../component/cloud";
import Character from "../component/character";
import { STAGE_POSITIONS } from "../data/roadmapStagedata";
import { getCloudState, CLOUD_STATE } from "../data/roadmapUtils";
import CalendarView from "../component/calendarView";
import MissionBox from "../component/missionBox";
import TutorialBtn from "../component/tutorialBtn";
import TutorialModal from "../component/tutorialModal";
import AcceptMissionModal from "../component/acceptMissionModal";
import MissionTooltip from "../component/missionTooltip";
import EditDueDateModal from "../component/editDueDateModal"; // Import the new modal
import { updateDueDate } from "../api/roadMapApi"; // Import the new API function

// 커스텀 훅 임포트
import { useRoadmapData } from "../hooks/useRoadmapData";
import { useModalManager } from "../hooks/useModalManager";
import { useRoadmapInteraction } from "../hooks/useRoadmapInteraction";
import { useState } from "react";

function RoadMap() {
  // 1. 데이터 관리 훅
  const {
    missionList,
    charPosition,
    setCharPosition,
    progressMissions,
    completedMissions,
    isLoading,
    refreshMissionData, // 이름 변경
  } = useRoadmapData();

  // 2. 모달 관리 훅
  const { tutorialModal, acceptMissionModal } = useModalManager(
    missionList,
    refreshMissionData, // 변경된 함수 전달
    setCharPosition
  );

  // 3. UI 상호작용 훅
  const { calendar, tooltip, eventHandlers } =
    useRoadmapInteraction(missionList);

  // State for EditDueDateModal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [missionToEdit, setMissionToEdit] = useState(null);

  const handleEditDueDate = (rsId, currentDueDate) => {
    const mission = progressMissions.find(m => m.rsId === rsId);
    if (mission) {
      setMissionToEdit({ ...mission, currentDueDate });
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEditedDueDate = async (newDueDate) => {
    if (missionToEdit) {
      try {
        await updateDueDate(missionToEdit.rsId, newDueDate);
        refreshMissionData();
        setIsEditModalOpen(false);
        setMissionToEdit(null);
      } catch (error) {
        console.error("Failed to update due date:", error);
      }
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setMissionToEdit(null);
  };

  // 로딩 중일 때 표시할 UI (옵션)
  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <>
      <div id="roadmap-background" onMouseMove={eventHandlers.onMouseMove}>
        <TutorialBtn onClick={tutorialModal.open} />

        {STAGE_POSITIONS.map((pos) => {
          const state = getCloudState(pos.id, progressMissions, completedMissions);
          const isCurrent = charPosition === pos.id - 1;

          return (
            <Cloud
              key={pos.id}
              stageId={pos.id}
              position={pos.cloud}
              state={state} // 상태를 prop으로 전달
              isCurrent={isCurrent}
              onClick={() => {
                if (state === CLOUD_STATE.LOCKED) {
                  acceptMissionModal.open(pos.id, true); // 잠금 모드로 열기
                } else if (state === CLOUD_STATE.UNLOCKED) {
                  acceptMissionModal.open(pos.id, false); // 수락 모드로 열기
                } else {
                  setCharPosition(pos.id - 1);
                }
              }}
              onMouseEnter={() => eventHandlers.onCloudEnter(pos.id)}
              onMouseLeave={eventHandlers.onCloudLeave}
            />
          );
        })}

        <Character position={STAGE_POSITIONS[charPosition].char} />

        <MissionBox
          progressMissions={progressMissions}
          completedMissions={completedMissions}
          onUpdate={refreshMissionData} // 변경된 함수 전달
          missionList={missionList}
          onEditDueDate={handleEditDueDate} // Pass the new handler
        />

        <CalendarView
          progressMissions={progressMissions}
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
          isLocked={acceptMissionModal.isLocked}
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

      {isEditModalOpen && missionToEdit && (
        <EditDueDateModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveEditedDueDate}
          currentDueDate={missionToEdit.dueDate}
        />
      )}
    </>
  );
}

export default RoadMap;
