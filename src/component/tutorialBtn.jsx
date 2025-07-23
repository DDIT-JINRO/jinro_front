import React from "react";

function TutorialBtn({ onClick }) {
  return (
    <button
      className="tutorial-icon-btn"
      onClick={onClick}
    >
      <i className="fa-solid fa-question"></i>
    </button>
  );
}

export default TutorialBtn;
