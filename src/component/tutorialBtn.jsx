import React from "react";
import { MISSION_LIST } from "../data/roadmapStagedata";

function TutorialBtn({isTutorialOpen, setIsTutorialOpen}) {
   console.log(isTutorialOpen)
  return (
    <button
      className="tutorial-icon-btn"
      onClick={() => setIsTutorialOpen(true)}
    >
      <i className="fa-solid fa-question"></i>
    </button>
  );
}

export default TutorialBtn;
