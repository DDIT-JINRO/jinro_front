// EnhancedVideoPlayer.jsx 완전 수정

import React, { useState } from 'react';
import { Camera, Mic, MicOff, CameraOff, Settings, Target, Eye, EyeOff } from 'lucide-react';
import FaceDetectionGuide from './FaceDetectionGuide';
import VisualGuideOverlay from './VisualGuideOverlay';
import SimpleVisualGuide from './SimpleVisualGuide';
import MediaPipeDebugPanel from './MediaPipeDebugPanel';

const EnhancedVideoPlayer = ({
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
  // 분석 관련 props
  analysisData,
  isMediaPipeReady = false,
  isAnalyzing = false,
  mediaStream,
  showFaceGuide = true,
  onCalibrationComplete,
  // 🎯 새로운 props 추가
  isInterviewStarted = false,
  forceGuideComplete = false
}) => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [guideMode, setGuideMode] = useState('simple'); // 'visual', 'simple', 'off'
  const [calibrationCompleted, setCalibrationCompleted] = useState(false);
  const [showControlHints, setShowControlHints] = useState(true);

  // 개발 환경에서만 디버그 패널 표시
  const canShowDebugPanel = process.env.NODE_ENV === 'development';

  // 캘리브레이션 완료 핸들러
  const handleCalibrationComplete = (success) => {
    setCalibrationCompleted(success);
    onCalibrationComplete?.(success);
    
    if (success) {
      console.log('✅ 얼굴 위치 캘리브레이션 완료');
      // 캘리브레이션 완료 후 3초 뒤에 힌트 숨김
      setTimeout(() => {
        setShowControlHints(false);
      }, 3000);
    }
  };

  // 가이드 모드 토글
  const toggleGuideMode = () => {
    const modes = ['simple', 'visual', 'off'];
    const currentIndex = modes.indexOf(guideMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setGuideMode(modes[nextIndex]);
  };

  // 가이드 상태에 따른 아이콘과 텍스트
  const getGuideButtonInfo = () => {
    switch (guideMode) {
      case 'simple':
        return { icon: Target, text: '간편 가이드', color: '#3b82f6' };
      case 'visual':
        return { icon: Eye, text: '시각적 가이드', color: '#10b981' };
      case 'off':
        return { icon: EyeOff, text: '가이드 끄기', color: '#6b7280' };
      default:
        return { icon: Target, text: '가이드', color: '#6b7280' };
    }
  };

  const guideButtonInfo = getGuideButtonInfo();
  const GuideIcon = guideButtonInfo.icon;

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
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          면접 화면
          {isAnalyzing && (
            <span style={{
              fontSize: '12px',
              background: '#3b82f6',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              animation: 'pulse 2s infinite'
            }}>
              실시간 분석 중
            </span>
          )}
        </h3>
        
        {/* 미디어 컨트롤 및 설정 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* 미디어 컨트롤 버튼 */}
          <button
            onClick={onToggleCamera}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: 'white',
              background: isCameraOn ? '#3b82f6' : '#ef4444',
              position: 'relative'
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
              transition: 'all 0.2s',
              color: 'white',
              background: isMicOn ? '#3b82f6' : '#ef4444'
            }}
            title={isMicOn ? '마이크 끄기' : '마이크 켜기'}
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* 가이드 모드 토글 버튼 */}
          {showFaceGuide && (
            <button
              onClick={toggleGuideMode}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: 'white',
                background: guideButtonInfo.color
              }}
              title={guideButtonInfo.text}
            >
              <GuideIcon size={20} />
            </button>
          )}

          {/* 디버그 패널 토글 */}
          {canShowDebugPanel && (
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: 'white',
                background: showDebugPanel ? '#f59e0b' : '#6b7280'
              }}
              title="디버그 패널"
            >
              <Settings size={20} />
            </button>
          )}
        </div>
      </div>

      {/* 비디오 스크린 */}
      <div style={{
        position: 'relative',
        background: '#111827',
        borderRadius: '12px',
        overflow: 'hidden',
        aspectRatio: '16/9',
        marginBottom: '16px',
        border: isRecording ? '2px solid #10b981' : '1px solid #374151'
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
        
        {/* 시각적 가이드 오버레이 */}
        {guideMode === 'simple' && isCameraOn && showFaceGuide && (
          <SimpleVisualGuide
            videoRef={videoRef}
            analysisData={analysisData}
            showGuide={showFaceGuide && !calibrationCompleted}
            onCalibrationComplete={handleCalibrationComplete}
            // 🎯 새로운 props 전달
            isInterviewStarted={isInterviewStarted}
            forceComplete={forceGuideComplete}
          />
        )}

        {guideMode === 'visual' && isCameraOn && showFaceGuide && (
          <VisualGuideOverlay
            videoRef={videoRef}
            analysisData={analysisData}
            showGuide={showFaceGuide && !calibrationCompleted}
            onCalibrationComplete={handleCalibrationComplete}
            onToggleGuide={toggleGuideMode}
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
              <p style={{ fontSize: '14px', margin: '0 0 8px 0', opacity: 0.75 }}>
                카메라가 꺼져있습니다
              </p>
              <button
                onClick={onToggleCamera}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                카메라 켜기
              </button>
            </div>
          </div>
        )}
        
        {/* 상태 표시 오버레이들 */}
        {isCameraOn && (
          <>
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
                zIndex: 15,
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s infinite'
                }} />
                음성 인식 중
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
                zIndex: 15,
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 1s infinite'
                }} />
                녹화 중 • {formatRecordingTime(recordingDuration)}
              </div>
            )}
          </>
        )}
      </div>

      {/* 상태 정보 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'white',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isCameraOn ? '#10b981' : '#ef4444'
            }} />
            카메라
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isMicOn ? '#10b981' : '#ef4444'
            }} />
            마이크
          </div>
          {speechSupported && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isListening ? '#3b82f6' : '#6b7280'
              }} />
              음성인식
            </div>
          )}
        </div>
        
        {analysisData?.video?.faceDetected && (
          <div style={{
            fontSize: '11px',
            color: '#10b981',
            fontWeight: '600'
          }}>
            {analysisData.video.faceDetected ? 
              `✅ 얼굴 감지됨 (아이컨택: ${Math.round(analysisData.video.eyeContactPercentage || 0)}%)` : 
              '❌ 얼굴이 감지되지 않습니다'}
          </div>
        )}
      </div>

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

export default EnhancedVideoPlayer;