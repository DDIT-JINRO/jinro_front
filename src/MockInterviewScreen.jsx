import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, MicOff, CameraOff, Play, Pause, SkipForward, X } from 'lucide-react';

const MockInterviewScreen = () => {
  // 상태 관리
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2분 = 120초
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [mediaStream, setMediaStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  
  // 녹화 관련 상태
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordedVideoURL, setRecordedVideoURL] = useState(null);
  
  // Refs
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // 샘플 질문 데이터
  const questions = [
    "자기소개를 해주세요.",
    "지원 동기를 말씀해 주세요.",
    "본인의 장점과 단점은 무엇인가요?",
    "5년 후 본인의 모습을 어떻게 그리고 있나요?",
    "마지막으로 하고 싶은 말씀이 있으신가요?"
  ];
  
  const totalQuestions = questions.length;
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;
  
  // 타이머 원형 프로그레스 계산
  const initialTime = 120;
  const timerProgress = ((initialTime - timeLeft) / initialTime) * 100;
  const circumference = 2 * Math.PI * 45; // 반지름 45px
  const strokeDashoffset = circumference - (timerProgress / 100) * circumference;

  // 웹캠 및 오디오 분석 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 오디오 분석 설정
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      
      analyserNode.fftSize = 256;
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArr = new Uint8Array(bufferLength);
      
      source.connect(analyserNode);
      
      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      setDataArray(dataArr);
      
      console.log('오디오 컨텍스트 초기화 완료:', { bufferLength, audioCtx });
      
      // MediaRecorder 설정
      setupMediaRecorder(stream);
      
    } catch (error) {
      console.error('카메라 접근 오류:', error);
      alert('카메라와 마이크 접근 권한이 필요합니다.');
    }
  };

  // MediaRecorder 설정
  const setupMediaRecorder = (stream) => {
    try {
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus', // 최고 품질
        videoBitsPerSecond: 2500000, // 2.5 Mbps
        audioBitsPerSecond: 128000   // 128 kbps
      };
      
      // 지원되지 않는 경우 대안 사용
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/webm';
        }
      }
      
      const recorder = new MediaRecorder(stream, options);
      
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
          console.log('📹 녹화 데이터 청크 추가:', event.data.size, 'bytes');
        }
      };
      
      recorder.onstop = () => {
        console.log('📹 녹화 완료, 총', chunks.length, '개 청크');
        const blob = new Blob(chunks, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedVideoURL(url);
        setRecordedChunks(chunks);
        console.log('🎥 녹화 파일 생성 완료:', blob.size, 'bytes');
      };
      
      recorder.onstart = () => {
        console.log('🔴 녹화 시작');
        chunks.length = 0; // 청크 배열 초기화
      };
      
      recorder.onerror = (error) => {
        console.error('❌ 녹화 오류:', error);
        alert('녹화 중 오류가 발생했습니다.');
      };
      
      setMediaRecorder(recorder);
      console.log('📹 MediaRecorder 설정 완료:', options.mimeType);
      
    } catch (error) {
      console.error('MediaRecorder 설정 실패:', error);
    }
  };

  // 녹화 시작/정지
  const toggleRecording = () => {
    if (!mediaRecorder) {
      alert('녹화 준비가 완료되지 않았습니다.');
      return;
    }

    if (isRecording) {
      // 녹화 정지
      mediaRecorder.stop();
      setIsRecording(false);
      console.log('⏹️ 녹화 정지 요청');
    } else {
      // 녹화 시작
      if (mediaRecorder.state === 'inactive') {
        mediaRecorder.start(1000); // 1초마다 데이터 청크 생성
        setIsRecording(true);
        console.log('▶️ 녹화 시작 요청');
      }
    }
  };

  // 녹화 파일 다운로드
  const downloadRecording = () => {
    if (!recordedVideoURL) {
      alert('다운로드할 녹화 파일이 없습니다.');
      return;
    }

    const currentDate = new Date();
    const dateString = currentDate.toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `모의면접_${dateString}.webm`;

    const a = document.createElement('a');
    a.href = recordedVideoURL;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    console.log('💾 파일 다운로드:', fileName);
  };

  // 녹화 파일 삭제
  const clearRecording = () => {
    if (recordedVideoURL) {
      URL.revokeObjectURL(recordedVideoURL);
      setRecordedVideoURL(null);
      setRecordedChunks([]);
      console.log('🗑️ 녹화 파일 삭제');
    }
  };

  // 미디어 스트림 토글
  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        console.log('카메라 상태 변경:', videoTrack.enabled ? 'ON' : 'OFF');
      }
    }
  };

  const toggleMic = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        console.log('마이크 상태 변경:', audioTrack.enabled ? 'ON' : 'OFF');
        console.log('오디오 트랙 정보:', {
          kind: audioTrack.kind,
          label: audioTrack.label,
          enabled: audioTrack.enabled,
          readyState: audioTrack.readyState
        });
      }
    } else {
      console.log('미디어 스트림이 없습니다');
    }
  };

  // 타이머 관련
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setTimeLeft(120);
    setIsTimerRunning(false);
  };

  // 다음 질문으로 이동
  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(120);
      setIsTimerRunning(false);
    }
  };

  // 면접 종료
  const endInterview = () => {
    setIsTimerRunning(false);
    
    // 녹화 중이면 정지
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // 녹화된 파일이 있으면 다운로드 안내
    if (recordedVideoURL) {
      const shouldDownload = confirm('녹화된 면접 영상이 있습니다. 다운로드하시겠습니까?');
      if (shouldDownload) {
        downloadRecording();
      }
    }
    
    alert('면접이 종료되었습니다. AI 분석 결과를 확인해보세요!');
  };

  // 오디오 비주얼라이저
  const startVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas가 없습니다');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Canvas context를 가져올 수 없습니다');
      return;
    }
    
    let animationId;
    
    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // 캔버스 클리어
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, width, height);
      
      // 마이크가 꺼져있거나 미디어 스트림이 없으면 정적 상태 표시
      if (!isMicOn || !mediaStream) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          !mediaStream ? '마이크 연결 중...' : '마이크가 꺼져있습니다', 
          width / 2, 
          height / 2
        );
        animationId = requestAnimationFrame(draw);
        return;
      }
      
      // 실제 마이크 트랙 상태 확인
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (!audioTrack || !audioTrack.enabled) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('마이크가 비활성화되어 있습니다', width / 2, height / 2);
        animationId = requestAnimationFrame(draw);
        return;
      }
      
      // 오디오 분석기가 있으면 실제 데이터 사용
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        
        // 전체 볼륨 레벨 계산 (실제 음성 감지)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        // 음성이 감지되지 않으면 조용한 상태 표시
        if (average < 1) {
          ctx.fillStyle = '#374151';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('조용한 상태 - 말씀해 보세요', width / 2, height / 2);
          animationId = requestAnimationFrame(draw);
          return;
        }
        
        // 실제 오디오 데이터로 파형 그리기
        const barWidth = (width / dataArray.length) * 2.5;
        let x = 0;
        
        for (let i = 0; i < dataArray.length; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.8;
          
          if (barHeight > 1) {
            // 그라디언트 생성
            const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
            gradient.addColorStop(0, '#3b82f6');
            gradient.addColorStop(0.5, '#06b6d4');
            gradient.addColorStop(1, '#10b981');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          }
          
          x += barWidth + 1;
        }
      } else {
        // 분석기가 없으면 준비 중 표시
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('오디오 분석기 초기화 중...', width / 2, height / 2);
      }
      
      animationId = requestAnimationFrame(draw);
    };
    
    // 기존 애니메이션 정리
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    console.log('비주얼라이저 시작됨');
    draw();
    animationRef.current = animationId;
  };

  // 타이머 효과
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      alert('시간이 종료되었습니다!');
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // 컴포넌트 마운트 시 카메라 시작
  useEffect(() => {
    startCamera();
    
    return () => {
      // 정리 작업
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
      if (recordedVideoURL) {
        URL.revokeObjectURL(recordedVideoURL);
      }
    };
  }, []);

  // Canvas 초기화
  useEffect(() => {
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
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        console.log('Canvas 초기화됨:', { width: canvas.width, height: canvas.height });
      }
    };

    setTimeout(initCanvas, 100);
    window.addEventListener('resize', initCanvas);
    
    return () => window.removeEventListener('resize', initCanvas);
  }, []);

  // 비주얼라이저 시작
  useEffect(() => {
    if (canvasRef.current) {
      setTimeout(() => {
        startVisualization();
      }, 500);
    }
  }, [canvasRef.current]);

  // 마이크 상태 변화 추적
  useEffect(() => {
    console.log('🎙️ React 상태 - 마이크 상태 변경:', isMicOn ? 'ON' : 'OFF');
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        console.log('🎵 실제 오디오 트랙 상태:', {
          enabled: audioTrack.enabled,
          readyState: audioTrack.readyState,
          kind: audioTrack.kind,
          label: audioTrack.label || '기본 마이크'
        });
      }
    }
  }, [isMicOn, mediaStream]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      {/* 상단 진행 상태바 */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: isRecording ? '#ef4444' : '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {isRecording && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
              )}
              모의면접 진행 중 {isRecording ? '(🔴 녹화 중)' : ''}
            </h2>
            <button
              onClick={endInterview}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              <X size={16} />
              면접 종료
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
              질문 {currentQuestion + 1} / {totalQuestions}
            </span>
            <div style={{ flex: 1, backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '12px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  backgroundColor: '#3b82f6', 
                  transition: 'all 0.3s ease-out',
                  width: `${progressPercentage}%`
                }}
              />
            </div>
            <span style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
              {Math.round(progressPercentage)}% 완료
            </span>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div style={{ flex: 1, padding: '24px' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          height: '100%', 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 2fr' : '1fr',
          gap: '24px'
        }}>
          
          {/* 왼쪽: 타이머 및 컨트롤 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 원형 타이머 */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
              padding: '24px', 
              textAlign: 'center' 
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>답변 시간</h3>
              
              {/* SVG 원형 프로그레스 바 */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  {/* 배경 원 */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* 프로그레스 원 */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke={timeLeft <= 30 ? '#ef4444' : '#3b82f6'}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.3s ease'
                    }}
                  />
                </svg>
                {/* 중앙 시간 텍스트 */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: timeLeft <= 30 ? '#ef4444' : '#1f2937'
                }}>
                  {formatTime(timeLeft)}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {!isTimerRunning ? (
                  <button
                    onClick={startTimer}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                  >
                    <Play size={16} />
                    시작
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                  >
                    <Pause size={16} />
                    일시정지
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                >
                  리셋
                </button>
              </div>
            </div>

            {/* 질문 영역 */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
              padding: '24px' 
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>현재 질문</h3>
              <div style={{ 
                backgroundColor: '#dbeafe', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '16px' 
              }}>
                <p style={{ color: '#1f2937', lineHeight: '1.6', margin: 0 }}>
                  {questions[currentQuestion]}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {currentQuestion < totalQuestions - 1 && (
                  <button
                    onClick={nextQuestion}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    <SkipForward size={16} />
                    다음 질문
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 웹캠 화면 */}
          <div>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
              padding: '24px', 
              height: '100%' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>면접 화면</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* 녹화 버튼 */}
                  <button
                    onClick={toggleRecording}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      backgroundColor: isRecording ? '#ef4444' : '#10b981',
                      color: 'white',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = isRecording ? '#dc2626' : '#059669'}
                    onMouseOut={(e) => e.target.style.backgroundColor = isRecording ? '#ef4444' : '#10b981'}
                    title={isRecording ? '녹화 정지' : '녹화 시작'}
                  >
                    {isRecording ? (
                      <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '2px' }} />
                    ) : (
                      <div style={{ 
                        width: '0', 
                        height: '0', 
                        borderLeft: '12px solid white',
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        marginLeft: '2px'
                      }} />
                    )}
                  </button>
                  
                  <button
                    onClick={toggleCamera}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      backgroundColor: isCameraOn ? '#3b82f6' : '#ef4444',
                      color: 'white'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = isCameraOn ? '#2563eb' : '#dc2626'}
                    onMouseOut={(e) => e.target.style.backgroundColor = isCameraOn ? '#3b82f6' : '#ef4444'}
                  >
                    {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
                  </button>
                  <button
                    onClick={toggleMic}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      backgroundColor: isMicOn ? '#3b82f6' : '#ef4444',
                      color: 'white'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = isMicOn ? '#2563eb' : '#dc2626'}
                    onMouseOut={(e) => e.target.style.backgroundColor = isMicOn ? '#3b82f6' : '#ef4444'}
                  >
                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                </div>
              </div>
              
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
                      <p style={{ fontSize: '14px', opacity: 0.75, margin: 0 }}>카메라가 꺼져있습니다</p>
                    </div>
                  </div>
                )}
                
                {/* 녹화 상태 표시 */}
                <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  {isRecording && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      backgroundColor: '#ef4444', 
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
                      REC
                    </div>
                  )}
                </div>
                
                {/* 마이크 상태 표시 */}
                <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: isMicOn ? '#10b981' : '#ef4444' 
                  }}>
                    {isMicOn ? <Mic size={16} style={{ color: 'white' }} /> : <MicOff size={16} style={{ color: 'white' }} />}
                  </div>
                </div>
              </div>
              
              {/* 오디오 비주얼라이저 */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px' 
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    음성 레벨
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    <div style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: isMicOn ? '#10b981' : '#ef4444' 
                    }}></div>
                    {isMicOn ? '마이크 ON' : '마이크 OFF'}
                  </div>
                </div>
                <div style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  backgroundColor: '#1f2937'
                }}>
                  <canvas
                    ref={canvasRef}
                    style={{ 
                      width: '100%', 
                      height: '80px', 
                      display: 'block'
                    }}
                  />
                </div>
                {!isMicOn && (
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    textAlign: 'center', 
                    margin: '8px 0 0 0' 
                  }}>
                    마이크를 켜면 음성 파형을 확인할 수 있습니다
                  </p>
                )}
              </div>
              
              {/* 녹화 상태 및 다운로드 */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    녹화 관리
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px',
                    color: isRecording ? '#ef4444' : '#6b7280'
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: isRecording ? '#ef4444' : '#6b7280',
                      animation: isRecording ? 'pulse 2s infinite' : 'none'
                    }}></div>
                    {isRecording ? '🔴 녹화 중' : '⭕ 대기 중'}
                  </div>
                </div>
                
                {/* 녹화 컨트롤 */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <button
                    onClick={toggleRecording}
                    disabled={!mediaRecorder}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: isRecording ? '#ef4444' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: mediaRecorder ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontWeight: '600',
                      opacity: mediaRecorder ? 1 : 0.5,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (mediaRecorder) {
                        e.target.style.backgroundColor = isRecording ? '#dc2626' : '#059669';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (mediaRecorder) {
                        e.target.style.backgroundColor = isRecording ? '#ef4444' : '#10b981';
                      }
                    }}
                  >
                    {isRecording ? '⏹️ 녹화 정지' : '▶️ 녹화 시작'}
                  </button>
                  
                  {recordedVideoURL && (
                    <button
                      onClick={clearRecording}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                
                {/* 다운로드 영역 */}
                {recordedVideoURL && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    padding: '12px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#166534', 
                        fontWeight: '600' 
                      }}>
                        ✅ 녹화 완료!
                      </span>
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#059669'
                      }}>
                        {recordedChunks.length}개 청크
                      </span>
                    </div>
                    
                    <button
                      onClick={downloadRecording}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                    >
                      💾 면접 영상 다운로드 (.webm)
                    </button>
                    
                    <p style={{
                      fontSize: '10px',
                      color: '#059669',
                      margin: '8px 0 0 0',
                      textAlign: 'center'
                    }}>
                      파일명: 모의면접_{new Date().toISOString().slice(0, 10)}.webm
                    </p>
                  </div>
                )}
                
                {/* 녹화 안내 */}
                {!recordedVideoURL && !isRecording && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '11px',
                    color: '#92400e'
                  }}>
                    💡 면접 진행 중 언제든지 녹화를 시작할 수 있습니다
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
};

export default MockInterviewScreen;