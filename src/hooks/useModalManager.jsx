import { useState, useEffect } from 'react';
import { insertMission } from '../api/roadMapApi';

export const useModalManager = (missionList, refreshMissionData, setCharPosition) => {
  // 튜토리얼 모달
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 미션 수락 모달
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [isLockedMode, setIsLockedMode] = useState(false);

  // 튜토리얼 모달 핸들러
  const openTutorialModal = () => setIsTutorialOpen(true);
  
  const closeTutorialModal = () => {
    setIsClosing(true);
    setIsAnimating(false);
    setTimeout(() => {
      setIsTutorialOpen(false);
      setIsClosing(false);
    }, 500);
  };

  useEffect(() => {
    if (isTutorialOpen) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isTutorialOpen]);


  // 미션 수락 모달 핸들러
  const openAcceptModal = (stageId, isLocked = false) => {
    setIsLockedMode(isLocked);

    const missionInfo = missionList.find(m => m.rsId === stageId);
    if (missionInfo) {
      setSelectedMission(missionInfo);
    } else {
      return;
    }

    setIsAcceptModalOpen(true);
  };

  const closeAcceptModal = () => {
    setIsAcceptModalOpen(false);
    setSelectedMission(null);
  };

  const handleAcceptMission = () => {
    if (!selectedMission) return;

    setCharPosition(selectedMission.rsId - 1);
    insertMission(selectedMission.rsId)
      .then((res) => {
        if (res === "fail") return;
        refreshMissionData(); // 데이터 새로고침
      })
      .catch((err) => {
        console.error("미션 수주 중 오류가 발생했습니다.", err);
      });

    closeAcceptModal();
  };

  return {
    tutorialModal: {
      isOpen: isTutorialOpen,
      isClosing,
      isAnimating,
      open: openTutorialModal,
      close: closeTutorialModal,
    },
    acceptMissionModal: {
      isOpen: isAcceptModalOpen,
      mission: selectedMission,
      isLocked: isLockedMode,
      open: openAcceptModal,
      close: closeAcceptModal,
      accept: handleAcceptMission,
    },
  };
};
