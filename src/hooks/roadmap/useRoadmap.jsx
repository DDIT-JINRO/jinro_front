import { useState, useEffect, useCallback } from 'react';
import { useRoadmapData } from './useRoadmapData';
import { useModalManager } from './useModalManager';
import { useRoadmapInteraction } from './useRoadmapInteraction';
import { useCookie } from './useCookie';
import { updateDueDate, updateCompleteMission } from '../../api/roadmap/roadMapApi';
import { CLOUD_STATE, STAGE_POSITIONS } from '../../data/roadmapStagedata';
import { getCloudState } from '../../data/roadmapUtils';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../context/ModalContext.jsx";
export const useRoadmap = () => {
  const navigate = useNavigate();

  /**
   * 로드맵 데이터 이용을 위한 커스텀 훅 사용
   * @property {Array} missionList - 전체 미션 목록
   * @property {number} charPosition - 현재 캐릭터 위치
   * @property {Function} setCharPosition - 캐릭터 위치 변경 함수
   * @property {Array} progressMissions - 진행 중인 미션 목록
   * @property {Array} completedMissions - 완료된 미션 목록
   * @property {boolean} isLoading - 데이터 로딩 상태
   * @property {boolean} isCompleted - 로드맵 전체 완료 여부
   * @property {Function} refreshMissionData - 미션 데이터 새로고침 함수
   */
  const {
    missionList,
    charPosition,
    setCharPosition,
    progressMissions,
    completedMissions,
    isLoading,
    refreshMissionData,
    isCompleted,
    isFirst,
    setIsFirst
  } = useRoadmapData();

  /**
    * 상호작용 이용을 위한 커스텀 훅 사용
    * @param {Array} missionList - 전체 미션 목록
    * @property {object} calendar - 캘린더 상태 및 토글 반환 객체
    * @property {object} tooltip - 툴팁 상태 반환 객체
    * @property {object} eventHandlers - 마우스 이벤트 함수 반환 객체
    * @property {object} character - 캐릭터 방향 상태 관리 반환 객체
   */
  const { handleShortCutClick, calendar, tooltip, eventHandlers, character } = useRoadmapInteraction(missionList);

  /**
    * 오늘 하루 보지 않기 기능을 위한 쿠키 커스텀 훅 사용
    * @property {Function} setCookie - 쿠키 생성 함수
    * @property {Function} removeCookie - 쿠키 삭제 함수
    * @property {Function} getCookie - 쿠키 조회 함수
   */
  const { setCookie, removeCookie, getCookie } = useCookie();

  // 새롭게 수락한 미션 ID 상태 관리
  const [newlyAcceptedMissionId, setNewlyAcceptedMissionId] = useState(null);

  // 미션 박스 컴포넌트 상태 관리
  const [isMissionBoxOpen, setIsMissionBoxOpen] = useState(false);

  // 캐릭터 이동 상태 관리
  const [isMoving, setIsMoving] = useState(false);

  // 캐릭터 미션 완료 모션 상태 관리
  const [isCompleteMoving, setIsCompleteMoving] = useState(false);

  // 완료 예정일 모달 여닫음 여부 상태관리
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 완료 예정일 수정 내용 상태 관리
  const [missionToEdit, setMissionToEdit] = useState(null);

  // 로드맵 완성 모달 여닫음 여부 상태관리
  const [isRoadmapCompleteModalOpen, setIsRoadmapCompleteModalOpen] = useState(false);

  // 오늘 하루 보지 않기 체크박스 상태 관리
  const [isNoShow, setIsNoShow] = useState(false);

  //alert 창
  const { showAlert } = useModal();

  // 캐릭터 위치 변경 함수
  const handleSetCharPosition = useCallback((newPosition, onCompleteCallback = null) => {
    // 제자리 클릭 하거나, 움직이는 중이면 함수 중지
    if (charPosition === newPosition || isMoving) return;

    setIsMoving(true);
    setCharPosition(newPosition);

    setTimeout(() => {
      setIsMoving(false);
      // 로드맵이 완성이라면 콜백 함수 반환
      if (onCompleteCallback) onCompleteCallback();
    }, 700); // 비행기 애니메이션 시간 700ms
  }, [charPosition, isMoving, setCharPosition]);

  /**
   * 모달을 띄우기 위한 커스텀 훅 사용
   * @param {Array} missionList - 전체 미션 목록
   * @param {Function} refreshMissionData - 미션 데이터 새로고침 함수
   * @param {Function} handleSetCharPosition - 캐릭터 위치 변경 함수
   * @property {object} tutorialModal - 튜토리얼 모달 상태 및 열기, 닫기 함수 반환 객체
   * @property {object} acceptMissionModal - 미션 수락 모달 상태 및 열기, 닫기, 수락 함수 반환 객체
   */
  const { tutorialModal, acceptMissionModal } = useModalManager(
    missionList,
    refreshMissionData,
    handleSetCharPosition,
    setNewlyAcceptedMissionId
  );

  // 완료 예정 날짜 수정 클릭 함수
  const handleEditDueDate = (rsId, currentDueDate) => {
    const mission = progressMissions.find((m) => m.rsId === rsId);
    if (mission) {
      setMissionToEdit({ ...mission, currentDueDate });
      setIsEditModalOpen(true);
    }
  };

  // 완료 예정 날짜 수정 함수
  const handleSaveEditedDueDate = async (newDueDate) => {
    if (missionToEdit) {
      try {
        // updateDueDate 함수 호출
        const res = await updateDueDate(missionToEdit.rsId, newDueDate);

        // updateDueDate에서 에러를 throw하지 않고 "fail"을 반환할 경우를 대비
        if (res === "fail") {
          throw new Error("미션 완료 예정 날짜 수정 중 오류가 발생했습니다.");
        }

        // 모든 것이 성공적으로 완료되었을 때 실행되는 로직
        refreshMissionData();
        setIsEditModalOpen(false);
        setMissionToEdit(null);

        // 성공 알림을 띄웁니다.
        showAlert("✅ 수정 완료", "미션 완료 예정 날짜가 성공적으로 변경되었습니다.", () => {});

      } catch (error) {
        // API 함수에서 throw된 에러를 여기서 잡습니다.
        // 에러 페이지로 이동하는 대신 showAlert로 메시지를 보여줍니다.
        showAlert(
            "❌ 수정 실패",
            error.message,
            () => {}
        );
      }
    }
  };

  // 완료 예정 날짜 수정 취소 함수
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setMissionToEdit(null);
  };

  // 로드맵 완성 함수
  const handleCompleteFinalMission = async (stageId) => {
    try {
      const res = await updateCompleteMission(stageId);

      if (res === "fail") {
        showAlert(
            "미션을 완료하지 않았습니다.",
            "",
            () => {} // 확인 버튼 클릭 시 실행할 동작 (없으면 빈 함수)
        );
        return;
      }
      
      if (res === "complete") {
        setIsRoadmapCompleteModalOpen(true);
      }
      refreshMissionData();
    } catch (error) {
      navigate("/roadmap/error", {
        state: {
          message: error.message,
        },
      });
    }
  };

  // 구름 클릭 함수
  const handleCloudClick = (pos) => {
    // 만약 움직이는 중이면 함수 중지
    if (isMoving || isCompleteMoving) return;

    // 현재 캐릭터 위치
    const currentPos = STAGE_POSITIONS[charPosition];

    // 클릭한 캐릭터 위치
    const nextPos = pos;

    // 캐릭터 방향 변경
    if (nextPos.cloud.left > currentPos.cloud.left) {
      character.setChracterDirection("right");
    } else if (nextPos.cloud.left < currentPos.cloud.left) {
      character.setChracterDirection("left");
    }

    // 구름 상태 조회
    const state = getCloudState(pos.id, progressMissions, completedMissions);

    if (pos.id === 11 && (state === CLOUD_STATE.UNLOCKED || state === CLOUD_STATE.PROGRESS)) {
      // 최종 단계이고, 수락 가능 또는 진행 중인 구름이면 로드맵 완성 처리
      handleSetCharPosition(pos.id - 1, () => handleCompleteFinalMission(pos.id));
    } else if (state === CLOUD_STATE.LOCKED) {
      // 잠금 상태 일 때에는 잠금 상태 모달
      acceptMissionModal.open(pos.id, true);
    } else if (state === CLOUD_STATE.UNLOCKED) {
      // 해금 상태일 때는 미션 수락 모달
      acceptMissionModal.open(pos.id, false);
    } else {
      // 이미 완료된 미션이거나 진행 중인 미션이면 캐릭터만 이동
      handleSetCharPosition(pos.id - 1);
    }
  };

  // 체크박스 상태 변경에 따른 쿠키 변경 함수
  const handleCheckboxChange = (event) => {
    const flag_check = event.target.checked;
    setIsNoShow(flag_check);

    if (flag_check) {
      setCookie('popup', 'done', 1);
    } else {
      removeCookie('popup');
    }
  };

  // 페이지 로딩 시 오늘 하루 보지 않기 체크박스 상태 로딩 및 화면 크기 조정
  useEffect(() => {
    if (getCookie('popup')) {
      setIsNoShow(true);
    } else if (isFirst) {
      tutorialModal.open();
      setIsFirst(false);
    }

    window.resizeTo(1084, 736);

    const intervalId = setInterval(() => {
      refreshMissionData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [getCookie, isFirst, refreshMissionData, tutorialModal, setIsFirst]);

  return {
    missionList,
    charPosition,
    progressMissions,
    completedMissions,
    isLoading,
    isCompleted,
    isMoving,
    isCompleteMoving,
    isMissionBoxOpen,
    calendar,
    tooltip,
    character,
    isNoShow,
    tutorialModal,
    acceptMissionModal,
    editModal: {
      isOpen: isEditModalOpen,
      mission: missionToEdit,
      open: handleEditDueDate,
      close: handleCloseEditModal,
      save: handleSaveEditedDueDate,
    },
    completionModal: {
      isOpen: isRoadmapCompleteModalOpen,
      close: () => setIsRoadmapCompleteModalOpen(false),
    },
    eventHandlers,
    handleCloudClick,
    handleCheckboxChange,
    refreshMissionData,
    handleSetCharPosition,
    setIsCompleteMoving,
    setIsMissionBoxOpen,
    handleShortCutClick,
    newlyAcceptedMissionId,
    setNewlyAcceptedMissionId
  };
};
