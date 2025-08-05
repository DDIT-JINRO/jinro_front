import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Target, 
  Smile,
  User,
  Lightbulb,
  Settings
} from 'lucide-react';

const VisualGuideOverlay = ({ 
  videoRef, 
  analysisData, 
  isMediaPipeReady, 
  showGuide = true,
  onCalibrationComplete,
  onToggleGuide
}) => {
  const [guideStep, setGuideStep] = useState(0); // 0: 초기, 1: 위치조정, 2: 완료
  const [faceQuality, setFaceQuality] = useState({
    position: 0,    // 위치 점수 (0-100)
    size: 0,        // 크기 점수 (0-100)
    lighting: 0,    // 조명 점수 (0-100)
    stability: 0    // 안정성 점수 (0-100)
  });
  const [realTimeStats, setRealTimeStats] = useState({
    frameCount: 0,
    goodFrames: 0,
    lastUpdate: Date.now()
  });
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const calibrationTimerRef = useRef(null);
  
  // 이상적인 얼굴 영역 정의
  const IDEAL_FACE_AREA = {
    x: 0.25,        // 화면 왼쪽에서 25%
    y: 0.15,        // 화면 위에서 15%
    width: 0.5,     // 화면 너비의 50%
    height: 0.7,    // 화면 높이의 70%
    centerX: 0.5,   // 화면 중앙
    centerY: 0.35   // 화면 세로 35% 지점
  };
  
  // 시선 추적을 위한 카메라 위치
  const CAMERA_TARGET = {
    x: 0.5,         // 화면 중앙
    y: 0.05         // 화면 상단 5%
  };

  // 실시간 얼굴 품질 분석
  useEffect(() => {
    if (!analysisData?.video || !showGuide) return;
    
    const updateFaceQuality = () => {
      const video = analysisData.video;
      let positionScore = 0;
      let sizeScore = 0;
      let lightingScore = 60; // 기본 조명 점수
      let stabilityScore = 0;
      
      // 1. 위치 점수 계산
      if (video.faceDetected) {
        // 아이컨택 점수를 위치 점수로 활용
        positionScore = Math.min(100, video.eyeContactPercentage + 20);
        
        // 2. 크기 점수 (얼굴 감지율 기반)
        sizeScore = Math.min(100, video.faceDetectionRate);
        
        // 3. 조명 점수 (얼굴 신뢰도 기반)
        if (video.faceConfidence) {
          lightingScore = Math.min(100, video.faceConfidence + 10);
        }
        
        // 4. 안정성 점수 (자세 점수 활용)
        stabilityScore = Math.min(100, video.postureScore);
      }
      
      setFaceQuality({
        position: Math.round(positionScore),
        size: Math.round(sizeScore),
        lighting: Math.round(lightingScore),
        stability: Math.round(stabilityScore)
      });
      
      // 캘리브레이션 진행도 업데이트
      const currentTime = Date.now();
      if (currentTime - realTimeStats.lastUpdate > 100) { // 100ms마다 업데이트
        setRealTimeStats(prev => {
          const newFrameCount = prev.frameCount + 1;
          const isGoodFrame = positionScore > 70 && sizeScore > 70 && lightingScore > 70;
          const newGoodFrames = isGoodFrame ? prev.goodFrames + 1 : prev.goodFrames;
          
          // 자동 캘리브레이션 완료 체크
          if (guideStep === 1 && newFrameCount >= 50 && newGoodFrames >= 35) {
            setGuideStep(2);
            if (calibrationTimerRef.current) {
              clearTimeout(calibrationTimerRef.current);
            }
            calibrationTimerRef.current = setTimeout(() => {
              onCalibrationComplete?.(true);
              setGuideStep(0);
            }, 2000);
          }
          
          return {
            frameCount: newFrameCount,
            goodFrames: newGoodFrames,
            lastUpdate: currentTime
          };
        });
      }
    };
    
    const interval = setInterval(updateFaceQuality, 100);
    return () => clearInterval(interval);
  }, [analysisData, showGuide, guideStep, realTimeStats.lastUpdate, onCalibrationComplete]);

  // 가이드라인 그리기
  const drawGuideLines = () => {
    const canvas = canvasRef.current;
    const video = videoRef?.current;
    
    if (!canvas || !video || !showGuide) return;
    
    const ctx = canvas.getContext('2d');
    const rect = video.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 이상적인 얼굴 영역 계산 (픽셀 단위)
    const idealArea = {
      x: canvas.width * IDEAL_FACE_AREA.x,
      y: canvas.height * IDEAL_FACE_AREA.y,
      width: canvas.width * IDEAL_FACE_AREA.width,
      height: canvas.height * IDEAL_FACE_AREA.height,
      centerX: canvas.width * IDEAL_FACE_AREA.centerX,
      centerY: canvas.height * IDEAL_FACE_AREA.centerY
    };
    
    // 카메라 타겟 위치 (픽셀 단위)
    const cameraTarget = {
      x: canvas.width * CAMERA_TARGET.x,
      y: canvas.height * CAMERA_TARGET.y
    };
    
    // 1. 얼굴 위치 가이드 박스 그리기
    drawFaceGuideBox(ctx, idealArea);
    
    // 2. 시선 가이드 그리기
    drawGazeGuide(ctx, cameraTarget, idealArea.centerX, idealArea.centerY);
    
    // 3. 거리 가이드 그리기
    drawDistanceGuide(ctx, canvas.width, canvas.height);
    
    // 4. 조명 가이드 그리기
    drawLightingGuide(ctx, canvas.width);
    
    // 5. 실시간 피드백 그리기
    drawRealtimeFeedback(ctx, canvas.width, canvas.height);
  };
  
  // 얼굴 위치 가이드 박스
  const drawFaceGuideBox = (ctx, area) => {
    const quality = faceQuality.position;
    const color = quality > 80 ? '#10b981' : quality > 50 ? '#f59e0b' : '#ef4444';
    
    // 메인 가이드 박스 (점선)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([15, 10]);
    ctx.strokeRect(area.x, area.y, area.width, area.height);
    
    // 모서리 강조선
    ctx.setLineDash([]);
    ctx.lineWidth = 4;
    const cornerSize = 30;
    
    // 좌상단
    ctx.beginPath();
    ctx.moveTo(area.x, area.y + cornerSize);
    ctx.lineTo(area.x, area.y);
    ctx.lineTo(area.x + cornerSize, area.y);
    ctx.stroke();
    
    // 우상단
    ctx.beginPath();
    ctx.moveTo(area.x + area.width - cornerSize, area.y);
    ctx.lineTo(area.x + area.width, area.y);
    ctx.lineTo(area.x + area.width, area.y + cornerSize);
    ctx.stroke();
    
    // 좌하단
    ctx.beginPath();
    ctx.moveTo(area.x, area.y + area.height - cornerSize);
    ctx.lineTo(area.x, area.y + area.height);
    ctx.lineTo(area.x + cornerSize, area.y + area.height);
    ctx.stroke();
    
    // 우하단
    ctx.beginPath();
    ctx.moveTo(area.x + area.width - cornerSize, area.y + area.height);
    ctx.lineTo(area.x + area.width, area.y + area.height);
    ctx.lineTo(area.x + area.width, area.y + area.height - cornerSize);
    ctx.stroke();
    
    // 가이드 텍스트
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText('얼굴 위치', area.centerX, area.y - 10);
  };
  
  // 시선 가이드
  const drawGazeGuide = (ctx, target, faceCenterX, faceCenterY) => {
    const eyeContactQuality = analysisData?.video?.eyeContactPercentage || 0;
    const color = eyeContactQuality > 60 ? '#10b981' : eyeContactQuality > 30 ? '#f59e0b' : '#ef4444';
    
    // 카메라 아이콘 영역
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    // 카메라 타겟 원
    ctx.beginPath();
    ctx.arc(target.x, target.y + 20, 25, 0, 2 * Math.PI);
    ctx.stroke();
    
    // 카메라 렌즈
    ctx.beginPath();
    ctx.arc(target.x, target.y + 20, 15, 0, 2 * Math.PI);
    ctx.fillStyle = `${color}40`; // 반투명
    ctx.fill();
    
    // 시선 연결선 (얼굴 중심에서 카메라로)
    if (analysisData?.video?.faceDetected) {
      ctx.strokeStyle = `${color}80`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(faceCenterX, faceCenterY);
      ctx.lineTo(target.x, target.y + 20);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // 시선 가이드 텍스트
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText('👁️ 카메라 보기', target.x, target.y + 60);
  };
  
  // 거리 가이드
  const drawDistanceGuide = (ctx, width, height) => {
    const sizeQuality = faceQuality.size;
    let distanceText = '';
    let color = '#6b7280';
    
    if (sizeQuality > 80) {
      distanceText = '✅ 적절한 거리';
      color = '#10b981';
    } else if (sizeQuality > 60) {
      distanceText = '👌 좋은 거리';
      color = '#10b981';
    } else if (sizeQuality > 40) {
      distanceText = '⚠️ 거리 조정 필요';
      color = '#f59e0b';
    } else if (sizeQuality > 20) {
      distanceText = '📏 너무 멀어요';
      color = '#ef4444';
    } else {
      distanceText = '📏 너무 가까워요';
      color = '#ef4444';
    }
    
    // 거리 가이드 표시
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, height - 80, 180, 60);
    
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.fillText(distanceText, 20, height - 55);
    
    // 거리 바
    const barWidth = 160;
    const barHeight = 6;
    const barY = height - 35;
    
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(20, barY, barWidth, barHeight);
    
    ctx.fillStyle = color;
    const fillWidth = Math.min(barWidth, (sizeQuality / 100) * barWidth);
    ctx.fillRect(20, barY, fillWidth, barHeight);
  };
  
  // 조명 가이드
  const drawLightingGuide = (ctx, width) => {
    const lightingQuality = faceQuality.lighting;
    let lightingText = '';
    let color = '#6b7280';
    
    if (lightingQuality > 80) {
      lightingText = '💡 조명 좋음';
      color = '#10b981';
    } else if (lightingQuality > 60) {
      lightingText = '💡 조명 보통';
      color = '#f59e0b';
    } else {
      lightingText = '💡 조명 부족';
      color = '#ef4444';
    }
    
    // 조명 가이드 표시
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width - 190, 10, 180, 60);
    
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.fillText(lightingText, width - 180, 35);
    
    // 조명 바
    const barWidth = 160;
    const barHeight = 6;
    const barY = 45;
    
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(width - 180, barY, barWidth, barHeight);
    
    ctx.fillStyle = color;
    const fillWidth = Math.min(barWidth, (lightingQuality / 100) * barWidth);
    ctx.fillRect(width - 180, barY, fillWidth, barHeight);
  };
  
  // 실시간 피드백
  const drawRealtimeFeedback = (ctx, width, height) => {
    if (guideStep === 0) return;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    if (guideStep === 1) {
      // 캘리브레이션 진행 중
      const progress = Math.min(100, (realTimeStats.goodFrames / 35) * 100);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(centerX - 150, centerY - 50, 300, 100);
      
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('🎯 위치 조정 중...', centerX, centerY - 20);
      
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#d1d5db';
      ctx.fillText(`진행률: ${Math.round(progress)}%`, centerX, centerY);
      
      // 진행 바
      ctx.fillStyle = '#374151';
      ctx.fillRect(centerX - 100, centerY + 15, 200, 6);
      
      ctx.fillStyle = '#10b981';
      ctx.fillRect(centerX - 100, centerY + 15, (progress / 100) * 200, 6);
      
    } else if (guideStep === 2) {
      // 완료
      ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
      ctx.fillRect(centerX - 120, centerY - 40, 240, 80);
      
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('✅ 조정 완료!', centerX, centerY - 10);
      
      ctx.font = '14px sans-serif';
      ctx.fillText('면접을 시작하세요', centerX, centerY + 15);
    }
  };
  
  // 애니메이션 루프
  useEffect(() => {
    if (!showGuide) return;
    
    const animate = () => {
      drawGuideLines();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showGuide, faceQuality, guideStep, realTimeStats]);
  
  // 캘리브레이션 시작
  const startCalibration = () => {
    setGuideStep(1);
    setRealTimeStats({
      frameCount: 0,
      goodFrames: 0,
      lastUpdate: Date.now()
    });
  };
  
  // 캘리브레이션 건너뛰기
  const skipCalibration = () => {
    setGuideStep(0);
    onCalibrationComplete?.(true);
  };
  
  if (!showGuide) return null;
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 가이드 캔버스 */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 15
        }}
      />
      
      {/* 컨트롤 패널 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 20
      }}>
        {guideStep === 0 && (
          <>
            <button
              onClick={startCalibration}
              style={{
                padding: '10px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Target size={14} />
              위치 조정 시작
            </button>
            <button
              onClick={skipCalibration}
              style={{
                padding: '10px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              건너뛰기
            </button>
            <button
              onClick={onToggleGuide}
              style={{
                padding: '10px 16px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <Eye size={14} />
            </button>
          </>
        )}
      </div>
      
      {/* 품질 상태 패널 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '11px',
        minWidth: '150px',
        zIndex: 20
      }}>
        <div style={{ marginBottom: '8px', fontWeight: '600' }}>📊 가이드 상태</div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>위치:</span>
          <span style={{ color: faceQuality.position > 70 ? '#10b981' : '#f59e0b' }}>
            {faceQuality.position}%
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>크기:</span>
          <span style={{ color: faceQuality.size > 70 ? '#10b981' : '#f59e0b' }}>
            {faceQuality.size}%
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>조명:</span>
          <span style={{ color: faceQuality.lighting > 70 ? '#10b981' : '#f59e0b' }}>
            {faceQuality.lighting}%
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>안정성:</span>
          <span style={{ color: faceQuality.stability > 70 ? '#10b981' : '#f59e0b' }}>
            {faceQuality.stability}%
          </span>
        </div>
        
        {guideStep === 1 && (
          <div style={{ 
            marginTop: '8px', 
            paddingTop: '8px', 
            borderTop: '1px solid #4b5563',
            fontSize: '10px',
            color: '#d1d5db'
          }}>
            좋은 프레임: {realTimeStats.goodFrames}/35
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualGuideOverlay;