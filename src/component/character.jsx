// Character.js
import React from 'react';
import "../css/roadmap/roadMap.css";

function Character({ position, isMoving, chracterDirection }) {
  const imgSrc = isMoving 
    ? "src/assets/roadmap/images/character_airplane.png" 
    : "src/assets/roadmap/images/character_stand.png";

  const style = {
    top: position.top,
    left: position.left,
    transform: chracterDirection === 'right' ? 'scaleX(-1)' : 'scaleX(1)' 
  }

  return (
    <div className={`character ${isMoving ? 'moving' : ''}`} style={ style }>
      <img src={imgSrc} alt="Character" />
    </div>
  );
}

export default Character;