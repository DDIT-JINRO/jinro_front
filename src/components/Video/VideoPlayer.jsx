import React from 'react';
import { Camera, Mic, MicOff, CameraOff } from 'lucide-react';

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
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
      padding: '24px', 
      height: '100%' 
    }}>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '16px' 
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
          면접 화면
        </h3>
        
        {/* 미디어 컨트롤 버튼 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onToggleCamera}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              backgroundColor: isCameraOn ? '#3b82f6' : '#ef4444',
              color: 'white'
            }}
            title={isCameraOn ? '카메라 끄기' : '카메라 켜기'}
          >
            {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
          </button>
          <button
            onClick={onToggleMic}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              backgroundColor: isMicOn ? '#3b82f6' : '#ef4444',
              color: 'white'
            }}
            title={isMicOn ? '마이크 끄기' : '마이크 켜기'}
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        </div>
      </div>
      
      {/* 비디오 화면 */}
      <div style={{ 
        position: 'relative', 
        backgroundColor: '#111827', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        aspectRatio: '16/9',
        marginBottom: '16px'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* 카메라 꺼짐 상태 */}
        {!isCameraOn && (
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: '#374151', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <CameraOff size={48} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', opacity: 0.75, margin: 0 }}>
                카메라가 꺼져있습니다
              </p>
            </div>
          </div>
        )}
        
        {/* 음성 인식 상태 표시 */}
        <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
          {isListening && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: '#10b981', 
              color: 'white', 
              padding: '4px 12px', 
              borderRadius: '9999px', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: 'white', 
                borderRadius: '50%', 
                animation: 'pulse 2s infinite' 
              }}></div>
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