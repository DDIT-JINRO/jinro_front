import React, { useState, useEffect, useRef } from 'react';
import { Eye, Camera, CheckCircle, AlertCircle, Target, Smile } from 'lucide-react';

const FaceDetectionGuide = ({ 
  videoRef, 
  analysisData, 
  isMediaPipeReady, 
  showGuide = true,
  onCalibrationComplete 
}) => {
  const [facePosition, setFacePosition] = useState({
    detected: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    confidence: 0,
    distance: 'unknown' // close, optimal, far
  });
  
  const [calibrationStep, setCalibrationStep] = useState(0); // 0: 대기, 1: 조정 중, 2: 완료
  const [calibrationData, setCalibrationData] = useState({
    optimalDistance: null,
    faceDetectionCount: 0,
    goodFrameCount: 0
  });
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // 얼굴 감지 영역 계산 (이상적인 위치)
  const getIdealFaceArea = () => {
    if (!videoRef?.current) return null;
    
    const video = videoRef.current;
    const videoWidth = video.videoWidth || video.offsetWidth;
    const videoHeight = video.videoHeight || video.offsetHeight;
    
    // 이상적인 얼굴 위치: 화면 중앙 상단, 화면의 20-40% 크기
    const idealWidth = videoWidth * 0.3; // 화면 너비의 30%
    const idealHeight = videoHeight * 0.4; // 화면 높이의 40%
    const idealX = (videoWidth - idealWidth) / 2;
    const idealY = videoHeight * 0.15; // 상단에서 15% 위치
    
    return {
      x: idealX,
      y: idealY,
      width: idealWidth,
      height: idealHeight,
      centerX: idealX + idealWidth / 2,
      centerY: idealY + idealHeight / 2
    };
  };
  
  // 얼굴 거리 계산
  const calculateFaceDistance = (faceWidth, videoWidth) => {
    if (!faceWidth || !videoWidth) return 'unknown';
    
    const faceRatio = faceWidth / videoWidth;
    
    if (faceRatio > 0.4) return 'too_close';
    if (faceRatio > 0.2) return 'optimal';
    if (faceRatio > 0.1) return 'good';
    return 'too_far';
  };
  
  // 얼굴 위치 품질 계산
  const calculatePositionQuality = (face, ideal) => {
    if (!face.detected || !ideal) return 0;
    
    const faceCenterX = face.x + face.width / 2;
    const faceCenterY = face.y + face.height / 2;
    
    const horizontalOffset = Math.abs(faceCenterX - ideal.centerX) / ideal.width;
    const verticalOffset = Math.abs(faceCenterY - ideal.centerY) / ideal.height;
    
    const positionScore = Math.max(0, 100 - (horizontalOffset + verticalOffset) * 100);
    
    const sizeRatio = face.width / ideal.width;
    const sizeScore = sizeRatio > 0.8 && sizeRatio < 1.2 ? 100 : Math.max(0, 100 - Math.abs(1 - sizeRatio) * 100);
    
    return Math.round((positionScore + sizeScore) / 2);
  };
  
  // 캔버스에 가이드 그리기
  const drawGuide = () => {
    const canvas = canvasRef.current;
    const video = videoRef?.current;
    
    if (!canvas || !video || !showGuide) return;
    
    const ctx = canvas.getContext('2d');
    const rect = video.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const ideal = getIdealFaceArea();
    if (!ideal) return;
    
    // 비디오 크기에 맞게 좌표 조정
    const scaleX = canvas.width / (video.videoWidth || video.offsetWidth);
    const scaleY = canvas.height / (video.videoHeight || video.offsetHeight);
    
    const scaledIdeal = {
      x: ideal.x * scaleX,
      y: ideal.y * scaleY,
      width: ideal.width * scaleX,
      height: ideal.height * scaleY
    };
    
    // 이상적인 얼굴 영역 그리기
    ctx.strokeStyle = facePosition.detected && calculatePositionQuality(facePosition, ideal) > 70 
      ? '#10b981' : '#3b82f6';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(scaledIdeal.x, scaledIdeal.y, scaledIdeal.width, scaledIdeal.height);
    
    // 중앙 십자선 그리기
    const centerX = scaledIdeal.x + scaledIdeal.width / 2;
    const centerY = scaledIdeal.y + scaledIdeal.height / 2;
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY);
    ctx.lineTo(centerX + 15, centerY);
    ctx.moveTo(centerX, centerY - 15);
    ctx.lineTo(centerX, centerY + 15);
    ctx.stroke();
    
    // 감지된 얼굴 영역 그리기 (시뮬레이션 데이터 사용)
    if (facePosition.detected) {
      const quality = calculatePositionQuality(facePosition, ideal);
      
      ctx.strokeStyle = quality > 70 ? '#10b981' : quality > 40 ? '#f59e0b' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      
      const scaledFace = {
        x: facePosition.x * scaleX,
        y: facePosition.y * scaleY,
        width: facePosition.width * scaleX,
        height: facePosition.height * scaleY
      };
      
      ctx.strokeRect(scaledFace.x, scaledFace.y, scaledFace.width, scaledFace.height);
      
      // 품질 점수 표시
      ctx.fillStyle = quality > 70 ? '#10b981' : quality > 40 ? '#f59e0b' : '#ef4444';
      ctx.font = '14px sans-serif';
      ctx.fillText(`${quality}%`, scaledFace.x, scaledFace.y - 5);
    }
    
    // 안내 텍스트
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    
    const text = facePosition.detected 
      ? `얼굴 감지됨 (${facePosition.distance === 'optimal' ? '최적 거리' : 
          facePosition.distance === 'too_close' ? '너무 가까움' : 
          facePosition.distance === 'too_far' ? '너무 멀음' : '거리 조정 필요'})`
      : '점선 박스 안에 얼굴을 위치시켜주세요';
    
    const textWidth = ctx.measureText(text).width;
    const textX = (canvas.width - textWidth) / 2;
    const textY = 30;
    
    ctx.strokeText(text, textX, textY);
    ctx.fillText(text, textX, textY);
  };
  
  // 얼굴 감지 시뮬레이션 업데이트
  useEffect(() => {
    const updateFaceDetection = () => {
      const video = videoRef?.current;
      if (!video || !analysisData) return;
      
      // 실제 MediaPipe 데이터가 있으면 사용, 없으면 시뮬레이션
      if (analysisData.video.faceDetected) {
        const videoWidth = video.videoWidth || video.offsetWidth;
        const videoHeight = video.videoHeight || video.offsetHeight;
        
        // 시뮬레이션된 얼굴 위치 (실제로는 MediaPipe에서 받아와야 함)
        const simulatedFace = {
          detected: true,
          x: videoWidth * 0.3 + (Math.random() - 0.5) * videoWidth * 0.2,
          y: videoHeight * 0.2 + (Math.random() - 0.5) * videoHeight * 0.1,
          width: videoWidth * (0.25 + Math.random() * 0.15),
          height: videoHeight * (0.35 + Math.random() * 0.1),
          confidence: 0.8 + Math.random() * 0.2
        };
        
        simulatedFace.distance = calculateFaceDistance(simulatedFace.width, videoWidth);
        setFacePosition(simulatedFace);
        
        // 캘리브레이션 진행
        if (calibrationStep === 1) {
          const ideal = getIdealFaceArea();
          const quality = calculatePositionQuality(simulatedFace, ideal);
          
          setCalibrationData(prev => ({
            ...prev,
            faceDetectionCount: prev.faceDetectionCount + 1,
            goodFrameCount: quality > 70 ? prev.goodFrameCount + 1 : prev.goodFrameCount
          }));
          
          // 10프레임 중 8프레임이 좋은 품질이면 캘리브레이션 완료
          if (calibrationData.faceDetectionCount >= 10) {
            if (calibrationData.goodFrameCount >= 8) {
              setCalibrationStep(2);
              setTimeout(() => {
                onCalibrationComplete && onCalibrationComplete(true);
              }, 1000);
            } else {
              // 재시도
              setCalibrationData({
                optimalDistance: null,
                faceDetectionCount: 0,
                goodFrameCount: 0
              });
            }
          }
        }
      } else {
        setFacePosition(prev => ({ ...prev, detected: false }));
      }
    };
    
    const interval = setInterval(updateFaceDetection, 200); // 200ms마다 업데이트
    
    return () => clearInterval(interval);
  }, [analysisData, calibrationStep, calibrationData, onCalibrationComplete]);
  
  // 캔버스 그리기 루프
  useEffect(() => {
    const animate = () => {
      drawGuide();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (showGuide) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showGuide, facePosition]);
  
  // 캘리브레이션 시작
  const startCalibration = () => {
    setCalibrationStep(1);
    setCalibrationData({
      optimalDistance: null,
      faceDetectionCount: 0,
      goodFrameCount: 0
    });
  };
  
  if (!showGuide) return null;
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 캔버스 오버레이 */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
      
      {/* 상단 상태 표시 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        zIndex: 11,
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Camera size={16} />
          <span>얼굴 감지 가이드</span>
          {isMediaPipeReady ? (
            <span style={{ color: '#10b981' }}>AI 분석 활성</span>
          ) : (
            <span style={{ color: '#f59e0b' }}>시뮬레이션 모드</span>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {facePosition.detected ? (
              <CheckCircle size={12} style={{ color: '#10b981' }} />
            ) : (
              <AlertCircle size={12} style={{ color: '#ef4444' }} />
            )}
            <span>얼굴 감지: {facePosition.detected ? '성공' : '실패'}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Target size={12} />
            <span>거리: {
              facePosition.distance === 'optimal' ? '최적' :
              facePosition.distance === 'too_close' ? '가까움' :
              facePosition.distance === 'too_far' ? '멀음' : '조정 필요'
            }</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={12} />
            <span>아이컨택: {analysisData?.video?.eyeContactPercentage || 0}%</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Smile size={12} />
            <span>표정: {analysisData?.video?.smileDetection || 0}%</span>
          </div>
        </div>
      </div>
      
      {/* 캘리브레이션 패널 */}
      {calibrationStep !== 2 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          zIndex: 11
        }}>
          {calibrationStep === 0 && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>얼굴 위치 조정</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#ccc' }}>
                최적의 면접 분석을 위해 얼굴 위치를 조정해주세요
              </p>
              <button
                onClick={startCalibration}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                위치 조정 시작
              </button>
            </div>
          )}
          
          {calibrationStep === 1 && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>위치 조정 중...</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#ccc' }}>
                점선 박스 안에 얼굴을 위치시키고 가만히 있어주세요
              </p>
              <div style={{ 
                background: '#374151', 
                borderRadius: '4px', 
                padding: '8px',
                fontSize: '12px'
              }}>
                <div>진행도: {calibrationData.faceDetectionCount}/10</div>
                <div>좋은 프레임: {calibrationData.goodFrameCount}/8</div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 완료 메시지 */}
      {calibrationStep === 2 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(16, 185, 129, 0.95)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center',
          zIndex: 12
        }}>
          <CheckCircle size={32} style={{ marginBottom: '8px' }} />
          <h3 style={{ margin: '0 0 8px 0' }}>위치 조정 완료!</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>이제 면접을 시작할 수 있습니다</p>
        </div>
      )}
      
      {/* 하단 안내 메시지 */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        zIndex: 11,
        pointerEvents: 'none'
      }}>
        💡 팁: 화면에서 30-50cm 거리를 유지하고, 조명이 얼굴을 밝게 비추도록 하세요
      </div>
    </div>
  );
};

export default FaceDetectionGuide;