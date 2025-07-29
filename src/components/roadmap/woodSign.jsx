import "../../css/roadmap/woodSign.css";

const prefix = `/src/assets/roadmap/images/`;
const signImgSrc = `${prefix}wood_sign.png`;

/**
 * 나무 표지판 컴포넌트 (미션 완료 날짜나 시작 지점을 표시)
 * @param {object} position - 표지판의 위치 (top, left)
 * @param {string} text - 표지판에 표시될 텍스트
 */
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