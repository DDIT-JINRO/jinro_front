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
import WoodSign from "../component/woodSign"; // Import WoodSign
import { updateDueDate, updateCompleteMission } from "../api/roadMapApi"; // Import the new API function

// 커스텀 훅 임포트
import { useRoadmapData } from "../hooks/useRoadmapData";
import { useModalManager } from "../hooks/useModalManager";
import { useRoadmapInteraction } from "../hooks/useRoadmapInteraction";
import { useEffect, useState } from "react";
import RoadmapCompleteModal from "../component/roadmapCompleteModal";
import ResultBtn from "../component/resultMoveBtn";

function RoadMap() {
  // 1. 데이터 관리 훅
  const {
    missionList,
    charPosition,
    setCharPosition,
    progressMissions,
    completedMissions,
    isLoading,
    refreshMissionData,
    isCompleted,
  } = useRoadmapData();

  // 2. 모달 관리 훅
  const { tutorialModal, acceptMissionModal } = useModalManager(
    missionList,
    refreshMissionData,
    setCharPosition
  );

  // 3. UI 상호작용 훅
  const { calendar, tooltip, eventHandlers, character } =
    useRoadmapInteraction(missionList);

  useEffect(() => {
    window.resizeTo(1084, 736); 
  }, []);

  // 날짜 관리
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [missionToEdit, setMissionToEdit] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isRoadmapCompleteModalOpen, setIsRoadmapCompleteModalOpen] =
    useState(false);

  const handleSetCharPosition = (newPosition, onCompleteCallback = null) => {
    const isCurrent = charPosition === newPosition;
    if (isCurrent) return;

    setIsMoving(true);
    setCharPosition(newPosition);

    setTimeout(() => {
      setIsMoving(false);
      if (onCompleteCallback) {
        onCompleteCallback();
      }
    }, 700);
  };

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
        console.error("미션 완료 예정 날짜 수정 오류:", error);
      }
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setMissionToEdit(null);
  };

  const handleCompleteFinalMission = async (stageId) => {
    try {
      const res = await updateCompleteMission(stageId);
      if (res === "fail") {
        alert("미션 완료에 실패했습니다."); // Or a more specific message
        return;
      }
      if (res === "complete") {
        setIsRoadmapCompleteModalOpen(true);
      }
      refreshMissionData();
    } catch (err) {
      console.error("최종 미션 완료 중 오류가 발생했습니다.", err);
    }
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
            // 키, 임무번호, 위치, 잠김상태, 현재위치여부, 클릭 핸들러, 호버 핸들러, 탈출 핸들러
            <Cloud
              key={pos.id}
              stageId={pos.id}
              position={pos.cloud}
              state={state}
              isCurrent={isCurrent}
              onClick={() => {
                const currentPos = STAGE_POSITIONS[charPosition];
                const nextPos = pos; // pos는 map에서 넘어온 다음 스테이지의 위치 정보

                // 1. x좌표(left)를 비교하여 방향 결정
                if (nextPos.cloud.left > currentPos.cloud.left) {
                  character.setChracterDirection("right");
                } else if (nextPos.cloud.left < currentPos.cloud.left) {
                  character.setChracterDirection("left");
                }

                if (
                  pos.id === 11 &&
                  (state === CLOUD_STATE.UNLOCKED ||
                    state === CLOUD_STATE.PROGRESS)
                ) {
                  handleSetCharPosition(pos.id - 1, () =>
                    handleCompleteFinalMission(pos.id)
                  );
                } else if (state === CLOUD_STATE.LOCKED) {
                  acceptMissionModal.open(pos.id, true);
                } else if (state === CLOUD_STATE.UNLOCKED) {
                  acceptMissionModal.open(pos.id, false);
                } else {
                  handleSetCharPosition(pos.id - 1);
                }
              }}
              onMouseEnter={() => eventHandlers.onCloudEnter(pos.id)}
              onMouseLeave={eventHandlers.onCloudLeave}
              isCharacterMoving={isMoving} // Pass isMoving prop
            />
          );
        })}

        {/* Render WoodSigns */}
        {STAGE_POSITIONS.map((pos) => {
          const state = getCloudState(pos.id, progressMissions, completedMissions);
          const completedMission = completedMissions.find(m => m.rsId === pos.id);
          let signText = "";
          let showSign = false;

          if (pos.id === 1) {
            if (state === CLOUD_STATE.COMPLETED && completedMission) {
              signText = new Date(completedMission.completeAt).toLocaleDateString();
            } else {
              signText = "Start!";
            }
            showSign = true;
          } else if (state === CLOUD_STATE.COMPLETED && completedMission) {
            signText = new Date(completedMission.completeAt).toLocaleDateString();
            showSign = true;
          }

          return (
            showSign && (
              <WoodSign
                key={`sign-${pos.id}`}
                position={pos.sign} // Assuming pos.sign exists for sign position
                text={signText}
              />
            )
          );
        })}

        {/* 캐릭터 위치 */}
        <Character position={STAGE_POSITIONS[charPosition].char} isMoving={isMoving} chracterDirection={character.chracterDirection} />

        {/* 진행 중 미션, 완료 미션, 미션 새로고침, 미션 리스트, 날짜 수정 */}
        <MissionBox
          progressMissions={progressMissions}
          completedMissions={completedMissions}
          onUpdate={refreshMissionData}
          missionList={missionList}
          onEditDueDate={handleEditDueDate}
        />

        {/* 진행 중 미션, 완료 미션, 캘린더 열림 여부, 캘린더 토글 */}
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
        // 미션 명, 수락 핸들러, 닫기 핸들러, 잠김 여부
        <AcceptMissionModal
          mission={acceptMissionModal.mission}
          onAccept={acceptMissionModal.accept}
          onClose={acceptMissionModal.close}
          isLocked={acceptMissionModal.isLocked}
        />
      )}

      {tutorialModal.isOpen && (
        // 닫기 핸들러, 닫히는 중 상태 값(바로 사라짐 방지), 애니메이션 중 상태 값
        <TutorialModal
          onClose={tutorialModal.close}
          isClosing={tutorialModal.isClosing}
          isAnimating={tutorialModal.isAnimating}
        />
      )}

      {tooltip.mission && (
        // 미션 명, 위치
        <MissionTooltip mission={tooltip.mission} position={tooltip.position} />
      )}

      {isEditModalOpen && missionToEdit && (
        // 열림 여부, 닫기 핸들러, 저장 핸들러, 완료 예정 날짜
        <EditDueDateModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveEditedDueDate}
          currentDueDate={missionToEdit.dueDate}
        />
      )}

      {isRoadmapCompleteModalOpen && (
        <RoadmapCompleteModal
          isOpen={isRoadmapCompleteModalOpen}
          onClose={() => setIsRoadmapCompleteModalOpen(false)}
        />
      )}

      {isCompleted && (
        <ResultBtn/>
      )}
    </>
  );
}

export default RoadMap;
