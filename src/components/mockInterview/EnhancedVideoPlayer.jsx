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
  onCalibrationComplete
}) => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [guideMode, setGuideMode] = useState('visual'); // 'visual', 'simple', 'off'
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
    const modes = ['visual', 'simple', 'off'];
    const currentIndex = modes.indexOf(guideMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setGuideMode(modes[nextIndex]);
  };

  // 가이드 상태에 따른 아이콘과 텍스트
  const getGuideButtonInfo = () => {
    switch (guideMode) {
      case 'visual':
        return { icon: Target, text: '시각적 가이드', color: '#10b981' };
      case 'simple':
        return { icon: Eye, text: '간단한 가이드', color: '#3b82f6' };
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
          {isMediaPipeReady && (
            <span style={{
              fontSize: '12px',
              background: '#10b981',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              AI 분석
            </span>
          )}
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
          
          {/* 가이드 모드 토글 버튼 */}
          <button
            onClick={toggleGuideMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              background: guideButtonInfo.color,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            title={`현재: ${guideButtonInfo.text}. 클릭하여 변경`}
          >
            <GuideIcon size={14} />
            {guideButtonInfo.text}
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
              title="개발자 디버그 패널"
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
              transition: 'all 0.2s',
              color: 'white',
              background: isCameraOn ? '#3b82f6' : '#ef4444',
              position: 'relative'
            }}
            title={isCameraOn ? '카메라 끄기' : '카메라 켜기'}
          >
            {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
            {!isCameraOn && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '12px',
                height: '12px',
                background: '#ef4444',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
            )}
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
              background: isMicOn ? '#3b82f6' : '#ef4444',
              position: 'relative'
            }}
            title={isMicOn ? '마이크 끄기' : '마이크 켜기'}
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
            {!isMicOn && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '12px',
                height: '12px',
                background: '#ef4444',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
            )}
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
        marginBottom: '16px',
        border: isAnalyzing ? '2px solid #10b981' : '1px solid #374151'
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
        {guideMode === 'visual' && isCameraOn && (
          <SimpleVisualGuide
            videoRef={videoRef}
            analysisData={analysisData}
            showGuide={true}
            onCalibrationComplete={handleCalibrationComplete}
          />
        )}
        
        {/* 간단한 얼굴 감지 가이드 */}
        {guideMode === 'simple' && isCameraOn && (
          <FaceDetectionGuide
            videoRef={videoRef}
            analysisData={analysisData}
            isMediaPipeReady={isMediaPipeReady}
            showGuide={true}
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
              zIndex: 15,
              backdropFilter: 'blur(8px)'
            }}>
              {isMicOn ? (
                <Mic size={16} style={{ color: 'white' }} />
              ) : (
                <MicOff size={16} style={{ color: 'white' }} />
              )}
            </div>

            {/* MediaPipe/분석 상태 표시 */}
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
                zIndex: 15,
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
                {isMediaPipeReady ? '🤖 AI 분석 중' : '📊 시뮬레이션'}
              </div>
            )}
          </>
        )}
      </div>

      {/* 캘리브레이션 완료 상태 표시 */}
      {calibrationCompleted && showControlHints && (
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
          <button
            onClick={() => setShowControlHints(false)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#065f46',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 가이드 사용법 안내 */}
      {showControlHints && !calibrationCompleted && isCameraOn && (
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
            <strong>면접 가이드 활성</strong>
            <button
              onClick={() => setShowControlHints(false)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#1e40af',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ fontSize: '12px', color: '#1e40af', opacity: 0.8 }}>
            {guideMode === 'visual' && (
              <>
                • 점선 박스 안에 얼굴을 위치시켜주세요<br />
                • 카메라 표시를 직접 바라보세요 (아이컨택)<br />
                • 화면에서 30-50cm 거리를 유지하세요<br />
                • 조명이 얼굴을 밝게 비추도록 하세요
              </>
            )}
            {guideMode === 'simple' && (
              <>
                • 화면 중앙에 얼굴을 위치시켜주세요<br />
                • 카메라를 직접 바라보세요<br />
                • 적절한 거리를 유지하세요
              </>
            )}
            {guideMode === 'off' && (
              <>
                • 가이드가 꺼져있습니다<br />
                • 위 버튼으로 가이드를 켤 수 있습니다
              </>
            )}
            <br />
            <strong>현재 상태:</strong> {analysisData?.video?.faceDetected ? 
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

export default EnhancedVideoPlayer;