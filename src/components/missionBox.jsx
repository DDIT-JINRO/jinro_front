import { useMemo, useState } from "react";
import { updateCompleteMission } from "../api/roadMapApi";
import "../css/roadmap/missionBox.css";
import { SHORT_CUT_URL } from "../data/roadmapStagedata";
import { formatDate, getStageGroup } from "../data/roadmapUtils";

const backUrl = import.meta.env.VITE_BACK_END_URL;
const prefix = `${backUrl}/roadmap`

/**
 * 사용자의 현재 미션 목록(진행 중, 완료)을 보여주는 박스 컴포넌트
 * @param {Array} missionList - 전체 미션 목록
 * @param {Array} progressMissions - 진행 중인 미션 목록
 * @param {Array} completedMissions - 완료된 미션 목록
 * @param {function} onUpdate - 새로고침하는 함수
 * @param {function} onEditDueDate - 완료 예정일 수정 모달을 여는 함수
 */
function MissionBox({ missionList, progressMissions, completedMissions, refresh, onEditDueDate, setCharPosition, setIsCompleteMoving }) {
  // 미션 박스 컴포넌트 상태 관리
  const [isOpen, setIsOpen] = useState(false);

  // 미션 박스 열고 닫는 함수
  const toggleMissionBox = () => {
    setIsOpen(true);
  };
  const closeMissionBox = () => {
    setIsOpen(false);
  };

  // 미션 완료 클릭 핸들러
  const handleCompleteClick = async (stageId) => {
    try {
      const res = await updateCompleteMission(stageId);
      if (res === "fail") {
        alert("완료 되지 않은 미션입니다.");
        return;
      }
      setCharPosition(stageId - 1);
      setIsCompleteMoving(true);
      refresh();
    } catch (err) {
      console.error("미션 완료 중 업데이트 중 오류가 발생했습니다.", err);
    }
  };

  // 바로가기 클릭 핸들러
  const handleShortCutClick = (stageId) => {
    const targetUrl = SHORT_CUT_URL[stageId-1];

    const message = {
      type: 'navigateParent',
      url : targetUrl
    }

    if(window.opener) {
      window.opener.postMessage(message, 'http://192.168.145.28:8080');
      // window.opener.postMessage(message, 'http://localhost:8080');
      window.close();
    } else {
      console.log("부모 창을 찾을 수 없습니다.");
    }
  }

  // 미션 완료, 진행중 상태에 따라 정렬하는 함수
  const displayMissions = useMemo(() => {
    const uniqueMissions = new Map();

    progressMissions.forEach((mission) => {
      uniqueMissions.set(mission.rsId, { ...mission, status: "progress" });
    });

    completedMissions.forEach((mission) => {
      uniqueMissions.set(mission.rsId, { ...mission, status: "completed" });
    });

    return Array.from(uniqueMissions.values()).sort((a, b) => {
      if (a.status === "progress" && b.status === "completed") {
        return -1;
      }
      if (a.status === "completed" && b.status === "progress") {
        return 1;
      }
      return 0;
    });
  }, [progressMissions, completedMissions]);

  return (
    <div className={`mission-box-container ${isOpen ? "open" : ""}`}>

      <h3 className={`mission-box-title ${isOpen ? "open" : ""}`} onClick={toggleMissionBox}>
        나의 미션
      </h3>

      {isOpen && (
        <button className="mission-box-close-btn" onClick={closeMissionBox}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}

      <ul className="mission-list">
        {displayMissions.map((mission) => {
          console.log(mission);
          // 각 미션 완료 상태 여부
          const isCompleted = mission.status === "completed";

          // 각 미션의 단계
          const currentGroup = getStageGroup(mission.rsId);

          // missionList에서 해당 미션 찾기
          const missionInfo = missionList.find((m) => m.rsId === mission.rsId);

          // 미션 정보
          const stepName = missionInfo ? missionInfo.stepName : "알 수 없는 단계";

          // 완료 예정일
          const dueDate = mission.dueDate ? new Date(mission.dueDate) : null;

          return (
            <li key={mission.rsId} className="mission-item">
              <div>
                <div className="mission-name">
                  <span>{`${currentGroup}단계 : ${stepName}`}</span>
                  {!isCompleted && (
                    <div className="short-cut-btn" onClick={() => handleShortCutClick(mission.rsId)}>바로가기</div>
                  )}
                </div>
                
                {/* 완료 예정일이 있고, 완료되지 않은 미션일 경우 */}
                {dueDate && !isCompleted && (
                  <p className="mission-due-date">
                    예정: {formatDate(dueDate)}
                    <button className="edit-date-btn" onClick={() => onEditDueDate(mission.rsId, mission.dueDate)}>
                      수정
                    </button>
                  </p>
                )}
              </div>

              {
              isCompleted
                ? (<div className="mission-status completed ">완료됨</div>)
                : (
                  mission.complete
                    ? (<div className="mission-status completeBtn" onClick={() => handleCompleteClick(mission.rsId)}>완료</div>)
                    : (<div className="mission-status progress">진행중</div>)
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MissionBox;
