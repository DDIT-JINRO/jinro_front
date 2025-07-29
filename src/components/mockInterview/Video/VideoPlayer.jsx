import React from 'react';
import { Camera, Mic, MicOff, CameraOff } from 'lucide-react';
import styles from '../../../styles/mockInterview/MockInterview.module.css';

const VideoPlayer = ({
  videoRef,
  isCameraOn,
  isMicOn,
  isListening,
  speechSupported,
  onToggleCamera,
  onToggleMic
}) => {
  return (
    <div className={styles.videoPlayer}>
      {/* 헤더 */}
      <div className={styles.videoPlayerHeader}>
        <h3 className={styles.videoPlayerTitle}>
          면접 화면
        </h3>
        
        {/* 미디어 컨트롤 버튼 */}
        <div className={styles.videoPlayerControls}>
          <button
            onClick={onToggleCamera}
            className={`
              ${styles.videoPlayerButton} 
              ${isCameraOn ? styles.on : styles.off}
            `}
            title={isCameraOn ? '카메라 끄기' : '카메라 켜기'}
          >
            {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
          </button>
          <button
            onClick={onToggleMic}
            className={`
              ${styles.videoPlayerButton} 
              ${isMicOn ? styles.on : styles.off}
            `}
            title={isMicOn ? '마이크 끄기' : '마이크 켜기'}
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        </div>
      </div>
      
      {/* 비디오 화면 */}
      <div className={styles.videoPlayerScreen}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.videoPlayerVideo}
        />
        
        {/* 카메라 꺼짐 상태 */}
        {!isCameraOn && (
          <div className={styles.videoPlayerOverlay}>
            <div className={styles.videoPlayerOverlayContent}>
              <CameraOff size={48} className={styles.videoPlayerOverlayIcon} />
              <p className={styles.videoPlayerOverlayText}>
                카메라가 꺼져있습니다
              </p>
            </div>
          </div>
        )}
        
        {/* 음성 인식 상태 표시 */}
        <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
          {isListening && (
            <div className={`${styles.statusIndicator} ${styles.listening}`}>
              <div className={styles.pulsingDot}></div>
              🎤 음성 인식 중
            </div>
          )}
        </div>
        
        {/* 마이크 상태 표시 */}
        <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
          <div style={{ 
            padding: '8px', 
            borderRadius: '50%', 
            backgroundColor: isMicOn && speechSupported ? '#10b981' : '#ef4444' 
          }}>
            {isMicOn ? (
              <Mic size={16} style={{ color: 'white' }} />
            ) : (
              <MicOff size={16} style={{ color: 'white' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;