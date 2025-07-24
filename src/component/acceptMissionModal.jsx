import React, { useState } from "react";
import "../css/roadmap/acceptMissionModal.css"; // 2단계에서 만들 CSS 파일

function AcceptMissionModal({ mission, onAccept, onClose, isLocked }) {
  const [dueDate, setDueDate] = useState(""); // 완료 예정 날짜 상태

  if (!mission && !isLocked) return null;

  console.log(isLocked);

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleAcceptClick = () => {
    onAccept(dueDate); // 완료 예정 날짜를 onAccept 콜백으로 전달
  };

  return (
    <div className="accept-modal-overlay" onClick={onClose}>
      <div className="accept-modal-content" onClick={handleContentClick}>
        <div className="accept-modal-body">
          <h2 className="mission-title">
            <span>{mission.stepName}</span>
          </h2>
          <p className="mission-prompt">
            {isLocked
              ? "이전 단계의 미션을 먼저 완료해주세요."
              : "해당 미션을 수락하시겠습니까?"}
          </p>
          {!isLocked && (
            <div className="due-date-selection">
              <label htmlFor="dueDate">완료 예정 날짜:</label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="accept-modal-actions">
          {isLocked ? (
            <>
              <button className="action-btn decline-btn" onClick={onClose}>
                닫기
              </button>
            </>
          ) : (
            <>
              <button className="action-btn accept-btn" onClick={handleAcceptClick}>
                수락
              </button>
              <button className="action-btn decline-btn" onClick={onClose}>
                거절
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AcceptMissionModal;
