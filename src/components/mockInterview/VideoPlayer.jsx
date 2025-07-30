import React, { useState } from 'react';
import { Camera, Mic, MicOff, CameraOff, Settings, Target } from 'lucide-react';
import FaceDetectionGuide from './FaceDetectionGuide';
import MediaPipeDebugPanel from './MediaPipeDebugPanel';

const VideoPlayer = ({
  videoRef,
  isCameraOn,
  isMicOn,
  isListening,
  speechSupported,
  onToggleCamera,
  onToggleMic,
  isRecording = false,
  recordingDuration = 0,
  formatRecordingTime,
  // 새로 추가된 props
  analysisData,
  isMediaPipeReady = false,
  isAnalyzing = false,
  mediaStream,
  showFaceGuide = true
}) => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showFaceGuideOption, setShowFaceGuideOption] = useState(showFaceGuide);
  const [calibrationCompleted, setCalibrationCompleted] = useState(false);

  // 얼굴 감지 캘리브레이션 완료 핸들러
  const handleCalibrationComplete = (success) => {
    setCalibrationCompleted(success);
    if (success) {
      // 캘리브레이션 완료 후 3초 뒤에 가이드 숨김
      setTimeout(() => {
        setShowFaceGuideOption(false);
      }, 3000);
    }
  };

  // 개발 환경에서만 디버그 패널 표시
  const canShowDebugPanel = process.env.NODE_ENV === 'development';

  return (
    <div style={{ position: 'relative' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '0 4px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          면접 화면
          {isMediaPipeReady && (
            <span style={{
              marginLeft: '8px',
              fontSize: '12px',
              background: '#10b981',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              AI 분석
            </span>
          )}
        </h3>
        
        {/* 미디어 컨트롤 및 설정 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* 얼굴 가이드 토글 버튼 */}
          <button
            onClick={() => setShowFaceGuideOption(!showFaceGuideOption)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              background: showFaceGuideOption ? '#3b82f6' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'background-color 0.2s'
            }}
            title="얼굴 감지 가이드 표시/숨김"
          >
            <Target size={14} />
            가이드
          </button>
          
          {/* 디버그 패널 토글 (개발 환경에서만) */}
          {canShowDebugPanel && (
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                background: showDebugPanel ? '#f59e0b' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background-color 0.2s'
              }}
              title="디버그 패널 표시/숨김"
            >
              <Settings size={14} />
              디버그
            </button>
          )}
          
          {/* 미디어 컨트롤 버튼 */}
          <button
            onClick={onToggleCamera}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              color: 'white',
              background: isCameraOn ? '#3b82f6' : '#ef4444'
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
              color: 'white',
              background: isMicOn ? '#3b82f6' : '#ef4444'
            }}
            title={isMicOn ? '마이크 끄기' : '마이크 켜기'}
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        </div>
      </div>
      
      {/* 비디오 화면 컨테이너 */}
      <div style={{
        position: 'relative',
        background: '#111827',
        borderRadius: '12px',
        overflow: 'hidden',
        aspectRatio: '16/9',
        marginBottom: '16px'
      }}>
        
        {/* 비디오 엘리먼트 */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        {/* 얼굴 감지 가이드 오버레이 */}
        {showFaceGuideOption && (
          <FaceDetectionGuide
            videoRef={videoRef}
            analysisData={analysisData}
            isMediaPipeReady={isMediaPipeReady}
            showGuide={showFaceGuideOption}
            onCalibrationComplete={handleCalibrationComplete}
          />
        )}
        
        {/* 카메라 꺼짐 상태 오버레이 */}
        {!isCameraOn && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <CameraOff size={48} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', margin: 0, opacity: 0.75 }}>
                카메라가 꺼져있습니다
              </p>
            </div>
          </div>
        )}
        
        {/* 음성 인식 상태 표시 */}
        {isListening && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: 15
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: 'white',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            🎤 음성 인식 중
          </div>
        )}

        {/* 녹화 상태 표시 */}
        {isRecording && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: 15
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: 'white',
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }} />
            REC
            <span style={{ fontFamily: 'monospace' }}>
              {formatRecordingTime ? formatRecordingTime() : '00:00'}
            </span>
          </div>
        )}
        
        {/* 마이크 상태 표시 */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          padding: '8px',
          borderRadius: '50%',
          background: isMicOn && speechSupported ? '#10b981' : '#ef4444',
          zIndex: 15
        }}>
          {isMicOn ? (
            <Mic size={16} style={{ color: 'white' }} />
          ) : (
            <MicOff size={16} style={{ color: 'white' }} />
          )}
        </div>

        {/* MediaPipe 상태 표시 */}
        {isAnalyzing && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            zIndex: 15
          }}>
            {isMediaPipeReady ? '🤖 AI 분석 중' : '📊 시뮬레이션'}
          </div>
        )}
      </div>

      {/* 캘리브레이션 완료 상태 표시 */}
      {calibrationCompleted && showFaceGuideOption && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#065f46'
        }}>
          <Target size={16} />
          <span style={{ fontSize: '14px' }}>
            ✅ 얼굴 위치 조정이 완료되었습니다. 이제 최적의 분석이 가능합니다!
          </span>
        </div>
      )}

      {/* 얼굴 감지 가이드 안내 */}
      {!calibrationCompleted && showFaceGuideOption && analysisData && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#1e40af'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Target size={16} />
            <strong>얼굴 감지 가이드 활성</strong>
          </div>
          
          <div style={{ fontSize: '12px', color: '#1e40af', opacity: 0.8 }}>
            • 점선 박스 안에 얼굴을 위치시켜주세요<br />
            • 화면에서 30-50cm 거리를 유지하세요<br />
            • 조명이 얼굴을 밝게 비추도록 하세요<br />
            • {analysisData.video.faceDetected ? 
              `✅ 얼굴 감지됨 (아이컨택: ${analysisData.video.eyeContactPercentage}%)` : 
              '❌ 얼굴이 감지되지 않습니다'}
          </div>
        </div>
      )}

      {/* MediaPipe 디버그 패널 */}
      {showDebugPanel && canShowDebugPanel && (
        <MediaPipeDebugPanel
          analysisData={analysisData}
          isMediaPipeReady={isMediaPipeReady}
          isAnalyzing={isAnalyzing}
          mediaStream={mediaStream}
          videoRef={videoRef}
        />
      )}

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
};

export default VideoPlayer;