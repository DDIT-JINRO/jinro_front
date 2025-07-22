import React from "react";
import "../missionBox.css"; // MissionBox 전용 CSS 파일

// 미션 데이터의 전체 목록이 필요합니다.
// (예시: data/roadmapStagedata.js에 MISSION_LIST 추가)
const MISSION_LIST = [
  { id: 1, title: "관심사 선택하기" },
  { id: 2, title: "작업 성향하기" },
  { id: 3, title: "이력서 작성하기" },
  // ... 모든 미션의 제목을 여기에 정의합니다.
];

function MissionBox({ progressMissions, completedMissions }) {
  return (
    <div className="mission-box-container">
      <h3 className="mission-box-title">나의 임무</h3>
      <ul className="mission-list">
        {MISSION_LIST.map((mission) => {
          // 이 미션이 완료 목록에 포함되어 있는지 확인
          const isCompleted = completedMissions.some(
            (compMission) => compMission.rsId === mission.id
          );
          // 이 미션이 진행 중 목록에 포함되어 있는지 확인
          const isProgress = progressMissions.some(
            (progMission) => progMission.rsId === mission.id
          );

          return (
            <li key={mission.id} className="mission-item">
              <span>{`${mission.id}단계 : ${mission.title}`}</span>
              {isCompleted ? (
                <span className="mission-status completed">완료</span>
              ) : isProgress ? (
                <span className="mission-status progress">진행중</span>
              ) : (
                <span className="mission-status locked">잠김</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MissionBox;