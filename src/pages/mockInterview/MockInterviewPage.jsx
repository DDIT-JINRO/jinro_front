import React, { useState, useEffect } from 'react';
import styles from '../../styles/mockInterview/MockInterview.module.css';

// 훅 임포트
import {
  useMediaStream,
  useSpeechRecognition,
  useTimer,
  useQuestions
} from '../../hooks/mockInterview';

// 컴포넌트 임포트
import {
  LoadingScreen,
  ProgressBar,
  CircularTimer,
  QuestionCard,
  VideoPlayer,
  AudioVisualizer,
  InterviewResult
} from '../../components/mockInterview';

// 유틸리티 임포트
import { TIMER_DEFAULTS, calculateCircularProgress } from '../../utils/mockInterview';

const MockInterviewPage = () => {
  const [showResults, setShowResults] = useState(false);

  // 커스텀 훅들
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

  // 타이머와 음성 인식 연동
  const startTimer = () => {
    startTimerOriginal();
    if (speechSupported && isMicOn) {
      console.log('🎤 마이크 ON - 음성 인식도 함께 시작');
      startListening(isMicOn);
    } else if (!isMicOn) {
      console.log('⚠️ 마이크가 꺼져있습니다. 마이크를 켜주세요.');
    }
  };

  const pauseTimer = () => {
    pauseTimerOriginal();
    console.log('⏰ 타이머 일시정지 - 음성 인식도 함께 중지');
    if (speechSupported) {
      stopListening();
    }
  };

  // 다음 질문 처리
  const handleNextQuestion = () => {
    console.log(`📝 질문 ${currentQuestion + 1} 답변 저장:`, currentAnswer);
    
    // 현재 답변을 저장하면서 동시에 초기화
    const answerToSave = getCurrentAnswerAndClear();
    saveAnswer(currentQuestion, answerToSave);
    
    // 음성 인식 중지
    stopListening();
    
    // 다음 질문으로 이동 또는 면접 완료
    const isInterviewComplete = moveToNextQuestion();
    
    if (isInterviewComplete) {
      console.log('🎉 모든 질문 완료! 결과 화면으로 이동');
      setShowResults(true);
    } else {
      // 다음 질문으로 이동 시 타이머 리셋 및 음성 인식 답변 초기화 확인
      resetTimer();
      console.log(`➡️ 질문 ${currentQuestion + 2}번으로 이동 (답변 초기화됨)`);
    }
  };

  // 면접 강제 종료
  const handleEndInterview = () => {
    console.log('🔚 면접 강제 종료');
    
    // 현재 답변을 저장하면서 동시에 초기화
    const answerToSave = getCurrentAnswerAndClear();
    saveAnswer(currentQuestion, answerToSave);
    
    // 타이머 및 음성 인식 중지
    pauseTimerOriginal();
    stopListening();
    
    // 미디어 정리
    cleanupMedia();
    
    // 결과 화면 표시
    setShowResults(true);
  };

  // 결과 화면 액션들
  const handleCloseResults = () => {
    console.log('📋 결과 화면 닫기');
    window.close(); // 또는 상위 컴포넌트로 이벤트 전달
  };

  const handleRestartInterview = () => {
    console.log('🔄 면접 다시 시작');
    
    // 모든 상태 초기화
    resetInterview();
    resetTimer();
    clearCurrentAnswer(); // 음성 인식 답변도 초기화
    setShowResults(false);
  };

  // 마이크 토글 시 음성 인식도 연동
  const handleToggleMic = async () => {
    await toggleMic();
    
    // 마이크 상태 변경 후 음성 인식 상태도 조정
    if (!isMicOn && isTimerRunning && speechSupported && !isListening) {
      // 마이크 켜지고 타이머 실행 중이면 음성 인식 시작
      console.log('🎤 마이크 켜짐 - 음성 인식 재시작');
      startListening(true);
    } else if (isMicOn && isListening) {
      // 마이크 꺼지면 음성 인식 중지
      console.log('🎤 마이크 꺼짐 - 음성 인식 중지');
      stopListening();
    }
  };

  // 시간 만료 처리
  useEffect(() => {
    if (isTimeExpired) {
      stopListening();
      alert('시간이 종료되었습니다!');
    }
  }, [isTimeExpired]);

  // 질문 변경 시 음성 인식 답변 초기화 (안전장치)
  useEffect(() => {
    console.log(`🔄 질문 ${currentQuestion + 1}번으로 변경됨 - 음성 인식 답변 초기화`);
    clearCurrentAnswer();
  }, [currentQuestion]);

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
      />
    );
  }

  // 원형 타이머 프로그레스 계산
  const timerProgress = getTimerProgress();
  const { circumference, strokeDashoffset } = calculateCircularProgress(timerProgress);

  return (
    <div className={`${styles.mockInterviewContainer} ${styles.mockInterviewPage}`}>
      
      {/* 상단 진행 상태바 */}
      <ProgressBar
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        progressPercentage={progressPercentage}
        isListening={isListening}
        onEndInterview={handleEndInterview}
      />

      {/* 메인 컨텐츠 */}
      <div className={styles.mainContent}>
        <div className={`
          ${styles.mainGrid} 
          ${window.innerWidth >= 1024 ? styles.mainGridDesktop : styles.mainGridMobile}
        `}>
          
          {/* 왼쪽: 타이머 및 질문 */}
          <div className={styles.leftColumn}>
            
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
          <div className={styles.rightColumn}>
            <VideoPlayer
              videoRef={videoRef}
              isCameraOn={isCameraOn}
              isMicOn={isMicOn}
              isListening={isListening}
              speechSupported={speechSupported}
              onToggleCamera={toggleCamera}
              onToggleMic={handleToggleMic}
            />

            {/* 오디오 비주얼라이저 */}
            <div className={styles.audioVisualizerContainer}>
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