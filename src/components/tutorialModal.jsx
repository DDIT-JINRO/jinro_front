import "../css/roadmap/tutorialModal.css";

/**
 * 튜토리얼 모달 컴포넌트
 * @param {function} onClose - 모달을 닫을 때 호출되는 함수
 * @param {boolean} isClosing - 모달이 닫히는 중인지 여부 (애니메이션용)
 * @param {boolean} isOpening - 모달이 열리는 중인지 여부 (애니메이션용)
 */
function TutorialModal({ onClose, isClosing, isOpening }) {
  
  // 모달 닫히는 것 방지
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''} ${isOpening ? 'opening' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <button className="modal-close-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <h2 className="modal-title">로드맵 이용 방법</h2>
        <div className="modal-body">
          <p>
            구름은 위치별로 1, 2, 3, 4단계와 최종 구름으로 이루어져 있습니다!<br/>
            캐릭터를 구름에 클릭하여 이동해보세요!
          </p>
          <p>
            <strong>1. 미션 수락</strong><br />
            완료한 가장 높은 단계의 구름의 다음 단계 구름을 클릭하여 새로운 미션을 받을 수 있습니다. (잠긴 구름은 클릭할 수 없어요!)
          </p>
          <p>
            <strong>2. 미션 수행</strong><br />
            좌측 하단의 '나의 미션' 목록을 확인하고, 각 미션을 완료해 주세요!<br/>
            완료 버튼을 누르면 미션을 완료 할 수 있습니다!
          </p>
          <p>
            <strong>3. 성장과 결과</strong><br />
            모든 단계를 완료하고 정상에 도달하면 당신을 위한 맞춤 진로 결과를 확인할 수 있습니다!
          </p>
        </div>
      </div>
    </div>
  );
}

export default TutorialModal;