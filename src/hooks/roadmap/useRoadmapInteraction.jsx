import { useState, useCallback } from 'react';

export const useRoadmapInteraction = (missionList) => {
  // 달력 여닫음 여부 상태관리
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // 마우스 이동, 구름 진입/이탈 등 상태 관리
  const [hoveredMission, setHoveredMission] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // 이동 시 캐릭터가 바라보는 방향 상태 관리
  const [chracterDirection, setChracterDirection] = useState('left');

  // 달력 열고 닫는 함수
  const toggleCalendar = () => {
    setIsCalendarOpen(prev => !prev);
  };

  // 마우스 좌표 업데이트
  const handleMouseMove = useCallback((e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  }, []);

  // 구름 진입 시 메시지 세팅 핸들러
  const handleCloudMouseEnter = useCallback((stageId) => {
    const missionInfo = missionList.find(m => m.rsId === stageId);
    if (missionInfo) {
      setHoveredMission(missionInfo);
    }
  }, [missionList]);

  // 구름 이탈 시 메시지 삭제 핸들러
  const handleCloudMouseLeave = useCallback(() => {
    setHoveredMission(null);
  }, []);

  return {
    calendar: {
      isOpen: isCalendarOpen,
      toggle: toggleCalendar,
    },
    tooltip: {
      mission: hoveredMission,
      position: cursorPosition,
    },
    eventHandlers: {
      onMouseMove: handleMouseMove,
      onCloudEnter: handleCloudMouseEnter,
      onCloudLeave: handleCloudMouseLeave,
    },
    character: {
      chracterDirection: chracterDirection,
      setChracterDirection: setChracterDirection,
    }
  };
};
