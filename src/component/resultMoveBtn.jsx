import React from "react";
import "../css/roadmap/resultBtn.css";
import { useNavigate } from "react-router-dom";

function ResultBtn() {
  const navigate = useNavigate();


  const moveResultPage = () => {
    navigate("/roadmap/results");
  };


  return (
    <button
      className="move-result-btn"
      onClick={moveResultPage}
    >
      <i className="fa-solid fa-flag-checkered"></i>
      <p>결과 다시보기</p>
    </button>
  );
}

export default ResultBtn;
