import { useNavigate } from "react-router-dom";
import "../../css/roadmap/roadmapCompleteModal.css";

/**
 * 로드맵의 모든 미션을 완료했을 때 나타나는 모달 컴포넌트
 * @param {boolean} isOpen - 모달이 열려있는지 여부
 * @param {function} onClose - 모달을 닫을 때 호출되는 함수
 */
function RoadmapCompleteModal({ isOpen, onClose }) {

  // 화면 이동을 위한 navigate훅
  const navigate = useNavigate();

  if (!isOpen) return null;

  // 모달 닫히는 것 방지
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  // 결과 페이지로 이동 함수
  const goToResults = () => {
    navigate("/roadmap/results");
    onClose();
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