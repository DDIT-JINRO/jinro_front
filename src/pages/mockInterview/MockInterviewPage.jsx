import React, { useState, useEffect } from 'react';
import commonStyles from '../../styles/mockInterview/Common.module.css';

// 기존 훅들
import {
  useMediaStream,
  useSpeechRecognition,
  useTimer,
  useQuestions
} from '../../hooks/mockInterview';

// 새로운 실시간 분석 훅
import { useRealTimeAnalysis } from '../../hooks/mockInterview/useRealTimeAnalysis';
import { useMediaRecorder } from '../../hooks/mockInterview/useMediaRecorder';

// 컴포넌트 임포트
import {
  LoadingScreen,
  ProgressBar,
  CircularTimer,
  QuestionCard,
  AudioVisualizer,
  InterviewResult
} from '../../components/mockInterview';

// 새로운 컴포넌트 임포트 (Enhanced VideoPlayer로 교체)
import EnhancedVideoPlayer from '../../components/mockInterview/EnhancedVideoPlayer';
import AIAnalysisLoading from '../../components/mockInterview/AIAnalysisLoading';
import AIAnalysisResult from '../../components/mockInterview/AIAnalysisResult';
import RealTimeAnalysisOverlay from '../../components/mockInterview/RealTimeAnalysisOverlay';

// 유틸리티 임포트
import { TIMER_DEFAULTS, calculateCircularProgress } from '../../utils/mockInterview';

