import AcceptMissionModal from './acceptMissionModal';
import CalendarView from './calendarView';
import EditDueDateModal from './editDueDateModal';
import MissionBox from './missionBox';
import MissionTooltip from './missionTooltip';
import ResultBtn from './resultMoveBtn';
import RoadmapCompleteModal from './roadmapCompleteModal';
import TutorialBtn from './tutorialBtn';
import TutorialModal from './tutorialModal';

/**
 * 로드맵 페이지에 사용되는 모든 오버레이 컴포넌트 관리 컴포넌트
 * @param {object} roadmap - 로드맵 관련 상태와 핸들러를 포함하는 객체
 */
function RoadmapOverlays({ roadmap }) {
  return (
    <>
      {/* 튜토리얼 버튼 컴포넌트 */}
      <TutorialBtn onClick={roadmap.tutorialModal.open} />

      {/* 미션 상태 표시 박스 컴포넌트 */}
      <MissionBox
        progressMissions={roadmap.progressMissions}
        completedMissions={roadmap.completedMissions}
        refresh={roadmap.refreshMissionData}
        missionList={roadmap.missionList}
        onEditDueDate={roadmap.editModal.open}
        setCharPosition={roadmap.handleSetCharPosition}
        setIsCompleteMoving={roadmap.setIsCompleteMoving}
      />

      {/* 로드맵 결과 다시보기 버튼 컴포넌트 */}
      {roadmap.isCompleted && <ResultBtn />}

      {/* 캘린더 컴포넌트 */}
      <CalendarView
        progressMissions={roadmap.progressMissions}
        completedMissions={roadmap.completedMissions}
        isCalendarOpen={roadmap.calendar.isOpen}
        toggleCalendar={roadmap.calendar.toggle}
      />

      {/* 오늘 하루 안보기 시작 */}
      <div className="dont-show-again">
        <input
          type="checkbox"
          id="no-show"
          checked={roadmap.isNoShow}
          onChange={roadmap.handleCheckboxChange}
        />
        <label htmlFor="no-show">오늘 하루 안보기</label>
      </div>
      {/* 오늘 하루 안보기 종료 */}

      {/* 미션 수락 모달 컴포넌트 */}
      {roadmap.acceptMissionModal.isOpen && (
        <AcceptMissionModal
          mission={roadmap.acceptMissionModal.mission}
          onAccept={roadmap.acceptMissionModal.accept}
          onClose={roadmap.acceptMissionModal.close}
          isLocked={roadmap.acceptMissionModal.isLocked}
        />
      )}

      {/* 튜토리얼 모달 컴포넌트 */}
      {roadmap.tutorialModal.isOpen && (
        <TutorialModal
          onClose={roadmap.tutorialModal.close}
          isClosing={roadmap.tutorialModal.isClosing}
          isOpening={roadmap.tutorialModal.isOpening}
        />
      )}

      {/* 미션 툴팁 컴포넌트 */}
      {roadmap.tooltip.mission && (
        <MissionTooltip mission={roadmap.tooltip.mission} position={roadmap.tooltip.position} />
      )}

      {/* 미션 완료 예정일 수정 모달 컴포넌트 */}
      {roadmap.editModal.isOpen && roadmap.editModal.mission && (
        <EditDueDateModal
          isOpen={roadmap.editModal.isOpen}
          onClose={roadmap.editModal.close}
          onSave={roadmap.editModal.save}
          currentDueDate={roadmap.editModal.mission.dueDate}
        />
      )}

      {/* 로드맵 완료 모달 컴포넌트 */}
      {roadmap.completionModal.isOpen && (
        <RoadmapCompleteModal
          isOpen={roadmap.completionModal.isOpen}
          onClose={roadmap.completionModal.close}
        />
      )}
    </>
  );
};

export default RoadmapOverlays;
