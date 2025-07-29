import Character from './character';
import Cloud from './cloud';
import WoodSign from './woodSign';
import { CLOUD_STATE, STAGE_POSITIONS } from '../../data/roadmapStagedata';
import { getCloudState } from '../../data/roadmapUtils';

/**
 * 로드맵의 전체를 렌더링하는 컴포넌트 (배경, 구름, 캐릭터, 나무 표지판)
 * @param {number} charPosition - 현재 캐릭터의 위치
 * @param {Array} progressMissions - 진행 중인 미션 목록
 * @param {Array} completedMissions - 완료된 미션 목록
 * @param {boolean} isMoving - 캐릭터의 이동 상태 여부
 * @param {object} character - 캐릭터 관련 상태 (움직임, 방향)
 * @param {object} eventHandlers - 마우스 이동, 구름 진입/이탈 등 이벤트 핸들러 객체
 * @param {function} handleCloudClick - 구름 클릭 시 실행될 함수
 */
function RoadmapView ({ roadmap })  {

  const { charPosition, progressMissions, completedMissions, isMoving, isCompleteMoving, setIsCompleteMoving, character, eventHandlers, handleCloudClick } = roadmap;

  // 나무 표지판 랜더링
  const renderWoodSign = (pos) => {
    const state = getCloudState(pos.id, progressMissions, completedMissions);
    const completedMission = completedMissions.find((m) => m.rsId === pos.id);
    let signText = "";
    let showSign = false;

    // 첫 단계는 Start 또는 완료 날짜 표시
    if (pos.id === 1) {
      if (state === CLOUD_STATE.COMPLETED && completedMission) {
        signText = new Date(completedMission.completeAt).toLocaleDateString();
      } else {
        signText = "Start!";
      }
      showSign = true;
      
    // 나머지 완료 단계는 완료 날짜 표시
    } else if (state === CLOUD_STATE.COMPLETED && completedMission) {
      signText = new Date(completedMission.completeAt).toLocaleDateString();
      showSign = true;
    }

    return (
      showSign && <WoodSign key={`sign-${pos.id}`} position={pos.sign} text={signText} />
    );
  };

  return (
    <div id="roadmap-background" onMouseMove={eventHandlers.onMouseMove}>
      {STAGE_POSITIONS.map((pos) => {
        const state = getCloudState(pos.id, progressMissions, completedMissions);
        const isCurrent = charPosition === pos.id - 1;

        return (
          <Cloud
            key={pos.id}
            stageId={pos.id}
            position={pos.cloud}
            state={state}
            isCurrent={isCurrent}
            onClick={() => handleCloudClick(pos)}
            onMouseEnter={() => eventHandlers.onCloudEnter(pos.id)}
            onMouseLeave={eventHandlers.onCloudLeave}
            isCharacterMoving={isMoving}
          />
        );
      })}

      {STAGE_POSITIONS.map(renderWoodSign)}

      <Character
        position={STAGE_POSITIONS[charPosition].char}
        isMoving={isMoving}
        isCompleteMoving={isCompleteMoving}
        setIsCompleteMoving={setIsCompleteMoving}
        chracterDirection={character.chracterDirection}
      />
    </div>
  );
};

export default RoadmapView;
