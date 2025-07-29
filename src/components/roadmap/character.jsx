import { useEffect } from "react";
import "../../css/roadmap/roadmapPage.css";

/**
 * 이동 상태와 방향에 따라 다른 이미지를 표시하는 캐릭터 컴포넌트
 * @param {object} position - 캐릭터의 위치 (top, left)
 * @param {boolean} isMoving - 캐릭터가 움직이는 중인지 여부
 * @param {string} chracterDirection - 캐릭터가 바라보는 방향 ('left' 또는 'right')
 */
function Character({ position, isMoving, isCompleteMoving, setIsCompleteMoving, chracterDirection, }) {
  
  useEffect(() => {
    let timer;
    if (isCompleteMoving) {
      timer = setTimeout(() => {
        setIsCompleteMoving(false);
      }, 5000);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isCompleteMoving]);

  let imgSrc = "";
  let classes = "character";
  
  const style = {
    top: position.top,
    left: position.left,
    transform: chracterDirection === "right" ? "scaleX(-1)" : "scaleX(1)",
  };

  if (isMoving) {
    imgSrc = "/src/assets/roadmap/images/character_airplane.png";
    classes += " moving";
  } else if (isCompleteMoving) {
    imgSrc = "/src/assets/roadmap/images/character_jumping.gif";
    classes += " completeMoving";
    style.transform += "translateY(-40px)";
  } else {
    imgSrc = "/src/assets/roadmap/images/character_stand.png";
  }


  return (
    <div className={classes} style={style}>
      <img src={imgSrc} alt="Character" />
    </div>
  );
}

export default Character;
