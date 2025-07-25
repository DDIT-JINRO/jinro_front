import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, MicOff, CameraOff, Play, Pause, SkipForward, X } from 'lucide-react';

const MockInterviewScreen = () => {
  // 상태 관리
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [mediaStream, setMediaStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  
  // 새로 추가: 오디오 초기화 상태 추적
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  
  // 질문 데이터 상태
  const [questions, setQuestions] = useState([
    "자기소개를 해주세요.",
    "지원 동기를 말씀해 주세요.",
    "본인의 장점과 단점은 무엇인가요?",
    "5년 후 본인의 모습을 어떻게 그리고 있나요?",
    "마지막으로 하고 싶은 말씀이 있으신가요?"
  ]);
  const [questionsLoaded, setQuestionsLoaded] = useState(true);
  
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
  
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  
  // 타이머 원형 프로그레스 계산
  const initialTime = 120;
  const timerProgress = ((initialTime - timeLeft) / initialTime) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (timerProgress / 100) * circumference;

  // 웹캠 및 오디오 시작 (수정된 버전)
  const startCamera = async () => {
    try {
      console.log('🎥 카메라 및 마이크 권한 요청 중...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('✅ 미디어 스트림 획득 성공');
      setMediaStream(stream);
      setCameraPermissionGranted(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 오디오 분석 설정 (개선된 버전)
      await setupAudioAnalysis(stream);
      
      // MediaRecorder 설정
      setupMediaRecorder(stream);
      
    } catch (error) {
      console.error('❌ 카메라 접근 오류:', error);
      setCameraPermissionGranted(false);
      alert('카메라와 마이크 접근 권한이 필요합니다.');
    }
  };

  // 오디오 분석 설정 (별도 함수로 분리)
  const setupAudioAnalysis = async (stream) => {
    try {
      console.log('🔊 오디오 분석기 설정 시작...');
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // AudioContext가 suspended 상태일 경우 resume
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      
      // 더 나은 오디오 분석을 위한 설정
      analyserNode.fftSize = 512; // 256에서 512로 증가
      analyserNode.smoothingTimeConstant = 0.8;
      analyserNode.minDecibels = -90;
      analyserNode.maxDecibels = -10;
      
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArr = new Uint8Array(bufferLength);
      
      source.connect(analyserNode);
      
      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      setDataArray(dataArr);
      setAudioInitialized(true);
      
      console.log('✅ 오디오 분석기 설정 완료:', { 
        bufferLength, 
        contextState: audioCtx.state,
        fftSize: analyserNode.fftSize 
      });
      
    } catch (error) {
      console.error('❌ 오디오 분석 설정 실패:', error);
      setAudioInitialized(false);
    }
  };

  // MediaRecorder 설정
  const setupMediaRecorder = (stream) => {
    try {
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
      };
      
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
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedVideoURL(url);
        setRecordedChunks(chunks);
      };
      
      recorder.onstart = () => {
        chunks.length = 0;
      };
      
      recorder.onerror = (error) => {
        console.error('❌ 녹화 오류:', error);
      };
      
      setMediaRecorder(recorder);
      
    } catch (error) {
      console.error('MediaRecorder 설정 실패:', error);
    }
  };

  // 녹화 토글
  const toggleRecording = () => {
    if (!mediaRecorder) return;

    if (isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      if (mediaRecorder.state === 'inactive') {
        mediaRecorder.start(1000);
        setIsRecording(true);
      }
    }
  };

  // 녹화 파일 다운로드
  const downloadRecording = () => {
    if (!recordedVideoURL) return;

    const currentDate = new Date();
    const dateString = currentDate.toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `모의면접_${dateString}.webm`;

    const a = document.createElement('a');
    a.href = recordedVideoURL;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 녹화 파일 삭제
  const clearRecording = () => {
    if (recordedVideoURL) {
      URL.revokeObjectURL(recordedVideoURL);
      setRecordedVideoURL(null);
      setRecordedChunks([]);
    }
  };

  // 미디어 스트림 토글
  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = async () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        
        // 마이크를 다시 켤 때 AudioContext 재활성화
        if (audioTrack.enabled && audioContext && audioContext.state === 'suspended') {
          try {
            await audioContext.resume();
            console.log('🔊 AudioContext 재활성화됨');
          } catch (error) {
            console.error('AudioContext 재활성화 실패:', error);
          }
        }
      }
    }
  };

  // 타이머 관련
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
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
    
    if (recordedVideoURL) {
      const shouldDownload = confirm('녹화된 면접 영상이 있습니다. 다운로드하시겠습니까?');
      if (shouldDownload) {
        downloadRecording();
      }
    }
    
    alert('면접이 종료되었습니다!');
  };

  // 개선된 오디오 비주얼라이저
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
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          
          if (average < 2) {
            ctx.fillStyle = '#374151';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🎤 말씀해 주세요 (음성 감지 대기 중)', width / 2, height / 2);
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
              
              ctx.fillStyle = gradient;
              ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            }
            
            x += barWidth + 1;
          }
          
          // 볼륨 레벨 표시
          ctx.fillStyle = '#f3f4f6';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`🔊 ${Math.round(average)}`, width - 5, 15);
          
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
    console.log('🚀 MockInterviewScreen 컴포넌트 마운트');
    startCamera();
    
    return () => {
      console.log('🔄 MockInterviewScreen 컴포넌트 언마운트');
      
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
      }
    };

    const timer = setTimeout(initCanvas, 100);
    window.addEventListener('resize', initCanvas);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initCanvas);
    };
  }, []);

  // 비주얼라이저 시작 (조건부 실행)
  useEffect(() => {
    if (canvasRef.current && (mediaStream || cameraPermissionGranted !== null)) {
      const timer = setTimeout(() => {
        startVisualization();
      }, 200); // 500ms에서 200ms로 단축
      
      return () => clearTimeout(timer);
    }
  }, [canvasRef.current, mediaStream, audioInitialized, cameraPermissionGranted]);

  // 오디오 상태 변화 추적
  useEffect(() => {
    console.log('🎙️ 오디오 상태 변경:', {
      isMicOn,
      audioInitialized,
      hasMediaStream: !!mediaStream,
      hasAnalyser: !!analyser,
      audioContextState: audioContext?.state
    });
  }, [isMicOn, mediaStream, audioInitialized, analyser, audioContext]);

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
              모의면접 진행 중 {isRecording ? '(🔴 녹화 중)' : ''} ({questions.length}개 질문)
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
              
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="transparent"
                  />
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
                  {questions[currentQuestion] || '질문을 불러오는 중...'}
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
                    backgroundColor: isMicOn && audioInitialized ? '#10b981' : '#ef4444' 
                  }}>
                    {isMicOn ? <Mic size={16} style={{ color: 'white' }} /> : <MicOff size={16} style={{ color: 'white' }} />}
                  </div>
                </div>
              </div>
              
              {/* 개선된 오디오 비주얼라이저 */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px' 
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    음성 레벨 분석
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    <div style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: 
                        !cameraPermissionGranted ? '#ef4444' :
                        !mediaStream ? '#f59e0b' :
                        !audioInitialized ? '#3b82f6' :
                        isMicOn ? '#10b981' : '#6b7280'
                    }}></div>
                    <span>
                      {!cameraPermissionGranted ? '권한 필요' :
                       !mediaStream ? '연결 중' :
                       !audioInitialized ? '초기화 중' :
                       isMicOn ? '마이크 ON' : '마이크 OFF'}
                    </span>
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
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  textAlign: 'center', 
                  margin: '8px 0 0 0',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px'
                }}>
                  <span>🟢 정상 (0-50)</span>
                  <span>🔵 보통 (50-100)</span>
                  <span>🟡 크게 (100+)</span>
                </div>
              </div>
              
              {/* 녹화 관리 */}
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
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
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
                    >
                      🗑️
                    </button>
                  )}
                </div>
                
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
                    >
                      💾 면접 영상 다운로드 (.webm)
                    </button>
                  </div>
                )}
                
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