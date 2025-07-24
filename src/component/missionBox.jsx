import React, { useEffect, useState, useMemo } from "react";
import { updateCompleteMission } from "../api/roadMapApi";
import { formatDate, getStageGroup } from "../data/roadmapUtils";
import "../css/roadmap/missionBox.css";

function MissionBox({ progressMissions, completedMissions, onUpdate, missionList, onEditDueDate }) {

  const handleCompleteClick = (stageId) => {
    updateCompleteMission(stageId).then((res) => {
      if(res === "fail") {
        alert("완료 되지 않은 미션입니다.");
        return;
      }
      onUpdate();
    }).catch((err) => {
      console.error("미션 완료 중 업데이트 중 오류가 발생했습니다.", err);
    });
  };

  const displayMissions = useMemo(() => {
    const uniqueMissions = new Map();

    progressMissions.forEach(mission => {
      uniqueMissions.set(mission.rsId, { ...mission, status: 'progress' });
    });

    completedMissions.forEach(mission => {
      uniqueMissions.set(mission.rsId, { ...mission, status: 'completed' });
    });

    return Array.from(uniqueMissions.values()).sort((a, b) => {
      if (a.status === 'progress' && b.status === 'completed') {
        return -1;
      }
      if (a.status === 'completed' && b.status === 'progress') {
        return 1;
      }
      return 0;
    });
  }, [progressMissions, completedMissions]);

  return (
    <div className="mission-box-container">
      <h3 className="mission-box-title">나의 미션</h3>
      <ul className="mission-list">
        {displayMissions.map((mission) => {
          const isCompleted = mission.status === 'completed';
          const currentGroup = getStageGroup(mission.rsId);
          
          // missionList에서 해당 미션 찾기 (더 안전한 방법)
          const missionInfo = missionList.find(m => m.rsId === mission.rsId);
          const stepName = missionInfo ? missionInfo.stepName : '알 수 없는 단계';
          
          const dueDate = mission.dueDate ? new Date(mission.dueDate) : null;

          return (
            <li key={mission.rsId} className="mission-item">
              <div>
              <span>{`${currentGroup}단계 : ${stepName}`}</span>
                {dueDate && !isCompleted && (
                  <p className="mission-due-date">
                    예정: {formatDate(dueDate)}
                    <button 
                      className="edit-date-btn"
                      onClick={() => onEditDueDate(mission.rsId, mission.dueDate)}
                    >
                      수정
                    </button>
                  </p>
                )}
              </div>
              {isCompleted ? (
                <div className="mission-status completed">완료됨</div>
              ) : (
                <div className="mission-status completBtn" onClick={() => handleCompleteClick(mission.rsId)}>
                  완료
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MissionBox;

