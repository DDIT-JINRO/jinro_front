import { useState, useEffect, useRef } from 'react';
import { TIMER_DEFAULTS } from '../../utils/constants';

/**
 * 타이머 기능을 관리하는 커스텀 훅
 */
export const useTimer = (initialTime = TIMER_DEFAULTS.INITIAL_TIME) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // 타이머 시작
  const startTimer = () => {
    console.log('⏰ 타이머 시작');
    setIsTimerRunning(true);
  };

  // 타이머 일시정지
  const pauseTimer = () => {
    console.log('⏰ 타이머 일시정지');
    setIsTimerRunning(false);
  };

  // 타이머 리셋
  const resetTimer = () => {
    console.log('⏰ 타이머 리셋');
    setTimeLeft(initialTime);
    setIsTimerRunning(false);
  };

  // 시간 포맷팅 함수
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 타이머 진행률 계산
  const getTimerProgress = () => {
    return ((initialTime - timeLeft) / initialTime) * 100;
  };

  // 타이머 효과
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      console.log('⏰ 시간 종료');
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime: () => formatTime(timeLeft),
    getTimerProgress,
    isTimeExpired: timeLeft === 0,
    isLowTime: timeLeft <= TIMER_DEFAULTS.LOW_TIME_THRESHOLD
  };
};