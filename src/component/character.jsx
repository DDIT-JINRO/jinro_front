// Character.js
import React from 'react';
import "../roadMap.css";

function Character({ position }) {
  return (
    <div className="character" style={{ top: position.top, left: position.left }}>
      <img src="src/assets/roadmap/images/character_stand.png" alt="Character" />
    </div>
  );
}

export default Character;