import React, { useState, useEffect } from "react";
import "../css/roadmap/editDueDateModal.css";

function EditDueDateModal({ isOpen, onClose, onSave, currentDueDate }) {
  const [selectedDate, setSelectedDate] = useState(currentDueDate);

  useEffect(() => {
    setSelectedDate(currentDueDate);
  }, [currentDueDate]);

  if (!isOpen) return null;

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleSaveClick = () => {
    onSave(selectedDate);
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={handleContentClick}>
        <h2>완료 예정 날짜 수정</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <div className="edit-modal-actions">
          <button className="save-btn" onClick={handleSaveClick}>저장</button>
          <button className="cancel-btn" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default EditDueDateModal;