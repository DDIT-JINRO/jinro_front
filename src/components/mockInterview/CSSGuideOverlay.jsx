import React, { useState, useEffect } from 'react';
import { Target, Eye, CheckCircle, AlertCircle } from 'lucide-react';

const CSSGuideOverlay = ({ 
  analysisData, 
  showGuide = true,
  onCalibrationComplete 
}) => {
  const [calibrationStep, setCalibrationStep] = useState(0); // 0: 대기, 1: 진행중, 2: 완료
  const [qualityScore, setQualityScore] = useState(0);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  // 실시간 품질 계산
  useEffect(() => {
    if (analysisData?.video) {
      const faceDetected = analysisData.video.faceDetected;
      const eyeContact = analysisData.video.eyeContactPercentage || 0;
      const faceRate = analysisData.video.faceDetectionRate || 0;
      
      // 전체 품질 점수 계산
      let score = 0;
      if (faceDetected) score += 40;
      if (eyeContact > 30) score += 30;
      if (eyeContact > 60) score += 20;
      if (faceRate > 70) score += 10;
      
      setQualityScore(score);
      
      // 캘리브레이션 진행 중일 때
      if (calibrationStep === 1) {
        if (score >= 80) {
          setCalibrationProgress(prev => Math.min(100, prev + 2));
        }
        
        // 100% 달성 시 완료
        if (calibrationProgress >= 100) {
          setCalibrationStep(2);
          setTimeout(() => {
            onCalibrationComplete?.(true);
            setCalibrationStep(0);
            setCalibrationProgress(0);
          }, 2000);
        }
      }
    }
  }, [analysisData, calibrationStep, calibrationProgress, onCalibrationComplete]);

  const faceDetected = analysisData?.video?.faceDetected || false;
  const eyeContactPercentage = analysisData?.video?.eyeContactPercentage || 0;

  // 색상 결정
  const getStatusColor = () => {
    if (qualityScore >= 80) return '#10b981'; // 초록
    if (qualityScore >= 50) return '#f59e0b'; // 노랑
    return '#ef4444'; // 빨강
  };

  const statusColor = getStatusColor();

  if (!showGuide) return null;

  return (
    <>
      <style>{`
        .guide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 25;
        }
        
        .face-guide-box {
          position: absolute;
          top: 15%;
          left: 25%;
          width: 50%;
          height: 70%;
          border: 3px dashed ${statusColor};
          border-radius: 12px;
          background: ${statusColor}15;
          transition: all 0.3s ease;
          animation: guide-pulse 3s ease-in-out infinite;
        }
        
        .face-guide-corners::before,
        .face-guide-corners::after,
        .face-guide-corners .corner-tl,
        .face-guide-corners .corner-tr,
        .face-guide-corners .corner-bl,
        .face-guide-corners .corner-br {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border: 4px solid ${statusColor};
        }
        
        .corner-tl {
          top: -4px;
          left: -4px;
          border-right: transparent !important;
          border-bottom: transparent !important;
          border-radius: 8px 0 0 0;
        }
        
        .corner-tr {
          top: -4px;
          right: -4px;
          border-left: transparent !important;
          border-bottom: transparent !important;
          border-radius: 0 8px 0 0;
        }
        
        .corner-bl {
          bottom: -4px;
          left: -4px;
          border-right: transparent !important;
          border-top: transparent !important;
          border-radius: 0 0 0 8px;
        }
        
        .corner-br {
          bottom: -4px;
          right: -4px;
          border-left: transparent !important;
          border-top: transparent !important;
          border-radius: 0 0 8px 0;
        }
        
        .camera-target {
          position: absolute;
          top: 5%;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 50px;
          border: 3px solid ${eyeContactPercentage > 60 ? '#10b981' : '#f59e0b'};
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ${eyeContactPercentage > 60 ? 'glow' : 'pulse'} 2s ease-in-out infinite;
        }
        
        .connection-line {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 25%;
          background: linear-gradient(to top, ${statusColor}, transparent);
          transform: translateX(-50%);
          opacity: ${faceDetected ? 0.8 : 0.3};
          transition: opacity 0.3s ease;
        }
        
        .status-panel {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          min-width: 140px;
          border: 1px solid ${statusColor}50;
        }
        
        .quality-bar {
          width: 100%;
          height: 4px;
          background: #374151;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 4px;
        }
        
        .quality-fill {
          height: 100%;
          background: ${statusColor};
          width: ${qualityScore}%;
          transition: width 0.3s ease;
        }
        
        .guide-instructions {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 12px 20px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          border: 2px solid ${statusColor};
          max-width: 300px;
        }
        
        .calibration-progress {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          min-width: 250px;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #374151;
          border-radius: 4px;
          overflow: hidden;
          margin: 12px 0;
        }
        
        .progress-fill {
          height: 100%;
          background: #10b981;
          width: ${calibrationProgress}%;
          transition: width 0.3s ease;
        }
        
        .control-buttons {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          pointer-events: auto;
        }
        
        .control-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .btn-primary {
          background: #3b82f6;
          color: white;
        }
        
        .btn-success {
          background: #10b981;
          color: white;
        }
        
        .btn-secondary {
          background: #6b7280;
          color: white;
        }
        
        .control-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        @keyframes guide-pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.01);
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: translateX(-50%) scale(1);
            box-shadow: 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% { 
            transform: translateX(-50%) scale(1.1);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
          }
        }
        
        @keyframes glow {
          0%, 100% { 
            transform: translateX(-50%) scale(1);
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
          }
          50% { 
            transform: translateX(-50%) scale(1.05);
            box-shadow: 0 0 25px rgba(16, 185, 129, 0.8);
          }
        }
      `}</style>
      
      <div className="guide-overlay">
        {/* 메인 얼굴 가이드 박스 */}
        <div className="face-guide-box">
          <div className="face-guide-corners">
            <div className="corner-tl"></div>
            <div className="corner-tr"></div>
            <div className="corner-bl"></div>
            <div className="corner-br"></div>
          </div>
        </div>
        
        {/* 카메라 타겟 */}
        <div className="camera-target">
          <Eye size={20} color="white" />
        </div>
        
        {/* 연결선 */}
        {faceDetected && <div className="connection-line"></div>}
        
        {/* 상태 패널 */}
        <div className="status-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Target size={14} />
            <span style={{ fontWeight: '600' }}>가이드 상태</span>
          </div>
          
          <div style={{ marginBottom: '6px' }}>
            {faceDetected ? (
              <span style={{ color: '#10b981' }}>✅ 얼굴 감지됨</span>
            ) : (
              <span style={{ color: '#ef4444' }}>❌ 얼굴 미감지</span>
            )}
          </div>
          
          <div style={{ marginBottom: '6px' }}>
            <span>아이컨택: </span>
            <span style={{ 
              color: eyeContactPercentage > 60 ? '#10b981' : 
                    eyeContactPercentage > 30 ? '#f59e0b' : '#ef4444',
              fontWeight: '600' 
            }}>
              {eyeContactPercentage}%
            </span>
          </div>
          
          <div style={{ fontSize: '11px', color: '#d1d5db' }}>
            품질: {qualityScore}/100
          </div>
          <div className="quality-bar">
            <div className="quality-fill"></div>
          </div>
        </div>
        
        {/* 캘리브레이션 진행 중 */}
        {calibrationStep === 1 && (
          <div className="calibration-progress">
            <div style={{ marginBottom: '12px' }}>
              <Target size={24} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '16px', fontWeight: '600' }}>위치 조정 중...</div>
            </div>
            
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            
            <div style={{ fontSize: '12px', color: '#d1d5db' }}>
              진행률: {Math.round(calibrationProgress)}%
            </div>
            
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
              점선 박스 안에 얼굴을 위치하고<br />
              상단의 카메라 아이콘을 바라보세요
            </div>
          </div>
        )}
        
        {/* 완료 메시지 */}
        {calibrationStep === 2 && (
          <div className="calibration-progress" style={{ border: '2px solid #10b981' }}>
            <CheckCircle size={32} style={{ color: '#10b981', marginBottom: '12px' }} />
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#10b981' }}>
              조정 완료!
            </div>
            <div style={{ fontSize: '14px', color: '#d1d5db', marginTop: '8px' }}>
              면접을 시작할 수 있습니다
            </div>
          </div>
        )}
        
        {/* 가이드 안내 */}
        {calibrationStep === 0 && (
          <div className="guide-instructions">
            {faceDetected ? (
              eyeContactPercentage > 60 ? (
                <>🎉 완벽합니다! 이 상태를 유지하세요</>
              ) : (
                <>👁️ 상단의 카메라 아이콘을 바라보세요</>
              )
            ) : (
              <>👤 점선 박스 안에 얼굴을 위치시켜주세요</>
            )}
          </div>
        )}
        
        {/* 컨트롤 버튼 */}
        {calibrationStep === 0 && (
          <div className="control-buttons">
            <button
              className="control-btn btn-primary"
              onClick={() => setCalibrationStep(1)}
            >
              <Target size={14} style={{ marginRight: '4px' }} />
              위치 조정 시작
            </button>
            
            <button
              className="control-btn btn-success"
              onClick={() => onCalibrationComplete?.(true)}
            >
              <CheckCircle size={14} style={{ marginRight: '4px' }} />
              완료
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CSSGuideOverlay;