import React from "react";
import "../css/roadmap/acceptMissionModal.css"; // 2단계에서 만들 CSS 파일

function AcceptMissionModal({ mission, onAccept, onClose }) {
  if (!mission) return null;

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="accept-modal-overlay" onClick={onClose}>
      <div className="accept-modal-content" onClick={handleContentClick}>
        <div className="accept-modal-body">
          <h2 className="mission-title">
            <span>{mission.stepName}</span>
          </h2>
          <p className="mission-prompt">해당 미션을 수락하시겠습니까?</p>
        </div>
        <div className="accept-modal-actions">
          <button className="action-btn accept-btn" onClick={onAccept}>
            수락
          </button>
          <button className="action-btn decline-btn" onClick={onClose}>
            거절
          </button>
        </div>
      </div>
    </div>
  );
}

export default AcceptMissionModal;