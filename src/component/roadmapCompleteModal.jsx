import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/roadmap/roadmapCompleteModal.css";

function RoadmapCompleteModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const goToResults = () => {
    navigate("/roadmap/results"); // 결과 페이지 경로로 이동
    onClose(); // 모달 닫기
  };

  return (
    <div className="complete-modal-overlay" onClick={onClose}>
      <div className="complete-modal-content" onClick={handleContentClick}>
        <div className="complete-modal-header">
          <h2>🎉 로드맵 완성! 🎉</h2>
        </div>
        <div className="complete-modal-body">
          <p>축하합니다! 모든 미션을 성공적으로 완료하셨습니다.</p>
          <p>이제 당신의 진로 결과를 확인할 시간입니다.</p>
        </div>
        <div className="complete-modal-actions">
          <button className="results-btn" onClick={goToResults}>
            결과 보러 가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoadmapCompleteModal;