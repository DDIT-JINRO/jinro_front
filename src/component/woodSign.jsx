import React from "react";
import "../css/roadmap/woodSign.css";

const prefix = `/src/assets/roadmap/images/`;
const signImgSrc = `${prefix}wood_sign.png`;

function WoodSign({ position, text }) {
  const { top, left } = position;

  return (
    <div className="wood-sign-container" style={{ top: top, left: left }}>
      <img src={signImgSrc} alt="Wood Sign" className="wood-sign-image" />
      <span className="wood-sign-text">{text}</span>
    </div>
  );
}

export default WoodSign;