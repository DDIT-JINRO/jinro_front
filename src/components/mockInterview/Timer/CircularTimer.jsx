import React from 'react';
import { Play, Pause } from 'lucide-react';

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
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
      padding: '24px', 
      textAlign: 'center' 
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>
        답변 시간
      </h3>
      
      {/* 원형 프로그레스 */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
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
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '24px',
          fontWeight: 'bold',
          color: isLowTime ? '#ef4444' : '#1f2937'
        }}>
          {formatTime}
        </div>
      </div>
      
      {/* 타이머 컨트롤 버튼 */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {!isTimerRunning ? (
          <button
            onClick={onStart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: speechSupported && isMicOn ? '#10b981' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: speechSupported && isMicOn ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s'
            }}
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <Pause size={16} />
            일시정지
          </button>
        )}
        <button
          onClick={onReset}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          리셋
        </button>
      </div>
      
      {/* 음성 인식 상태 안내 */}
      {!speechSupported && (
        <div style={{ 
          marginTop: '12px', 
          padding: '8px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#92400e'
        }}>
          ⚠️ 이 브라우저는 음성 인식을 지원하지 않습니다
        </div>
      )}
      
      {speechSupported && !isMicOn && (
        <div style={{ 
          marginTop: '12px', 
          padding: '8px', 
          backgroundColor: '#fef2f2', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#991b1b'
        }}>
          🎤 마이크가 꺼져있습니다. 음성 인식을 사용하려면 마이크를 켜주세요.
        </div>
      )}
    </div>
  );
};

export default CircularTimer;