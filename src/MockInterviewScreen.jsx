import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, MicOff, CameraOff, Play, Pause, SkipForward, X, FileText, CheckCircle } from 'lucide-react';

// 결과 화면 컴포넌트
const InterviewResultScreen = ({ questions, answers, onClose, onRestart }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
          padding: '32px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: '#10b981', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle size={40} style={{ color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
            🎉 면접이 완료되었습니다!
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
            총 {questions.length}개의 질문에 대한 답변이 기록되었습니다.
          </p>
        </div>

        {/* 질문별 답변 결과 */}
        {questions.map((question, index) => (
          <div key={index} style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
            padding: '24px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '16px'
            }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                  {index + 1}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                질문 {index + 1}
              </h3>
            </div>
            
            {/* 질문 */}
            <div style={{ 
              backgroundColor: '#dbeafe', 
              borderRadius: '8px', 
              padding: '16px',
              marginBottom: '16px'
            }}>
              <p style={{ color: '#1e40af', fontSize: '16px', fontWeight: '500', margin: 0 }}>
                Q. {question}
              </p>
            </div>
            
            {/* 답변 */}
            <div style={{ 
              backgroundColor: '#f0fdf4', 
              borderRadius: '8px', 
              padding: '16px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px'
              }}>
                <FileText size={16} style={{ color: '#059669', marginRight: '8px' }} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                  음성 인식 결과
                </span>
              </div>
              <p style={{ 
                color: '#064e3b', 
                fontSize: '15px', 
                lineHeight: '1.6', 
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {answers[index] || '답변이 기록되지 않았습니다.'}
              </p>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb'
              }}>
                📊 답변 길이: {answers[index] ? answers[index].length : 0}자 | 
                🕐 예상 답변 시간: {answers[index] ? Math.ceil(answers[index].length / 200) : 0}분
              </div>
            </div>
          </div>
        ))}

        {/* 액션 버튼 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
          padding: '24px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onRestart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            🔄 다시 면접 보기
          </button>
          
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            <X size={16} />
            면접 종료
          </button>
        </div>
      </div>
    </div>
  );
};

const MockInterviewScreen = () => {
  // 기존 상태 관리
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [mediaStream, setMediaStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordedVideoURL, setRecordedVideoURL] = useState(null);
  
  // 새로 추가: 음성 인식 관련 상태
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [answers, setAnswers] = useState([]); // 각 질문에 대한 답변 저장
  const [currentAnswer, setCurrentAnswer] = useState(''); // 현재 질문의 답변
  const [showResults, setShowResults] = useState(false); // 결과 화면 표시 여부
  const [speechSupported, setSpeechSupported] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const questionsInitialized = useRef(false);

  // 음성 인식 초기화
  useEffect(() => {
    console.log('🎙️ 음성 인식 초기화 시작...');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // 음성 인식 설정
      recognition.continuous = true; // 연속 인식
      recognition.interimResults = true; // 중간 결과 표시
      recognition.lang = 'ko-KR'; // 한국어 설정
      recognition.maxAlternatives = 1;
      
      // 음성 인식 이벤트 처리
      recognition.onstart = () => {
        console.log('🎤 음성 인식 시작됨');
        setIsListening(true);
      };
      
      recognition.onend = () => {
        console.log('🎤 음성 인식 종료됨');
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('❌ 음성 인식 오류:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          console.log('⚠️ 음성이 감지되지 않음');
        } else if (event.error === 'audio-capture') {
          console.log('⚠️ 오디오 캡처 실패');
        } else if (event.error === 'not-allowed') {
          console.log('⚠️ 마이크 권한이 거부됨');
        }
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // 음성 인식 결과 처리
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // 최종 결과가 있으면 현재 답변에 추가
        if (finalTranscript) {
          console.log('✅ 음성 인식 결과:', finalTranscript);
          setCurrentAnswer(prev => {
            const newAnswer = prev + (prev ? ' ' : '') + finalTranscript;
            console.log('📝 현재 답변 업데이트:', newAnswer);
            return newAnswer;
          });
        }
        
        // 중간 결과도 로깅 (디버깅용)
        if (interimTranscript) {
          console.log('🔄 중간 인식 결과:', interimTranscript);
        }
      };
      
      setRecognition(recognition);
      setSpeechSupported(true);
      console.log('✅ 음성 인식 설정 완료');
      
    } else {
      console.warn('⚠️ 이 브라우저는 음성 인식을 지원하지 않습니다');
      setSpeechSupported(false);
    }
  }, []);

  // 음성 인식 시작 (재시도 로직 추가)
  const startSpeechRecognition = () => {
    if (!speechSupported) {
      console.warn('⚠️ 음성 인식이 지원되지 않습니다');
      return;
    }
    
    if (!isMicOn) {
      console.warn('⚠️ 마이크가 꺼져있어서 음성 인식을 시작할 수 없습니다');
      return;
    }
    
    if (recognition && !isListening) {
      try {
        console.log('🎤 음성 인식 시작 요청 (마이크 ON 상태)');
        
        // 이전 인식이 완전히 종료될 때까지 대기
        const attemptStart = () => {
          try {
            recognition.start();
            console.log('✅ 음성 인식 시작 성공');
          } catch (error) {
            if (error.name === 'InvalidStateError') {
              console.log('🔄 음성 인식이 아직 종료되지 않음, 재시도...');
              setTimeout(attemptStart, 100); // 100ms 후 재시도
            } else {
              console.error('❌ 음성 인식 시작 실패:', error);
            }
          }
        };
        
        attemptStart();
        
      } catch (error) {
        console.error('❌ 음성 인식 시작 실패:', error);
      }
    }
  };

  // 음성 인식 중지
  const stopSpeechRecognition = () => {
    if (recognition && isListening) {
      console.log('🎤 음성 인식 중지 요청');
      recognition.stop();
    }
  };

  // 랜덤 질문 선택 함수
  const selectRandomQuestions = (questionsArray, count = 3) => {
    console.log(`🎲 전체 ${questionsArray.length}개 질문 중 랜덤으로 ${count}개 선택`);
    
    if (questionsArray.length <= count) {
      console.log(`⚠️ 전체 질문 수(${questionsArray.length})가 요청 개수(${count})보다 적어서 모든 질문 사용`);
      return questionsArray;
    }
    
    const shuffled = [...questionsArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const selected = shuffled.slice(0, count);
    
    console.log('🎯 선택된 질문들:');
    selected.forEach((question, index) => {
      console.log(`   ${index + 1}. ${question}`);
    });
    
    return selected;
  };

  // 대체 질문 설정 (데이터 로드 실패시)
  const setFallbackQuestions = () => {
    const fallbackQuestions = [
      "자기소개를 해주세요.",
      "지원 동기를 말씀해 주세요.",
      "본인의 장점과 단점은 무엇인가요?"
    ];
    setQuestions(fallbackQuestions);
    setQuestionsLoaded(true);
    // 답변 배열도 초기화
    setAnswers(new Array(fallbackQuestions.length).fill(''));
    console.log('🔄 기본 질문으로 대체:', fallbackQuestions);
  };

  // URL 파라미터에서 면접 설정 정보를 읽어와서 서버에서 질문 데이터 로드
  const loadQuestionsFromServer = async () => {
    console.log('🌐 서버에서 질문 데이터 로드 시작...');
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');
      const questionListId = urlParams.get('questionListId');
      const industryCode = urlParams.get('industryCode');
      const questionCount = urlParams.get('questionCount') || '10';
      
      console.log('📄 URL 파라미터:', { type, questionListId, industryCode, questionCount });
      
      if (!type) {
        console.error('❌ 면접 타입이 없습니다');
        return false; // 실패 반환
      }
      
      // API 파라미터 구성
      const apiParams = new URLSearchParams({
        type: type
      });
      
      if (type === 'saved' && questionListId) {
        apiParams.append('questionListId', questionListId);
      } else if (type === 'random' && industryCode) {
        apiParams.append('industryCode', industryCode);
        apiParams.append('questionCount', questionCount);
      } else {
        console.error('❌ 필수 파라미터 누락:', { type, questionListId, industryCode });
        return false; // 실패 반환
      }
      
      // Spring Boot 서버에 API 요청
      const apiUrl = `http://localhost:8080/imtintrvw/aiimtintrvw/api/getInterviewQuestions?${apiParams.toString()}`;
      console.log('🌐 API 요청 URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // CORS 인증 정보 포함
      });
      
      console.log('📡 API 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 서버 응답 데이터:', data);
      
      if (data.success && data.questions && Array.isArray(data.questions)) {
        console.log('✅ 서버에서 질문 데이터 수신 성공');
        console.log('📊 질문 개수:', data.questions.length);
        
        // iqContent 값들만 추출
        const allQuestionTexts = data.questions.map((item, index) => {
          console.log(`📝 서버 질문 ${index + 1}:`, item.iqContent);
          return item.iqContent || `질문 ${index + 1}을 불러올 수 없습니다.`;
        });

        // 랜덤으로 3개 선택
        const selectedQuestions = selectRandomQuestions(allQuestionTexts, 3);
        
        setQuestions(selectedQuestions);
        setQuestionsLoaded(true);
        // 답변 배열도 초기화
        setAnswers(new Array(selectedQuestions.length).fill(''));
        console.log('✅ 질문 로드 완료:', selectedQuestions);
        
        return true; // 성공 반환
        
      } else {
        console.error('❌ 서버 응답 오류:', data);
        throw new Error(data.message || '질문 데이터가 없습니다.');
      }
      
    } catch (error) {
      console.error('❌ 서버에서 질문 로드 실패:', error);
      console.error('❌ 오류 상세:', error.message);
      
      // CORS 오류인 경우 안내
      if (error.message.includes('CORS') || error.message.includes('fetch')) {
        console.error('🚫 CORS 오류일 수 있습니다. 서버 설정을 확인하세요.');
      }
      
      return false; // 실패 반환
    }
  };

  // PostMessage 리스너 설정 (iframe 환경에서 사용)
  const setupPostMessageListener = () => {
    console.log('📬 PostMessage 리스너 설정');
    
    const handleMessage = (event) => {
      console.log('📬 PostMessage 수신:', event);
      
      // 이미 질문이 로드되었으면 무시
      if (questionsLoaded && questions.length > 0) {
        console.log('✅ 질문이 이미 로드되어 있어 PostMessage 무시');
        return;
      }
      
      // Origin 검증
      if (event.origin !== 'http://localhost:8080') {
        console.warn('⚠️ 허용되지 않은 Origin:', event.origin);
        return;
      }
      
      if (event.data && event.data.type === 'INTERVIEW_QUESTIONS_DATA') {
        console.log('✅ 면접 질문 데이터 수신:', event.data.questions);
        
        if (Array.isArray(event.data.questions) && event.data.questions.length > 0) {
          const questionTexts = event.data.questions.map((item, index) => {
            console.log(`📝 PostMessage 질문 ${index + 1}:`, item.iqContent);
            return item.iqContent || `질문 ${index + 1}을 불러올 수 없습니다.`;
          });
          
          const selectedQuestions = selectRandomQuestions(questionTexts, 3);
          
          setQuestions(selectedQuestions);
          setQuestionsLoaded(true);
          // 답변 배열도 초기화
          setAnswers(new Array(selectedQuestions.length).fill(''));
          console.log('✅ PostMessage로 질문 로드 성공:', selectedQuestions);
          
          // 리스너 제거
          window.removeEventListener('message', handleMessage);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // 타임아웃 설정 (5초 후에도 데이터가 오지 않으면 기본 질문 사용)
    const timeoutId = setTimeout(() => {
      // 이미 질문이 로드되었으면 타임아웃 실행하지 않음
      if (questionsLoaded && questions.length > 0) {
        console.log('✅ 이미 질문이 로드되어 있어 PostMessage 타임아웃 취소');
        window.removeEventListener('message', handleMessage);
        return;
      }
      
      console.warn('⚠️ PostMessage 타임아웃 - 기본 질문 사용');
      window.removeEventListener('message', handleMessage);
      setFallbackQuestions();
    }, 5000);
    
    // cleanup 함수를 위해 타임아웃 ID 반환
    return () => {
      console.log('🧹 PostMessage 리스너 및 타임아웃 정리');
      clearTimeout(timeoutId);
      window.removeEventListener('message', handleMessage);
    };
  };

  // 통합 질문 로드 함수 (서버 API 우선, PostMessage 대체)
  const loadQuestions = async () => {
    // 이미 질문이 로드되었거나 초기화 중이면 다시 로드하지 않음 (React Strict Mode 대응)
    if (questionsInitialized.current || (questionsLoaded && questions.length > 0)) {
      console.log('✅ 질문이 이미 로드되어 있음, 재로드 생략');
      return null; // cleanup 함수 없음
    }
    
    questionsInitialized.current = true; // 초기화 시작 표시
    console.log('🎯 질문 데이터 로드 시작...');
    
    try {
      // 1. 서버 API에서 직접 로드 시도
      const serverLoadSuccess = await loadQuestionsFromServer();
      
      // 서버 로드 성공시 완료
      if (serverLoadSuccess) {
        console.log('✅ 서버에서 질문 로드 성공, PostMessage 시도 생략');
        return null; // cleanup 함수 없음
      }
      
      // 서버 로드 실패시 PostMessage 시도
      console.log('🔄 서버 로드 실패, PostMessage 시도...');
      return setupPostMessageListener(); // cleanup 함수 반환
      
    } catch (error) {
      console.error('❌ 모든 로드 방법 실패, 폴백 실행:', error);
      setFallbackQuestions();
      return null; // cleanup 함수 없음
    }
  };

  // 질문 로드 (완전한 버전)
  useEffect(() => {
    console.log('🚀 MockInterviewScreen 컴포넌트 마운트 - 질문 로드');
    
    // PostMessage cleanup 함수를 저장할 변수
    let postMessageCleanup = null;
    
    // 질문 데이터 먼저 로드
    const initializeQuestions = async () => {
      try {
        postMessageCleanup = await loadQuestions();
      } catch (error) {
        console.error('❌ 질문 초기화 실패:', error);
        setFallbackQuestions();
      }
    };
    
    initializeQuestions();
    
    return () => {
      console.log('🔄 질문 로드 cleanup');
      
      // PostMessage cleanup 실행
      if (postMessageCleanup && typeof postMessageCleanup === 'function') {
        console.log('🧹 PostMessage 리스너 정리');
        postMessageCleanup();
      }
    };
  }, []);
  
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  
  // 타이머 원형 프로그레스 계산
  const initialTime = 120;
  const timerProgress = ((initialTime - timeLeft) / initialTime) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (timerProgress / 100) * circumference;

  // 웹캠 시작 (간소화)
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

      await setupAudioAnalysis(stream);
      
    } catch (error) {
      console.error('❌ 카메라 접근 오류:', error);
      setCameraPermissionGranted(false);
      alert('카메라와 마이크 접근 권한이 필요합니다.');
    }
  };

  // 오디오 분석 설정
  const setupAudioAnalysis = async (stream) => {
    try {
      console.log('🔊 오디오 분석기 설정 시작...');
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      
      analyserNode.fftSize = 512;
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
      
      console.log('✅ 오디오 분석기 설정 완료');
      
    } catch (error) {
      console.error('❌ 오디오 분석 설정 실패:', error);
      setAudioInitialized(false);
    }
  };

  // 미디어 토글
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
        
        // 마이크 상태에 따라 음성 인식도 제어
        if (audioTrack.enabled) {
          // 마이크 켤 때
          if (audioContext && audioContext.state === 'suspended') {
            try {
              await audioContext.resume();
              console.log('🔊 AudioContext 재활성화됨');
            } catch (error) {
              console.error('AudioContext 재활성화 실패:', error);
            }
          }
          
          // 타이머가 실행 중이면 음성 인식도 다시 시작
          if (isTimerRunning && speechSupported && !isListening) {
            console.log('🎤 마이크 켜짐 - 음성 인식 재시작');
            startSpeechRecognition();
          }
        } else {
          // 마이크 끌 때 음성 인식도 중지
          if (isListening) {
            console.log('🎤 마이크 꺼짐 - 음성 인식 중지');
            stopSpeechRecognition();
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

  // 수정된 타이머 시작 (마이크 상태 체크)
  const startTimer = () => {
    console.log('⏰ 타이머 시작');
    setIsTimerRunning(true);
    
    // 마이크가 켜져있을 때만 음성 인식 시작
    if (speechSupported && isMicOn) {
      console.log('🎤 마이크 ON - 음성 인식도 함께 시작');
      startSpeechRecognition();
    } else if (!isMicOn) {
      console.log('⚠️ 마이크가 꺼져있습니다. 마이크를 켜주세요.');
    }
  };

  // 수정된 타이머 일시정지 (음성 인식과 연동)
  const pauseTimer = () => {
    console.log('⏰ 타이머 일시정지 - 음성 인식도 함께 중지');
    setIsTimerRunning(false);
    
    // 음성 인식도 함께 중지
    if (speechSupported) {
      stopSpeechRecognition();
    }
  };

  const resetTimer = () => {
    setTimeLeft(120);
    setIsTimerRunning(false);
    stopSpeechRecognition();
  };

  // 수정된 다음 질문 이동 (답변 저장)
  const nextQuestion = () => {
    console.log(`📝 질문 ${currentQuestion + 1} 답변 저장:`, currentAnswer);
    
    // 현재 답변을 answers 배열에 저장
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = currentAnswer;
    setAnswers(newAnswers);
    
    // 음성 인식 중지
    stopSpeechRecognition();
    
    if (currentQuestion < totalQuestions - 1) {
      // 다음 질문으로 이동
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer(''); // 현재 답변 초기화
      setTimeLeft(120);
      setIsTimerRunning(false);
      
      console.log(`➡️ 질문 ${currentQuestion + 2}번으로 이동`);
    } else {
      // 모든 질문이 끝났으면 결과 화면으로
      console.log('🎉 모든 질문 완료! 결과 화면으로 이동');
      setShowResults(true);
    }
  };

  // 수정된 면접 종료 (결과 화면으로 이동)
  const endInterview = () => {
    console.log('🔚 면접 강제 종료');
    
    // 현재 답변 저장
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = currentAnswer;
    setAnswers(newAnswers);
    
    // 타이머 및 음성 인식 중지
    setIsTimerRunning(false);
    stopSpeechRecognition();
    
    // 미디어 정리
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // 결과 화면 표시
    setShowResults(true);
  };

  // 결과 화면 액션
  const handleCloseResults = () => {
    console.log('📋 결과 화면 닫기');
    window.close(); // 또는 상위 컴포넌트로 이벤트 전달
  };

  const handleRestartInterview = () => {
    console.log('🔄 면접 다시 시작');
    
    // 모든 상태 초기화
    setCurrentQuestion(0);
    setTimeLeft(120);
    setIsTimerRunning(false);
    setCurrentAnswer('');
    setAnswers(new Array(questions.length).fill(''));
    setShowResults(false);
    
    // 카메라 다시 시작
    startCamera();
  };

  // 완전한 오디오 비주얼라이저 (기존 기능 복원)
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
          
          // 주파수 바 그리기 (기존 기능 복원)
          const barWidth = (width / dataArray.length) * 2.5;
          let x = 0;
          
          for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * height * 0.9;
            
            if (barHeight > 2) {
              // 그라데이션 생성 (음성 인식 상태에 따라 색상 변경)
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

  // 타이머 효과
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      stopSpeechRecognition();
      alert('시간이 종료되었습니다!');
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // 컴포넌트 마운트 시 카메라 시작 (질문 로드와 별도)
  useEffect(() => {
    console.log('🚀 MockInterviewScreen 컴포넌트 마운트 - 카메라 시작');
    
    // 카메라는 병렬로 시작
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
      if (recognition) {
        recognition.stop();
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
      }
    };

    const timer = setTimeout(initCanvas, 100);
    window.addEventListener('resize', initCanvas);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initCanvas);
    };
  }, []);

  // 비주얼라이저 시작 (모든 상태 변화에 반응)
  useEffect(() => {
    if (canvasRef.current && cameraPermissionGranted !== null) {
      const timer = setTimeout(() => {
        startVisualization();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [canvasRef.current, cameraPermissionGranted, isListening, currentAnswer, isMicOn, mediaStream, audioInitialized]);

  // 질문이 로드되지 않은 경우 로딩 화면 표시
  if (!questionsLoaded) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f3f4f6', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>면접 질문을 불러오는 중...</h2>
          <p style={{ color: '#6b7280', marginBottom: '4px' }}>Spring Boot API에서 데이터 로드 중</p>
          <p style={{ color: '#9d9d9d', fontSize: '12px' }}>잠시만 기다려주세요...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 결과 화면 표시
  if (showResults) {
    return (
      <InterviewResultScreen 
        questions={questions}
        answers={answers}
        onClose={handleCloseResults}
        onRestart={handleRestartInterview}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      {/* 상단 진행 상태바 */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: isListening ? '#10b981' : '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {isListening && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
              )}
              모의면접 진행 중 {isListening ? '(🎤 음성 인식 중)' : ''} ({questions.length}개 질문 로드됨)
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
                    stroke={timeLeft <= 30 ? '#ef4444' : isListening ? '#10b981' : '#3b82f6'}
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
                      backgroundColor: speechSupported && isMicOn ? '#10b981' : '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: speechSupported && isMicOn ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.2s'
                    }}
                    disabled={!speechSupported || !isMicOn}
                    title={!speechSupported ? '음성 인식이 지원되지 않습니다' : 
                           !isMicOn ? '마이크를 켜주세요' : '답변 시작'}
                  >
                    <Play size={16} />
                    시작 (음성 인식)
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
              
              {/* 음성 인식 지원 여부 및 마이크 상태 표시 */}
              {!speechSupported && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '8px', 
                  backgroundColor: '#fef3c7', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#92400e'
                }}>
                  ⚠️ 이 브라우저는 음성 인식을 지원하지 않습니다
                </div>
              )}
              
              {speechSupported && !isMicOn && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '8px', 
                  backgroundColor: '#fef2f2', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#991b1b'
                }}>
                  🎤 마이크가 꺼져있습니다. 음성 인식을 사용하려면 마이크를 켜주세요.
                </div>
              )}
            </div>

            {/* 질문 영역 */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
              padding: '24px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>현재 질문</h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '12px',
                  color: isListening ? '#10b981' : '#6b7280'
                }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: isListening ? '#10b981' : '#6b7280'
                  }}></div>
                  {isListening ? '음성 인식 중' : '서버 로드 완료'}
                </div>
              </div>
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
              
              {/* 현재 답변 미리보기 */}
              {currentAnswer && (
                <div style={{ 
                  backgroundColor: '#f0fdf4', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginBottom: '16px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ fontSize: '12px', color: '#059669', marginBottom: '4px', fontWeight: '600' }}>
                    💬 현재 인식된 답변 ({currentAnswer.length}자)
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#064e3b', 
                    margin: 0, 
                    lineHeight: '1.4',
                    maxHeight: '60px',
                    overflow: 'hidden'
                  }}>
                    {currentAnswer}
                  </p>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  💡 총 {questions.length}개 질문 중 {currentQuestion + 1}번째
                </div>
                {currentQuestion < totalQuestions - 1 ? (
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
                ) : (
                  <button
                    onClick={nextQuestion}
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
                    <CheckCircle size={16} />
                    면접 완료
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
                
                {/* 음성 인식 상태 표시 */}
                <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  {isListening && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      backgroundColor: '#10b981', 
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
                      🎤 음성 인식 중
                    </div>
                  )}
                </div>
                
                {/* 마이크 상태 표시 */}
                <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: isMicOn && speechSupported ? '#10b981' : '#ef4444' 
                  }}>
                    {isMicOn ? <Mic size={16} style={{ color: 'white' }} /> : <MicOff size={16} style={{ color: 'white' }} />}
                  </div>
                </div>
              </div>
              
              {/* 음성 인식 상태 */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px' 
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    음성 인식 상태
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px',
                    color: isListening ? '#10b981' : '#6b7280'
                  }}>
                    <div style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: isListening ? '#10b981' : '#6b7280'
                    }}></div>
                    <span>
                      {!speechSupported ? '지원되지 않음' :
                       isListening ? '인식 중' : '대기 중'}
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MockInterviewScreen;