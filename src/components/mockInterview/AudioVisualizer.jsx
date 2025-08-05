import React from 'react';
import { useAudioVisualizer } from '../../hooks/mockInterview/useAudioVisualizer';
import styles from '../../styles/mockInterview/AudioVisualizer.module.css';

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
    <div className={styles.audioVisualizer}>
      {/* 음성 인식 상태 헤더 */}
      <div className={styles.audioVisualizerHeader}>
        <h4 className={styles.audioVisualizerTitle}>
          음성 인식 상태
        </h4>
        <div className={`
          ${styles.audioVisualizerStatus} 
          ${isListening ? styles.listening : styles.waiting}
        `}>
          <div className={`
            ${styles.audioVisualizerStatusDot}
            ${isListening ? styles.listening : styles.waiting}
          `} style={{
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
      <div className={styles.audioVisualizerCanvas}>
        <canvas
          ref={canvasRef}
          className={styles.audioVisualizerCanvasElement}
        />
      </div>
    </div>
  );
};

export default AudioVisualizer;