const MockInterviewPage = () => {
  const [showResults, setShowResults] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showAILoading, setShowAILoading] = useState(false);
  
  // 🎯 얼굴 감지 가이드 관련 상태 추가
  const [faceGuideEnabled, setFaceGuideEnabled] = useState(true);
  const [calibrationCompleted, setCalibrationCompleted] = useState(false);
  const [showStartupGuide, setShowStartupGuide] = useState(true);

  // 기존 훅들
  const {
    mediaStream,
    isCameraOn,
    isMicOn,
    cameraPermissionGranted,
    audioContext,
    analyser,
    dataArray,
    audioInitialized,
    videoRef,
    toggleCamera,
    toggleMic,
    cleanupMedia
  } = useMediaStream();

  const {
    isListening,
    currentAnswer,
    speechSupported,
    startListening,
    stopListening,
    clearCurrentAnswer,
    getCurrentAnswerAndClear
  } = useSpeechRecognition();

  const {
    timeLeft,
    isTimerRunning,
    startTimer: startTimerOriginal,
    pauseTimer: pauseTimerOriginal,
    resetTimer,
    formatTime,
    getTimerProgress,
    isTimeExpired,
    isLowTime
  } = useTimer(TIMER_DEFAULTS.INITIAL_TIME);

  const {
    questions,
    questionsLoaded,
    answers,
    currentQuestion,
    totalQuestions,
    currentQuestionText,
    progressPercentage,
    moveToNextQuestion,
    saveAnswer,
    resetInterview,
    isLastQuestion
  } = useQuestions();

  // 🎯 실시간 분석 훅 - 변수명 통일 및 MediaPipe 상태 추가
  const {
    isAnalyzing,        // ✅ 실시간 분석 중 여부
    analysisData,       // ✅ 실시간 분석 데이터  
    finalAnalysis,      // ✅ 최종 분석 결과
    startAnalysis,      // ✅ 분석 시작
    stopAnalysis,       // ✅ 분석 중지
    finishAnalysis,     // ✅ 분석 완료
    isMediaPipeReady    // ✅ MediaPipe 준비 상태
  } = useRealTimeAnalysis(mediaStream, videoRef);

  // 녹화 기능
  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    getRecordedVideoURL,
    clearRecording,
    formatRecordingTime,
    cleanup: cleanupRecording,
    hasRecording
  } = useMediaRecorder();

  // 🎯 면접 시작 전 안내 메시지 처리
  useEffect(() => {
    if (questionsLoaded && cameraPermissionGranted && !calibrationCompleted && showStartupGuide) {
      // 5초 후 자동으로 시작 안내 숨김
      const timer = setTimeout(() => {
        setShowStartupGuide(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [questionsLoaded, cameraPermissionGranted, calibrationCompleted, showStartupGuide]);

  // 🎯 캘리브레이션 완료 핸들러
  const handleCalibrationComplete = (success) => {
    setCalibrationCompleted(success);
    setShowStartupGuide(false);
    
    if (success) {
      console.log('✅ 얼굴 위치 캘리브레이션 완료');
      // 캘리브레이션 완료 후 자동으로 분석 시작
      if (!isAnalyzing && mediaStream) {
        startAnalysis();
      }
    }
  };

  // 타이머와 실시간 분석 연동
  const startTimer = async () => {
    console.log('⏰ 타이머 및 실시간 분석 시작...');
    
    if (speechSupported && isMicOn) {
      startListening(isMicOn);
      console.log('🎤 음성 인식 시작됨');
    }
    
    // 실시간 분석 시작 (캘리브레이션이 완료되지 않았어도 시작)
    if (mediaStream && cameraPermissionGranted && !isAnalyzing) {
      await startAnalysis();
      console.log('📊 실시간 분석 시작됨');
    }

    startTimerOriginal();
    
    // 녹화 시작
    if (mediaStream && !isRecording) {
      await startRecording(mediaStream);
      console.log('🎥 면접 녹화 시작됨');
    }
  };

  const pauseTimer = () => {
    pauseTimerOriginal();
    console.log('⏰ 타이머 일시정지');
    
    if (speechSupported) {
      stopListening();
    }
  };

  // 다음 질문 처리
  const handleNextQuestion = () => {
    console.log(`📝 질문 ${currentQuestion + 1} 답변 저장:`, currentAnswer);
    
    const answerToSave = getCurrentAnswerAndClear();
    saveAnswer(currentQuestion, answerToSave);
    
    stopListening();
    
    const isInterviewComplete = moveToNextQuestion();
    
    if (isInterviewComplete) {
      console.log('🎉 모든 질문 완료! 분석 종료 및 결과 화면으로 이동');
      
      stopAnalysis();
      
      if (isRecording) {
        stopRecording();
      }
      
      setShowResults(true);
    } else {
      resetTimer();
      console.log(`➡️ 질문 ${currentQuestion + 2}번으로 이동`);
    }
  };

  // 면접 강제 종료
  const handleEndInterview = () => {
    console.log('🔚 면접 강제 종료');
    
    const answerToSave = getCurrentAnswerAndClear();
    saveAnswer(currentQuestion, answerToSave);
    
    pauseTimerOriginal();
    stopListening();
    stopAnalysis();
    
    if (isRecording) {
      stopRecording();
    }
    
    cleanupMedia();
    setShowResults(true);
  };

  // 🎯 AI 분석 시작 - 실제 분석 데이터 사용
  const startAIAnalysis = async () => {
    try {
      console.log('🤖 최종 AI 분석 시작...');
      console.log('📊 분석할 데이터:', {
        analysisData: analysisData,
        answers: answers,
        questions: questions,
        recordingDuration: recordingDuration,
        hasRecording: hasRecording
      });
      
      setShowAILoading(true);
      setShowResults(false);
      
      // 🎯 실제 실시간 분석 데이터와 면접 데이터를 함께 전달
      const finalResult = await finishAnalysis({
        // 실시간 분석 데이터
        realTimeData: analysisData,
        
        // 면접 관련 데이터
        interviewData: {
          questions: questions,
          answers: answers,
          totalDuration: recordingDuration,
          hasRecording: hasRecording,
          questionsCompleted: currentQuestion + 1,
          totalQuestions: totalQuestions
        },
        
        // 기술 정보
        technicalInfo: {
          isMediaPipeReady: isMediaPipeReady,
          speechSupported: speechSupported,
          audioInitialized: audioInitialized,
          cameraPermissionGranted: cameraPermissionGranted
        }
      });
      
      console.log('✅ 최종 분석 결과:', finalResult);
      
      // 분석 진행률 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowAILoading(false);
      setShowAIAnalysis(true);
      
    } catch (error) {
      console.error('❌ AI 분석 실패:', error);
      setShowAILoading(false);
      alert('AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // AI 분석 결과에서 뒤로가기
  const handleBackFromAI = () => {
    setShowAIAnalysis(false);
    setShowResults(true);
  };

  // 🎯 AI 분석 보고서 다운로드 - 실제 데이터 사용
  const handleDownloadReport = () => {
    console.log('📋 분석 보고서 다운로드:', finalAnalysis);
    
    if (!finalAnalysis) {
      alert('분석 결과가 없습니다.');
      return;
    }
    
    const reportContent = generateDetailedReport(finalAnalysis, analysisData, answers, questions);
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `면접분석보고서_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 🎯 상세한 텍스트 보고서 생성 함수 - 실제 데이터 사용
  const generateDetailedReport = (analysis, realTimeData, interviewAnswers, interviewQuestions) => {
    if (!analysis) return '분석 데이터가 없습니다.';
    
    const reportDate = new Date().toLocaleString('ko-KR');
    
    return `
=== 🤖 AI 모의면접 분석 보고서 ===

📅 분석 일시: ${reportDate}
🎯 분석 방법: ${analysis.analysisMethod || 'MediaPipe AI + Web Audio API'}
⏱️ 면접 시간: ${Math.floor(analysis.duration / 60)}분 ${analysis.duration % 60}초
📝 완료 질문: ${interviewAnswers.length}개 / ${interviewQuestions.length}개

=== 📊 종합 점수 ===
🏆 총점: ${analysis.overallScore}점 (${analysis.grade})
🎤 음성 표현: ${analysis.scores.communication}점
👁️ 시각적 인상: ${analysis.scores.appearance}점

=== 🎤 음성 분석 상세 ===
• 평균 볼륨: ${realTimeData?.audio?.averageVolume || 0}
• 말하기 시간: ${realTimeData?.audio?.speakingTime || 0}초
• 분당 단어수: ${realTimeData?.audio?.wordsPerMinute || 0} WPM
• 습관어 사용: ${realTimeData?.audio?.fillerWordsCount || 0}회
• 음성 명확도: ${analysis.detailed?.audio?.speechClarity || 0}점

=== 👁️ 영상 분석 상세 ===
• 얼굴 감지율: ${realTimeData?.video?.faceDetectionRate || 0}%
• 아이컨택: ${realTimeData?.video?.eyeContactPercentage || 0}%
• 미소 빈도: ${realTimeData?.video?.smileDetection || 0}%
• 자세 안정성: ${realTimeData?.video?.postureScore || 0}점

=== 📝 질문별 답변 분석 ===
${interviewQuestions.map((question, index) => {
  const answer = interviewAnswers[index] || '답변 없음';
  const wordCount = answer ? answer.split(/\s+/).filter(word => word.length > 0).length : 0;
  
  return `
[질문 ${index + 1}]
Q: ${question}
A: ${answer}
• 답변 길이: ${answer.length}자
• 단어 수: ${wordCount}개
• 완성도: ${answer ? '완료' : '미완료'}
`;
}).join('')}

=== 💪 강점 분석 ===
${analysis.summary?.strengths?.map(s => `• ${s}`).join('\n') || '• 데이터 없음'}

=== 🔧 개선사항 ===
${analysis.summary?.improvements?.map(i => `• ${i}`).join('\n') || '• 데이터 없음'}

=== 💡 맞춤형 추천사항 ===
${analysis.summary?.recommendation || '추천사항 없음'}

=== 📈 성능 메트릭 ===
• 총 프레임 수: ${analysis.performanceMetrics?.totalFrames || 0}
• 평균 처리 시간: ${analysis.performanceMetrics?.avgProcessingTime?.toFixed(2) || 0}ms
• 오류 발생 횟수: ${analysis.performanceMetrics?.errorCount || 0}

=== 🔒 개인정보 보호 ===
본 분석은 모두 브라우저에서 처리되었으며, 
어떠한 개인정보도 외부 서버로 전송되지 않았습니다.

---
보고서 생성 시간: ${reportDate}
분석 엔진: ${isMediaPipeReady ? 'MediaPipe AI' : 'Advanced Simulation'}
`;
  };

  // 결과 화면 닫기
  const handleCloseResults = () => {
    console.log('📋 결과 화면 닫기');
    window.close();
  };

  // 면접 재시작
  const handleRestartInterview = () => {
    console.log('🔄 면접 다시 시작');
    
    resetInterview();
    resetTimer();
    clearCurrentAnswer();
    clearRecording();
    stopAnalysis();
    
    setShowResults(false);
    setShowAIAnalysis(false);
    setShowAILoading(false);
    setCalibrationCompleted(false);
    setShowStartupGuide(true);
    setFaceGuideEnabled(true);
  };

  // 마이크 토글 시 분석도 연동
  const handleToggleMic = async () => {
    await toggleMic();
    
    if (!isMicOn && isTimerRunning && speechSupported && !isListening) {
      console.log('🎤 마이크 켜짐 - 음성 인식 재시작');
      startListening(true);
    } else if (isMicOn && isListening) {
      console.log('🎤 마이크 꺼짐 - 음성 인식 중지');
      stopListening();
    }
  };

  // 시간 만료 처리
  useEffect(() => {
    if (isTimeExpired) {
      stopListening();
      stopAnalysis();
      alert('시간이 종료되었습니다!');
    }
  }, [isTimeExpired]);

  // 질문 변경 시 음성 인식 답변 초기화
  useEffect(() => {
    console.log(`🔄 질문 ${currentQuestion + 1}번으로 변경됨`);
    clearCurrentAnswer();
  }, [currentQuestion]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopAnalysis();
      cleanupRecording();
      cleanupMedia();
    };
  }, []);

  // 로딩 중일 때
  if (!questionsLoaded) {
    return <LoadingScreen />;
  }

  // 결과 화면
  if (showResults) {
    return (
      <InterviewResult 
        questions={questions}
        answers={answers}
        onClose={handleCloseResults}
        onRestart={handleRestartInterview}
        onStartAIAnalysis={startAIAnalysis}
        hasRecording={hasRecording}
        recordingDuration={recordingDuration}
        hasRealTimeAnalysis={true}
        // 🎯 실시간 분석 데이터 전달
        realTimeAnalysisData={analysisData}
      />
    );
  }

  // AI 분석 로딩 화면
  if (showAILoading) {
    return (
      <AIAnalysisLoading 
        progress={95}
        onCancel={() => {
          setShowAILoading(false);
          setShowResults(true);
        }}
      />
    );
  }

  // AI 분석 결과 화면
  if (showAIAnalysis) {
    return (
      <AIAnalysisResult 
        analysisResult={finalAnalysis}
        recordedVideoURL={getRecordedVideoURL()}
        onBack={handleBackFromAI}
        onDownloadReport={handleDownloadReport}
        isRealTimeAnalysis={true}
        // 🎯 개발자 데이터를 위한 추가 props
        realTimeAnalysisData={analysisData}
        questions={questions}
        answers={answers}
        recordingDuration={recordingDuration}
        sessionMetadata={{
          startTime: new Date().toISOString(),
          timerUsed: TIMER_DEFAULTS.INITIAL_TIME,
          mediaPermissions: {
            camera: cameraPermissionGranted,
            microphone: isMicOn
          },
          analysisEngine: isAnalyzing ? 'MediaPipe + WebAudio' : 'Simulation',
          mediaPipeReady: isMediaPipeReady
        }}
      />
    );
  }

  // 원형 타이머 프로그레스 계산
  const timerProgress = getTimerProgress();
  const { circumference, strokeDashoffset } = calculateCircularProgress(timerProgress);

  return (
    <div className={`${commonStyles.mockInterviewContainer} ${commonStyles.mockInterviewPage}`}>
      
      {/* 🎯 면접 시작 전 안내 메시지 */}
      {showStartupGuide && questionsLoaded && cameraPermissionGranted && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '16px' }}>
              🎯 면접 준비 완료!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
              최적의 면접 분석을 위해 얼굴 위치를 조정해보세요.<br />
              {isMediaPipeReady ? '🤖 AI 분석이 활성화되었습니다.' : '📊 시뮬레이션 모드로 진행됩니다.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowStartupGuide(false)}
                style={{
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                얼굴 위치 조정하기
              </button>
              <button
                onClick={() => {
                  setShowStartupGuide(false);
                  setFaceGuideEnabled(false);
                  setCalibrationCompleted(true);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                건너뛰기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상단 진행 상태바 */}
      <ProgressBar
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        progressPercentage={progressPercentage}
        isListening={isListening}
        onEndInterview={handleEndInterview}
      />

      {/* 메인 컨텐츠 */}
      <div className={commonStyles.mainContent}>
        <div className={`
          ${commonStyles.mainGrid} 
          ${window.innerWidth >= 1024 ? commonStyles.mainGridDesktop : commonStyles.mainGridMobile}
        `}>
          
          {/* 왼쪽: 타이머 및 질문 */}
          <div className={commonStyles.leftColumn}>
            
            {/* 원형 타이머 */}
            <CircularTimer
              timeLeft={timeLeft}
              formatTime={formatTime()}
              isTimerRunning={isTimerRunning}
              isLowTime={isLowTime}
              isListening={isListening}
              circumference={circumference}
              strokeDashoffset={strokeDashoffset}
              onStart={startTimer}
              onPause={pauseTimer}
              onReset={resetTimer}
              speechSupported={speechSupported}
              isMicOn={isMicOn}
            />

            {/* 질문 카드 */}
            <QuestionCard
              currentQuestionText={currentQuestionText}
              currentQuestion={currentQuestion}
              totalQuestions={totalQuestions}
              currentAnswer={currentAnswer}
              isListening={isListening}
              isLastQuestion={isLastQuestion}
              onNext={handleNextQuestion}
            />
          </div>

          {/* 오른쪽: 웹캠 화면 */}
          <div className={commonStyles.rightColumn}>
            
            {/* 🎯 Enhanced VideoPlayer (얼굴 감지 가이드 포함) */}
            <div style={{ position: 'relative' }}>
              <EnhancedVideoPlayer
                videoRef={videoRef}
                isCameraOn={isCameraOn}
                isMicOn={isMicOn}
                isListening={isListening}
                speechSupported={speechSupported}
                onToggleCamera={toggleCamera}
                onToggleMic={handleToggleMic}
                isRecording={isRecording}
                recordingDuration={recordingDuration}
                formatRecordingTime={formatRecordingTime}
                // 🎯 새로 추가된 props
                analysisData={analysisData}
                isMediaPipeReady={isMediaPipeReady}
                isAnalyzing={isAnalyzing}
                mediaStream={mediaStream}
                showFaceGuide={faceGuideEnabled}
                onCalibrationComplete={handleCalibrationComplete}
              />
              
              {/* 🎯 실시간 분석 오버레이 (얼굴 가이드와 분리) */}
              {isAnalyzing && !faceGuideEnabled && (
                <RealTimeAnalysisOverlay analysisData={analysisData} />
              )}
            </div>

            {/* 오디오 비주얼라이저 */}
            <div className={commonStyles.audioVisualizerContainer}>
              <AudioVisualizer
                analyser={analyser}
                dataArray={dataArray}
                mediaStream={mediaStream}
                cameraPermissionGranted={cameraPermissionGranted}
                audioInitialized={audioInitialized}
                isMicOn={isMicOn}
                isListening={isListening}
                currentAnswer={currentAnswer}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewPage;