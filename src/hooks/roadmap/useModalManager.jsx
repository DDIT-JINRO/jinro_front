import { useState, useEffect } from "react";
import { insertMission } from "../../api/roadmap/roadMapApi";
import { useNavigate } from "react-router-dom";

export const useModalManager = ( missionList, refreshMissionData, setCharPosition) => {
  const navigate = useNavigate();

  // 튜토리얼 모달 상태 관리
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // 미션 수락 모달 상태 관리
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [isLockedMode, setIsLockedMode] = useState(false);

  // 바로가기 모달 상태 관리
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [directMission, setDirectMission] = useState(null);

  // 튜토리얼 모달 열기 핸들러
  const openTutorialModal = () => setIsTutorialOpen(true);

  // 튜토리얼 모달 닫기 핸들러
  const closeTutorialModal = () => {
    setIsClosing(true);
    setIsOpening(false);
    setTimeout(() => {
      setIsTutorialOpen(false);
      setIsClosing(false);
    }, 500); // 닫히는 애니메이션 500ms
  };

  // 미션 수락 모달 열기 핸들러 (기본값 잠김)
  const openAcceptModal = (stageId, isLocked = false) => {
    setIsLockedMode(isLocked);

    const missionInfo = missionList.find((m) => m.rsId === stageId);

    if (missionInfo) {
      setSelectedMission(missionInfo);
    } else {
      return;
    }

    setIsAcceptModalOpen(true);
  };

  // 미션 수락 모달 닫기 핸들러
  const closeAcceptModal = () => {
    setIsAcceptModalOpen(false);
    setSelectedMission(null);
  };

    // 미션 바로가기 모달 열기 핸들러
  const openDirectMoveModal = (stageId) => {
    const missionInfo = missionList.find((m) => m.rsId === stageId);

    if (missionInfo) {
      setDirectMission(missionInfo);
    } else {
      return;
    }

    setIsDirectModalOpen(true);
  };

  // 미션 수락 모달 닫기 핸들러
  const closeDirectMoveModal = () => {
    setIsDirectModalOpen(false);
    setDirectMission(null);
  };

  // 미션 수락 핸들럭
  const handleAcceptMission = async (dueDate) => {
    if (!selectedMission) return;

    setCharPosition(selectedMission.rsId - 1);
    try {
      await insertMission(selectedMission.rsId, dueDate);
      
      refreshMissionData();
    } catch (error) {
      navigate("/roadmap/error", {
        state: {
          message: error.message,
        },
      });
    }

    closeAcceptModal();
  };

  // 튜토리얼 모달이 열릴 때 애니메이션 관리를 위한 코드
  useEffect(() => {
    if (isTutorialOpen) {
      const timer = setTimeout(() => {
        setIsOpening(true);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isTutorialOpen]);

  return {
    tutorialModal: {
      isOpen: isTutorialOpen,
      isClosing,
      isOpening: isOpening,
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
    directMoveModal: {
      isOpen: isDirectModalOpen,
      mission: directMission,
      open: openDirectMoveModal,
      close: closeDirectMoveModal,
    }
  };
};
