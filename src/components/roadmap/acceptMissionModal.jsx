import { useState } from "react";
import "../../css/roadmap/acceptMissionModal.css"; // 2단계에서 만들 CSS 파일

/**
 * 미션 수락 또는 잠금 상태를 알려주는 모달 컴포넌트
 * @param {object} mission - 표시할 미션 정보
 * @param {function} onAccept - '수락' 버튼 클릭 시 호출될 함수 (완료 예정일 전달)
 * @param {function} onClose - 모달을 닫을 때 호출될 함수
 * @param {boolean} isLocked - 미션이 잠금 상태인지 여부
 */
function AcceptMissionModal({ mission, onAccept, onClose, isLocked, setIsMissionBoxOpen }) {
  // 완료 예정 날짜 상태 관리
  const [dueDate, setDueDate] = useState("");

  if (!mission && !isLocked) return null;

  // 모달 닫히는 것 방지
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  // '수락' 버튼 클릭 시 호출되는 함수
  const handleAcceptClick = () => {
    if(!dueDate) {
      alert("완료 예정 날짜를 입력해주세요.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(dueDate) < today) {
      alert("과거 날짜는 선택할 수 없습니다.");
      return;
    }
    
    onAccept(dueDate);
    setIsMissionBoxOpen(true);
  };

  return (
    <div className="accept-modal-overlay" onClick={onClose}>
      <div className="accept-modal-content" onClick={handleContentClick}>
        {/* 모달 본문 시작 */}
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
              <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)}/>
            </div>
          )}

        </div>
        {/* 모달 본문 종료 */}

        {/* 모달 버튼 시작 */}
        <div className="accept-modal-actions">
          {isLocked
            ? (
              <button className="action-btn decline-btn" onClick={onClose}>닫기</button>
            ) : (
            <>
              <button className="action-btn decline-btn" onClick={onClose}>거절</button>
              <button className="action-btn accept-btn" onClick={handleAcceptClick}>수락</button>
            </>
          )}
        </div>
        {/* 모달 버튼 종료 */}

      </div>
    </div>
  );
}

export default AcceptMissionModal;
