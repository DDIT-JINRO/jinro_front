import React from 'react';
import { useAudioVisualizer } from '../../hooks/useAudioVisualizer';

const AudioVisualizer = ({
  analyser,
  dataArray,
  mediaStream,
  cameraPermissionGranted,
  audioInitialized,
  isMicOn,
  isListening,
  currentAnswer
}) => {
  const { canvasRef } = useAudioVisualizer({
    analyser,
    dataArray,
    mediaStream,
    cameraPermissionGranted,
    audioInitialized,
    isMicOn,
    isListening,
    currentAnswer
  });

  return (
    <div>
      {/* 음성 인식 상태 헤더 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '8px' 
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
          음성 인식 상태
        </h4>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '12px',
          color: isListening ? '#10b981' : '#6b7280'
        }}>
          <div style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            backgroundColor: isListening ? '#10b981' : '#6b7280'
          }}></div>
          <span>
            {!cameraPermissionGranted ? '권한 필요' :
             !mediaStream ? '연결 중' :
             !audioInitialized ? '초기화 중' :
             !isMicOn ? '마이크 꺼짐' :
             isListening ? '인식 중' : '대기 중'}
          </span>
        </div>
      </div>
      
      {/* 비주얼라이저 캔버스 */}
      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        overflow: 'hidden',
        backgroundColor: '#1f2937'
      }}>
        <canvas
          ref={canvasRef}
          style={{ 
            width: '100%', 
            height: '80px', 
            display: 'block'
          }}
        />
      </div>
    </div>
  );
};

export default AudioVisualizer;