import React, { useEffect, useState } from "react";
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
      if(res === "complete") {
        alert("로드맵 완성입니다.");
      }
      onUpdate();
    }).catch((err) => {
      console.error("미션 완료 중 업데이트 중 오류가 발생했습니다.", err);
    });
  };

  return (
    <div className="mission-box-container">
      <h3 className="mission-box-title">나의 미션</h3>
      <ul className="mission-list">
        {progressMissions.map((progMission) => {
          // 이 미션이 완료 목록에 포함되어 있는지 확인
          const isCompleted = completedMissions.some(
            (compMission) => compMission.rsId === progMission.rsId
          );

          const currentGroup = getStageGroup(progMission.rsId);
          
          // missionList에서 해당 미션 찾기 (더 안전한 방법)
          const missionInfo = missionList.find(mission => mission.rsId === progMission.rsId);
          const stepName = missionInfo ? missionInfo.stepName : '알 수 없는 단계';
          
          const date = new Date(progMission.dueDate);

          // 상황 봐서 전체 테이블 조회해서 자동 완료 띄우는 기능 생각하기
          return (
            <li key={progMission.rsId} className="mission-item">
              <div>
              <span>{`${currentGroup}단계 : ${stepName}`}</span>
                {progMission.dueDate && (
                  <p className="mission-due-date">
                    예정: {formatDate(date)}
                    {!isCompleted && (
                      <button 
                        className="edit-date-btn"
                        onClick={() => onEditDueDate(progMission.rsId, progMission.dueDate)}
                      >
                        수정
                      </button>
                    )}
                  </p>
                )}
              </div>
              {isCompleted ? (
                <div className="mission-status progress">완료됨</div>
              ) : (
                <div className="mission-status completBtn" onClick={() => handleCompleteClick(progMission.rsId)}>
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

