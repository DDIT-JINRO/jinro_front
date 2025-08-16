import { useState } from "react";
import "../../css/roadmap/directMoveModal.css"; // 2단계에서 만들 CSS 파일

/**
 * 미션 수락 또는 잠금 상태를 알려주는 모달 컴포넌트
 * @param {object} mission - 표시할 미션 정보
 * @param {function} onAccept - '수락' 버튼 클릭 시 호출될 함수 (완료 예정일 전달)
 * @param {function} onClose - 모달을 닫을 때 호출될 함수
 */
function DirectMoveModal({handleShortCutClick, mission, onClose}) {
  console.log("미션임 : ", mission);
  if (!mission) return null;

  // 모달 닫히는 것 방지
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleMoveClick = () => {
    handleShortCutClick(mission.rsId);
    onClose();
  }

  return (
    <div className="direct-modal-overlay" onClick={onClose}>
      <div className="direct-modal-content" onClick={handleContentClick}>
        {/* 모달 본문 시작 */}
        <div className="direct-modal-body">

          <h2 className="mission-title">
            <span>{mission.stepName}</span>
          </h2>

          <p className="mission-prompt">
            해당 미션으로 이동 하시겠습니까?
          </p>

        </div>
        {/* 모달 본문 종료 */}

        {/* 모달 버튼 시작 */}
        <div className="direct-modal-actions">
          <button className="action-btn direct-btn" onClick={handleMoveClick}>이동하기</button>
          <button className="action-btn decline-btn" onClick={onClose}>닫기</button>
        </div>
        {/* 모달 버튼 종료 */}

      </div>
    </div>
  );
}

export default DirectMoveModal;
