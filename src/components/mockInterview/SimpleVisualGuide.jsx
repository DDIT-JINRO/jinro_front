import React, { useState, useEffect } from 'react';
import { Target, Eye, Settings } from 'lucide-react';

const SimpleVisualGuide = ({ 
  videoRef, 
  analysisData, 
  showGuide = true,
  onCalibrationComplete,
  forceComplete = false,
  isInterviewStarted = false
}) => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeContactPercentage, setEyeContactPercentage] = useState(0);
  const [guideCompleted, setGuideCompleted] = useState(false); // 🎯 가이드 완료 여부
  const [detectionStarted, setDetectionStarted] = useState(false); // 🎯 실시간 감지 시작 여부

  useEffect(() => {
    if (forceComplete || isInterviewStarted) {
      setGuideCompleted(true);
      setDetectionStarted(true);
      onCalibrationComplete?.(true);
    }
  }, [forceComplete, isInterviewStarted, onCalibrationComplete]);

  // 실시간 데이터 업데이트 (감지 시작된 경우에만)
  useEffect(() => {
    if (analysisData?.video && detectionStarted) {
      setFaceDetected(analysisData.video.faceDetected);
      setEyeContactPercentage(analysisData.video.eyeContactPercentage || 0);
    }
  }, [analysisData, detectionStarted]);

  // 가이드 완료 핸들러
  const handleGuideComplete = () => {
    setGuideCompleted(true); // 🎯 가이드 완료 (네모 박스 숨김)
    setDetectionStarted(true); // 🎯 실시간 감지 시작
    onCalibrationComplete?.(true); // 🎯 부모 컴포넌트에 알림
  };

  if (!showGuide) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 20
    }}>
      
      {/* 🎯 중앙 얼굴 가이드 박스 - 가이드 완료 전까지만 표시 */}
      {!guideCompleted && (
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '25%',
          width: '50%',
          height: '70%',
          border: '3px dashed #3b82f6',
          borderRadius: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          animation: 'pulse 2s infinite'
        }}>
          
          {/* 🎯 모서리 마커들 */}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '-6px',
            width: '24px',
            height: '24px',
            border: '4px solid #3b82f6',
            borderBottom: 'transparent',
            borderRight: 'transparent',
            borderRadius: '4px 0 0 0'
          }} />
          
          <div style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '24px',
            height: '24px',
            border: '4px solid #3b82f6',
            borderBottom: 'transparent',
            borderLeft: 'transparent',
            borderRadius: '0 4px 0 0'
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '-6px',
            width: '24px',
            height: '24px',
            border: '4px solid #3b82f6',
            borderTop: 'transparent',
            borderRight: 'transparent',
            borderRadius: '0 0 0 4px'
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            right: '-6px',
            width: '24px',
            height: '24px',
            border: '4px solid #3b82f6',
            borderTop: 'transparent',
            borderLeft: 'transparent',
            borderRadius: '0 0 4px 0'
          }} />

          {/* 🎯 가이드 안내 텍스트 */}
          <div style={{
            textAlign: 'center',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            maxWidth: '80%'
          }}>
            <div style={{ color: '#3b82f6', marginBottom: '12px', fontSize: '18px' }}>
              🎯 얼굴 위치 조정
            </div>
            <div style={{ fontSize: '13px', color: '#d1d5db', marginBottom: '8px' }}>
              점선 박스 안에 얼굴을 위치시켜주세요
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
              화면에서 30-50cm 거리 유지 • 충분한 조명 확보
            </div>
          </div>
        </div>
      )}

      {/* 🎯 가이드 완료 버튼 */}
      {!guideCompleted && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto'
        }}>
          <button
            onClick={handleGuideComplete}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            ✅ 가이드 완료
          </button>
        </div>
      )}
      
      {/* 🎯 CSS 애니메이션 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
          }
          50% { 
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleVisualGuide;