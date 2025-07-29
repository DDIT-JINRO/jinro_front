import React from 'react';
import { Play, Pause } from 'lucide-react';
import styles from '../../styles/mockInterview/MockInterview.module.css';

const CircularTimer = ({
  timeLeft,
  formatTime,
  isTimerRunning,
  isLowTime,
  isListening,
  circumference,
  strokeDashoffset,
  onStart,
  onPause,
  onReset,
  speechSupported,
  isMicOn
}) => {
  return (
    <div className={styles.circularTimer}>
      <h3 className={styles.circularTimerTitle}>
        답변 시간
      </h3>
      
      {/* 원형 프로그레스 */}
      <div className={styles.circularTimerProgress}>
        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke={isLowTime ? '#ef4444' : isListening ? '#10b981' : '#3b82f6'}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.3s ease'
            }}
          />
        </svg>
        <div className={`
          ${styles.circularTimerText} 
          ${isLowTime ? styles.lowTime : ''}
        `}>
          {formatTime}
        </div>
      </div>
      
      {/* 타이머 컨트롤 버튼 */}
      <div className={styles.circularTimerControls}>
        {!isTimerRunning ? (
          <button
            onClick={onStart}
            className={`
              ${styles.btn} 
              ${speechSupported && isMicOn ? styles.btnSuccess : styles.btnSecondary}
            `}
            disabled={!speechSupported || !isMicOn}
            title={!speechSupported ? '음성 인식이 지원되지 않습니다' : 
                   !isMicOn ? '마이크를 켜주세요' : '답변 시작'}
          >
            <Play size={16} />
            시작 (음성 인식)
          </button>
        ) : (
          <button
            onClick={onPause}
            className={`${styles.btn} ${styles.btnWarning}`}
          >
            <Pause size={16} />
            일시정지
          </button>
        )}
        <button
          onClick={onReset}
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          리셋
        </button>
      </div>
      
      {/* 음성 인식 상태 안내 */}
      {!speechSupported && (
        <div className={`${styles.circularTimerAlert} ${styles.warning}`}>
          ⚠️ 이 브라우저는 음성 인식을 지원하지 않습니다
        </div>
      )}
      
      {speechSupported && !isMicOn && (
        <div className={`${styles.circularTimerAlert} ${styles.error}`}>
          🎤 마이크가 꺼져있습니다. 음성 인식을 사용하려면 마이크를 켜주세요.
        </div>
      )}
    </div>
  );
};

export default CircularTimer;