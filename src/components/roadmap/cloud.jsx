import "../../css/roadmap/roadmapPage.css";
import { CLOUD_STATE, SHORT_CUT_URL } from "../../data/roadmapStagedata";

const prefix = `/src/assets/roadmap/images/`;

/**
 * 로드맵의 각 단계를 나타내는 구름 컴포넌트 (미션 상태에 따라 다른 이미지 표시)
 * @param {number} stageId - 현재 구름의 단계 ID
 * @param {object} position - 구름의 위치 (top, left)
 * @param {string} state - 구름의 현재 상태
 * @param {function} onClick - 구름 클릭 시 실행될 함수
 * @param {boolean} isCurrent - 현재 캐릭터가 이 구름에 위치하는지 여부
 * @param {function} onMouseEnter - 마우스가 구름 진입 시 실행될 함수
 * @param {function} onMouseLeave - 마우스가 구름 이탈 시 실행될 함수
 */
function Cloud({
  stageId,
  position,
  state,
  onClick,
  isCurrent,
  onMouseEnter,
  onMouseLeave,
}) {
  // 이미지 링크
  let imgSrc;

  const handleClick = () => {
    if (isCurrent) {
      // 현재 캐릭터가 있는 구름이면 바로가기 URL로 이동
      const shortcutUrl = SHORT_CUT_URL[stageId - 1]; // stageId는 1부터 시작하므로 -1
      if (shortcutUrl) {
        const width = 1200;
        const height = 800;

        if (stageId == 3) {
          window.resizeTo(width, height);
          navigate("/worldcup");

          return;
        }

        const targetUrl = SHORT_CUT_URL[stageId - 1];

        const message = {
          type: "navigateParent",
          url: targetUrl,
        };

        if (window.opener) {
          window.opener.postMessage(message, shortcutUrl);
          window.close();
        } else {
          console.log("부모 창을 찾을 수 없습니다.");
        }
      }
    } else if (onClick) {
      // 그렇지 않으면 기존 onClick 함수 실행
      onClick();
    }
  };

  // 스테이지 ID와 상태에 따라 이미지 선택
  if (stageId === 1) {
    // 시작 구름은 항상 동일한 이미지
    imgSrc = "cloud_start.png";
  } else if (stageId === 11) {
    // 마지막 구름은 완료 여부에 따라 이미지 변경
    if (state === CLOUD_STATE.COMPLETED) {
      imgSrc = "cloud_finish_unlock.png";
    } else {
      imgSrc = "cloud_finishi_lock.png";
    }
  } else {
    // 그 외 일반 구름은 완료/진행 중 여부에 따라 이미지 변경
    if (state === CLOUD_STATE.COMPLETED || state === CLOUD_STATE.PROGRESS) {
      imgSrc = "cloud1_unlock.png";
    } else if (state === CLOUD_STATE.LOCKED) {
      imgSrc = "cloud2_lock.png";
    } else {
      imgSrc = "cloud1_lock.png";
    }
  }

  const { top, left } = position;

  const cloudClass = `cloud ${state} ${isCurrent ? "current" : ""}`;

  return (
    <div
      className={cloudClass}
      style={{ top: top, left: left }}
      data-stage={stageId}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <img src={`${prefix}${imgSrc}`} alt={`Cloud ${stageId}`} />
    </div>
  );
}

export default Cloud;
