import { useEffect, useRef } from 'react';

/**
 * 오디오 비주얼라이저를 관리하는 커스텀 훅
 */
export const useAudioVisualizer = ({
  analyser,
  dataArray,
  mediaStream,
  cameraPermissionGranted,
  audioInitialized,
  isMicOn,
  isListening,
  currentAnswer
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Canvas 초기화
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.offsetWidth || 600;
        canvas.height = 80;
      } else {
        canvas.width = 600;
        canvas.height = 80;
      }
    }
  };

  // 비주얼라이저 시작
  const startVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId;
    
    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // 캔버스 클리어
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, width, height);
      
      // 상태별 처리
      if (!cameraPermissionGranted) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('카메라/마이크 권한이 필요합니다', width / 2, height / 2);
        animationId = requestAnimationFrame(draw);
        return;
      }
      
      if (!mediaStream) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('미디어 스트림 연결 중...', width / 2, height / 2);
        animationId = requestAnimationFrame(draw);
        return;
      }
      
      if (!audioInitialized) {
        ctx.fillStyle = '#3b82f6';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('오디오 분석기 초기화 중...', width / 2, height / 2);
        animationId = requestAnimationFrame(draw);
        return;
      }
      
      if (!isMicOn) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('마이크가 꺼져있습니다', width / 2, height / 2);
        animationId = requestAnimationFrame(draw);
        return;
      }
      
      // 오디오 트랙 확인
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (!audioTrack || !audioTrack.enabled) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('마이크가 비활성화되어 있습니다', width / 2, height / 2);
        animationId = requestAnimationFrame(draw);
        return;
      }
      
      // 실제 오디오 데이터 분석 및 비주얼라이제이션
      if (analyser && dataArray) {
        try {
          analyser.getByteFrequencyData(dataArray);
          
          // 오디오 레벨 계산
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / dataArray.length);
          const average = Math.round((rms / 255) * 100);
          
          if (average < 2) {
            // 음성 인식 상태에 따라 다른 메시지 표시
            if (isListening) {
              ctx.fillStyle = '#10b981';
              ctx.font = '12px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('🎤 음성 인식 대기 중 (말씀해 주세요)', width / 2, height / 2 - 8);
              ctx.fillStyle = '#6b7280';
              ctx.font = '10px sans-serif';
              ctx.fillText(`현재 답변: ${currentAnswer.length}자`, width / 2, height / 2 + 8);
            } else {
              ctx.fillStyle = '#374151';
              ctx.font = '12px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('⏸️ 음성 감지 대기 중 (시작 버튼을 눌러주세요)', width / 2, height / 2);
            }
            animationId = requestAnimationFrame(draw);
            return;
          }
          
          // 주파수 바 그리기
          const barWidth = (width / dataArray.length) * 2.5;
          let x = 0;
          
          for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * height * 0.9;
            
            if (barHeight > 2) {
              // 그라데이션 생성
              const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
              
              if (isListening) {
                // 음성 인식 중일 때는 초록색 계열
                if (dataArray[i] > 100) {
                  gradient.addColorStop(0, '#10b981');
                  gradient.addColorStop(0.5, '#34d399');
                  gradient.addColorStop(1, '#6ee7b7');
                } else if (dataArray[i] > 50) {
                  gradient.addColorStop(0, '#059669');
                  gradient.addColorStop(0.5, '#10b981');
                  gradient.addColorStop(1, '#34d399');
                } else {
                  gradient.addColorStop(0, '#047857');
                  gradient.addColorStop(1, '#10b981');
                }
              } else {
                // 음성 인식 대기 중일 때는 기본 색상
                if (dataArray[i] > 100) {
                  gradient.addColorStop(0, '#ef4444');
                  gradient.addColorStop(0.5, '#f59e0b');
                  gradient.addColorStop(1, '#eab308');
                } else if (dataArray[i] > 50) {
                  gradient.addColorStop(0, '#3b82f6');
                  gradient.addColorStop(0.5, '#06b6d4');
                  gradient.addColorStop(1, '#10b981');
                } else {
                  gradient.addColorStop(0, '#10b981');
                  gradient.addColorStop(1, '#34d399');
                }
              }
              
              ctx.fillStyle = gradient;
              ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            }
            
            x += barWidth + 1;
          }
          
          // 상태 정보 표시
          ctx.fillStyle = '#f3f4f6';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`🔊 ${Math.round(average)}`, width - 5, 15);
          
          // 음성 인식 상태 표시
          ctx.textAlign = 'left';
          ctx.fillStyle = isListening ? '#10b981' : '#6b7280';
          ctx.fillText(isListening ? '🎤 인식중' : '⏸️ 대기', 5, 15);
          
          // 현재 답변 길이 표시
          if (isListening && currentAnswer) {
            ctx.fillStyle = '#34d399';
            ctx.fillText(`${currentAnswer.length}자`, 5, height - 5);
          }
          
        } catch (error) {
          console.error('비주얼라이저 오류:', error);
          ctx.fillStyle = '#ef4444';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('오디오 분석 오류 발생', width / 2, height / 2);
        }
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('오디오 분석기 연결 중...', width / 2, height / 2);
      }
      
      animationId = requestAnimationFrame(draw);
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    draw();
    animationRef.current = animationId;
  };

  // Canvas 초기화 효과
  useEffect(() => {
    const timer = setTimeout(initCanvas, 100);
    window.addEventListener('resize', initCanvas);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initCanvas);
    };
  }, []);

  // 비주얼라이저 시작 효과
  useEffect(() => {
    if (canvasRef.current && cameraPermissionGranted !== null) {
      const timer = setTimeout(() => {
        startVisualization();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [analyser, dataArray, mediaStream, cameraPermissionGranted, audioInitialized, isMicOn, isListening, currentAnswer]);

  // 컴포넌트 언마운트 시 애니메이션 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    canvasRef
  };
};