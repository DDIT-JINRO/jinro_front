import React, { useState, useEffect } from 'react';
import { Target, Eye, Settings } from 'lucide-react';

const SimpleVisualGuide = ({ 
  videoRef, 
  analysisData, 
  showGuide = true,
  onCalibrationComplete 
}) => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeContactPercentage, setEyeContactPercentage] = useState(0);

  // 실시간 데이터 업데이트
  useEffect(() => {
    if (analysisData?.video) {
      setFaceDetected(analysisData.video.faceDetected);
      setEyeContactPercentage(analysisData.video.eyeContactPercentage || 0);
    }
  }, [analysisData]);

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
      
      {/* 중앙 얼굴 가이드 박스 */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '25%',
        width: '50%',
        height: '70%',
        border: `3px dashed ${faceDetected ? '#10b981' : '#3b82f6'}`,
        borderRadius: '12px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease'
      }}>
        
        {/* 가이드 텍스트 */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          {faceDetected ? (
            <>
              ✅ 얼굴 감지됨<br/>
              <span style={{ fontSize: '12px', color: '#d1d5db' }}>
                아이컨택: {eyeContactPercentage}%
              </span>
            </>
          ) : (
            <>
              👤 얼굴을 이 박스 안에<br/>
              <span style={{ fontSize: '12px', color: '#d1d5db' }}>
                위치시켜주세요
              </span>
            </>
          )}
        </div>
        
        {/* 모서리 마커 */}
        <div style={{
          position: 'absolute',
          top: '-6px',
          left: '-6px',
          width: '24px',
          height: '24px',
          border: `4px solid ${faceDetected ? '#10b981' : '#3b82f6'}`,
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
          border: `4px solid ${faceDetected ? '#10b981' : '#3b82f6'}`,
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
          border: `4px solid ${faceDetected ? '#10b981' : '#3b82f6'}`,
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
          border: `4px solid ${faceDetected ? '#10b981' : '#3b82f6'}`,
          borderTop: 'transparent',
          borderLeft: 'transparent',
          borderRadius: '0 0 4px 0'
        }} />
      </div>
      
      {/* 카메라 타겟 (상단 중앙) */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '60px',
        border: `3px solid ${eyeContactPercentage > 60 ? '#10b981' : '#f59e0b'}`,
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: eyeContactPercentage > 60 ? 'glow 2s ease-in-out infinite' : 'pulse 3s ease-in-out infinite'
      }}>
        <Eye size={24} color="white" />
        
        {/* 카메라 타겟 설명 */}
        <div style={{
          position: 'absolute',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}>
          👁️ 여기를 보세요
        </div>
      </div>
      
      {/* 시선 연결선 (얼굴이 감지될 때만) */}
      {faceDetected && (
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          width: '2px',
          height: '30%',
          background: `linear-gradient(to bottom, ${eyeContactPercentage > 60 ? '#10b981' : '#f59e0b'}, transparent)`,
          transform: 'translateX(-50%)',
          opacity: 0.7
        }} />
      )}
      
      {/* 좌하단 - 거리 가이드 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        minWidth: '160px'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: '600' }}>📏 거리 가이드</div>
        <div style={{ marginBottom: '4px' }}>
          상태: {faceDetected ? '✅ 좋음' : '❌ 조정 필요'}
        </div>
        <div style={{ fontSize: '11px', color: '#d1d5db' }}>
          화면에서 30-50cm 거리 유지
        </div>
      </div>
      
      {/* 우하단 - 아이컨택 점수 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        minWidth: '120px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: '600' }}>👁️ 아이컨택</div>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          color: eyeContactPercentage > 60 ? '#10b981' : eyeContactPercentage > 30 ? '#f59e0b' : '#ef4444'
        }}>
          {eyeContactPercentage}%
        </div>
        <div style={{ fontSize: '10px', color: '#d1d5db', marginTop: '4px' }}>
          {eyeContactPercentage > 60 ? '우수함' : eyeContactPercentage > 30 ? '보통' : '향상 필요'}
        </div>
      </div>
      
      {/* 상단 중앙 - 전체 상태 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Target size={14} />
        {faceDetected && eyeContactPercentage > 60 ? (
          <span style={{ color: '#10b981' }}>✅ 최적 상태</span>
        ) : faceDetected ? (
          <span style={{ color: '#f59e0b' }}>⚠️ 시선 조정 필요</span>
        ) : (
          <span style={{ color: '#ef4444' }}>❌ 얼굴 위치 조정 필요</span>
        )}
      </div>
      
      {/* 컨트롤 버튼 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        pointerEvents: 'auto'
      }}>
        <button
          onClick={() => onCalibrationComplete?.(true)}
          style={{
            padding: '8px 16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          가이드 완료
        </button>
      </div>
      
      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { 
            transform: translateX(-50%) scale(1);
            opacity: 1;
          }
          50% { 
            transform: translateX(-50%) scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 5px #10b981;
            transform: translateX(-50%) scale(1);
          }
          50% { 
            box-shadow: 0 0 20px #10b981;
            transform: translateX(-50%) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleVisualGuide;