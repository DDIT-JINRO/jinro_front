import React from "react";
import "../css/roadmap/tutorialModal.css";

function TutorialModal({ onClose, isClosing, isAnimating }) {
  // 모달 닫히는 것 방지
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''} ${isAnimating ? 'opening' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <button className="modal-close-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <h2 className="modal-title">✨ 로드맵 이용 방법</h2>
        <div className="modal-body">
          <p>
            <strong>1. 미션 수주:</strong><br />
            캐릭터가 위치한 구름의 다음 단계 구름을 클릭하여 새로운 미션을 받을 수 있습니다. (잠긴 구름은 클릭할 수 없어요!)
          </p>
          <p>
            <strong>2. 미션 수행:</strong><br />
            좌측 하단의 '나의 임무' 목록을 확인하고, 각 미션을 완료해 주세요.
          </p>
          <p>
            <strong>3. 성장과 결과:</strong><br />
            모든 단계를 완료하고 정상에 도달하면 당신을 위한 맞춤 진로 결과를 확인할 수 있습니다!
          </p>
        </div>
      </div>
    </div>
  );
}

export default TutorialModal;