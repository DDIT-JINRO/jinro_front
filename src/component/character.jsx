import "../css/roadmap/roadmapPage.css";

/**
 * 이동 상태와 방향에 따라 다른 이미지를 표시하는 캐릭터 컴포넌트
 * @param {object} position - 캐릭터의 위치 (top, left)
 * @param {boolean} isMoving - 캐릭터가 움직이는 중인지 여부
 * @param {string} chracterDirection - 캐릭터가 바라보는 방향 ('left' 또는 'right')
 */
function Character({ position, isMoving, chracterDirection }) {
  const imgSrc = isMoving 
    ? "/src/assets/roadmap/images/character_airplane.png" 
    : "/src/assets/roadmap/images/character_stand.png";

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