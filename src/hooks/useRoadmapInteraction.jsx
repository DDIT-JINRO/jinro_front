import { useState, useCallback } from 'react';

export const useRoadmapInteraction = (missionList) => {
  // 달력
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // 툴팁 (호버)
  const [hoveredMission, setHoveredMission] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // 캐릭터 방향
  const [chracterDirection, setChracterDirection] = useState('left');

  // 달력 여닫음
  const toggleCalendar = () => {
    setIsCalendarOpen(prev => !prev);
  };

  // 마우스 좌표 업데이트
  const handleMouseMove = useCallback((e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  }, []);

  // 구름에 마우스 들어갔을 때
  const handleCloudMouseEnter = useCallback((stageId) => {
    const missionInfo = missionList.find(m => m.rsId === stageId);
    if (missionInfo) {
      setHoveredMission(missionInfo);
    }
  }, [missionList]);

  // 구름에서 마우스 나갔을 때
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
