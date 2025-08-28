import { useState, useEffect } from 'react';
import { POSITIONS_NORMAL, POSITIONS_TALL } from '../../data/roadmapStagedata';

const getPositionsByAspectRatio = () => {
  if (typeof window === 'undefined') {
    return POSITIONS_NORMAL; // SSR 환경에서는 기본값 반환
  }

  const aspectRatio = window.innerWidth / window.innerHeight;

  if (aspectRatio > 1.0) {
    // 1:1 ~ 16:9 사이의 화면 (태블릿, 일부 노트북)
    return POSITIONS_NORMAL;
  } else {
    // 1:1 비율보다 세로가 긴 화면 (대부분의 스마트폰)
    return POSITIONS_TALL;
  }
};

export const useResponsivePositions = () => {
  const [positions, setPositions] = useState(getPositionsByAspectRatio());

  useEffect(() => {
    const handleResize = () => {
      setPositions(getPositionsByAspectRatio());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return positions;
};