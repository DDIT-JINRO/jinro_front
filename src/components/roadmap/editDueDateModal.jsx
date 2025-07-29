import { useEffect, useState } from "react";
import "../../css/roadmap/editDueDateModal.css";

/**
 * 진행 중인 미션의 완료 예정일을 수정하는 모달 컴포넌트
 * @param {boolean} isOpen - 모달이 열려있는지 여부
 * @param {function} onClose - 모달을 닫을 때 호출되는 함수
 * @param {function} onSave - '저장' 버튼 클릭 시 호출될 함수
 * @param {string} currentDueDate - 현재 설정된 완료 예정일
 */
function EditDueDateModal({ isOpen, onClose, onSave, currentDueDate }) {
  // 완료 예정일 상태 관리
  const [dueDate, setDueDate] = useState(currentDueDate);

  useEffect(() => {
    setDueDate(currentDueDate);
  }, [currentDueDate]);

  if (!isOpen) return null;
  
  // 모달 닫히는 것 방지
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  // '저장' 버튼 클릭 시 호출되는 함수
  const handleSaveClick = () => {
    if (!dueDate) {
      alert("완료 예정 날짜를 입력해주세요.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(dueDate) < today) {
      alert("과거 날짜는 선택할 수 없습니다.");
      return;
    }

    onSave(dueDate);
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={handleContentClick}>
        
        <h2>완료 예정 날짜 수정</h2>

        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}/>

        <div className="edit-modal-actions">
          <button className="save-btn" onClick={handleSaveClick}>저장</button>
          <button className="cancel-btn" onClick={onClose}>취소</button>
        </div>

      </div>
    </div>
  );
}

export default EditDueDateModal;
