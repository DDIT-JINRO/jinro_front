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
import { useAIAnalysis } from '../../hooks/mockInterview';

// 컴포넌트 임포트
import {
  LoadingScreen,
  ProgressBar,
  CircularTimer,
  QuestionCard,
  AudioVisualizer,
  InterviewResult
} from '../../components/mockInterview';

// 새로운 컴포넌트 임포트
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
  
  // 🎯 최종 분석 결과 상태 추가
  const [finalAnalysis, setFinalAnalysis] = useState(null);

  const [forceGuideComplete, setForceGuideComplete] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  
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

  // 🎯 실시간 분석 훅
  const {
    isAnalyzing,        
    analysisData,       
    startAnalysis,      
    stopAnalysis,       
    finishAnalysis,     
    isMediaPipeReady    
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

  // 🎯 AI 분석 훅 사용
  const { 
    isAnalyzing: isAIAnalyzing,
    analysisResult, 
    analysisError, 
    analysisProgress, 
    analyzeInterview, 
    clearAnalysis 
  } = useAIAnalysis();

  // 🎯 면접 시작 전 안내 메시지 처리
  useEffect(() => {
    if (questionsLoaded && cameraPermissionGranted && !calibrationCompleted && showStartupGuide) {
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
      if (!isAnalyzing && mediaStream) {
        startAnalysis();
      }
    }
  };

  // 타이머와 실시간 분석 연동
  const startTimer = async () => {    
    setIsInterviewStarted(true);
    setForceGuideComplete(true);
    setCalibrationCompleted(true);
    setShowStartupGuide(false);
    setFaceGuideEnabled(false);

    if (speechSupported && isMicOn) {
      startListening(isMicOn);
    }
    
    if (mediaStream && cameraPermissionGranted && !isAnalyzing) {
      await startAnalysis();
    }

    startTimerOriginal();
    
    if (mediaStream && !isRecording) {
      await startRecording(mediaStream);
    }
  };

  const pauseTimer = () => {
    pauseTimerOriginal();
    
    if (speechSupported) {
      stopListening();
    }
  };

  // 다음 질문 처리
  const handleNextQuestion = () => {    
    const answerToSave = getCurrentAnswerAndClear();
    saveAnswer(currentQuestion, answerToSave);
    
    stopListening();
    
    const isInterviewComplete = moveToNextQuestion();
    
    if (isInterviewComplete) {
      handleCompleteInterview();
    } else {
      resetTimer();
    }
  };

  const handleCompleteInterview = async () => {
    
    try {
      const answerToSave = getCurrentAnswerAndClear();
      saveAnswer(currentQuestion, answerToSave);
            
      if (isListening) {
        stopListening();
      }
      
      if (isTimerRunning) {
        pauseTimerOriginal();
      }
      
      if (isAnalyzing) {
        await stopAnalysis();
      }
      
      if (isRecording) {
        await stopRecording();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await finishAnalysis();
      
      setShowResults(true);
      
    } catch (error) {
      console.error('❌ 면접 완료 처리 중 오류:', error);
      alert('면접 완료 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 면접 강제 종료
  const handleEndInterview = async () => {    
    const confirmEnd = window.confirm('정말로 면접을 종료하시겠습니까? 현재까지의 답변이 저장됩니다.');
    
    if (confirmEnd) {
      await handleCompleteInterview();
    }
  };

  // 🎯 AI 분석 시작 - useAIAnalysis 훅 사용
  const startAIAnalysis = async () => {
    try {
      // 화면 상태 설정
      setShowAILoading(true);
      setShowResults(false);
      
      // 기존 분석 결과 초기화
      clearAnalysis();
      setFinalAnalysis(null);

      // 🎯 useAIAnalysis 훅의 analyzeInterview 함수 사용
      await analyzeInterview(questions, answers, analysisData, recordingDuration);
            
    } catch (error) {
      console.error('❌ AI 분석 시작 실패:', error);
      setShowAILoading(false);
      setShowResults(true);
      alert(`AI 분석을 시작할 수 없습니다: ${error.message}`);
    }
  };

  // 🎯 AI 분석 완료 처리 함수
  const handleAIAnalysisComplete = () => {    
    if (analysisResult) {
      setFinalAnalysis(analysisResult);
      setShowAILoading(false);
      setShowAIAnalysis(true);
    } else {      
      // 1초 후 다시 확인
      setTimeout(() => {
        if (analysisResult) {
          setFinalAnalysis(analysisResult);
          setShowAILoading(false);
          setShowAIAnalysis(true);
        } else {
          console.error('❌ 분석 결과를 찾을 수 없음 - 결과 화면으로 복귀');
          setShowAILoading(false);
          setShowResults(true);
        }
      }, 1000);
    }
  };

  // 🎯 AI 분석 상태 디버깅
  useEffect(() => {
    console.log('🔍 AI 분석 상태 변화:', {
      isAIAnalyzing,
      showAILoading,
      hasAnalysisResult: !!analysisResult,
      analysisProgress,
      analysisError
    });
  }, [isAIAnalyzing, showAILoading, analysisResult, analysisProgress, analysisError]);

  // 🎯 분석 결과 감지 및 추가 처리 (안전장치)
  useEffect(() => {
    if (analysisResult && showAILoading && !isAIAnalyzing) {
      setTimeout(() => {
        if (showAILoading) {
          handleAIAnalysisComplete();
        }
      }, 5000);
    }
  }, [analysisResult, showAILoading, isAIAnalyzing]);

  // AI 분석 결과에서 뒤로가기
  const handleBackFromAI = () => {
    setShowAIAnalysis(false);
    setShowResults(true);
    clearAnalysis();
  };

  // 🎯 AI 분석 보고서 다운로드
  const handleDownloadReport = () => {    
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

  // 🎯 상세한 텍스트 보고서 생성 함수
  const generateDetailedReport = (analysis, realTimeData, interviewAnswers, interviewQuestions) => {
    if (!analysis) return '분석 데이터가 없습니다.';
    
    const reportDate = new Date().toLocaleString('ko-KR');
    
    return `
=== AI 모의면접 분석 보고서 ===

📅 분석 일시: ${reportDate}
🎯 분석 방법: ${analysis.analysisMethod || 'AI Expert Analysis'}
⏱️ 면접 시간: ${Math.floor(analysis.duration / 60)}분 ${analysis.duration % 60}초
📝 완료 질문: ${interviewAnswers.filter(a => a && a.trim()).length}개 / ${interviewQuestions.length}개

=== 📊 종합 점수 ===
🏆 총점: ${analysis.overallScore}점 (${analysis.grade})
🎤 음성 표현: ${analysis.scores?.communication || 0}점
👁️ 시각적 인상: ${analysis.scores?.appearance || 0}점
📝 내용 품질: ${analysis.scores?.content || 0}점

=== 🎤 음성 분석 상세 ===
• 발음 명확도: ${analysis.detailed?.audio?.speechClarity || 0}점
• 말하기 속도: ${analysis.detailed?.audio?.paceAppropriate || 0}점
• 볼륨 일관성: ${analysis.detailed?.audio?.volumeConsistency || 0}점
• 피드백: ${analysis.detailed?.audio?.feedback || '음성 분석 완료'}

=== 👁️ 영상 분석 상세 ===
• 아이컨택: ${analysis.detailed?.video?.eyeContact || 0}점
• 표정 관리: ${analysis.detailed?.video?.facialExpression || 0}점
• 자세 유지: ${analysis.detailed?.video?.posture || 0}점
• 피드백: ${analysis.detailed?.video?.feedback || '영상 분석 완료'}

=== 📝 답변 내용 분석 ===
• 내용 품질: ${analysis.detailed?.text?.contentQuality || 0}점
• 구조/논리: ${analysis.detailed?.text?.structureLogic || 0}점
• 적합성: ${analysis.detailed?.text?.relevance || 0}점
• 피드백: ${analysis.detailed?.text?.feedback || '텍스트 분석 완료'}

=== 📝 질문별 답변 ===
${interviewQuestions.map((question, index) => {
  const answer = interviewAnswers[index] || '답변 없음';
  const wordCount = answer ? answer.split(/\s+/).filter(word => word.length > 0).length : 0;
  
  return `
[질문 ${index + 1}]
Q: ${question}
A: ${answer}
• 답변 길이: ${answer.length}자
• 단어 수: ${wordCount}개
• 완성도: ${answer && answer.trim() ? '완료' : '미완료'}
`;
}).join('')}

=== 💪 강점 분석 ===
${analysis.summary?.strengths?.map(s => `• ${s}`).join('\n') || '• 분석 완료'}

=== 🔧 개선사항 ===
${analysis.summary?.improvements?.map(i => `• ${i}`).join('\n') || '• 지속적인 연습 권장'}

=== 💡 맞춤형 추천사항 ===
${analysis.summary?.recommendation || '계속해서 연습하며 발전해나가세요!'}

---
보고서 생성 시간: ${reportDate}
분석 엔진: AI Expert Analysis System
세션 ID: ${analysis.sessionId || 'N/A'}
`;
  };

  // 결과 화면 닫기
  const handleCloseResults = () => {
    window.close();
  };

  // 면접 재시작
  const handleRestartInterview = () => {    
    resetInterview();
    resetTimer();
    clearCurrentAnswer();
    clearRecording();
    stopAnalysis();
    clearAnalysis();
    
    setShowResults(false);
    setShowAIAnalysis(false);
    setShowAILoading(false);
    setFinalAnalysis(null);
    setCalibrationCompleted(false);
    setShowStartupGuide(true);
    setFaceGuideEnabled(true);
    setIsInterviewStarted(false);
    setForceGuideComplete(false);
  };

  // 마이크 토글 시 분석도 연동
  const handleToggleMic = async () => {
    await toggleMic();
    
    if (!isMicOn && isTimerRunning && speechSupported && !isListening) {
      startListening(true);
    } else if (isMicOn && isListening) {
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
    clearCurrentAnswer();
  }, [currentQuestion]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (isAnalyzing) {
        stopAnalysis();
      }
      cleanupRecording();
      cleanupMedia();
    };
  }, []);

  // 브라우저 종료 시 정리
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isRecording || isAnalyzing) {
        event.preventDefault();
        event.returnValue = '면접이 진행 중입니다. 정말로 나가시겠습니까?';
        return event.returnValue;
      }
    };
    
    const handleUnload = () => {
      if (isRecording) {
        stopRecording();
      }
      if (isAnalyzing) {
        stopAnalysis();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [isRecording, isAnalyzing]);

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
        realTimeAnalysisData={analysisData}
      />
    );
  }

  // AI 분석 로딩 화면 (onComplete 콜백 추가)
  if (showAILoading) {
    return (
      <AIAnalysisLoading 
        progress={analysisProgress}
        onCancel={() => {
          setShowAILoading(false);
          setShowResults(true);
        }}
        onComplete={handleAIAnalysisComplete} // 🎯 완료 콜백 추가
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
        handleDownloadReport={handleDownloadReport}
        isRealTimeAnalysis={true}
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
              onComplete={handleCompleteInterview}
            />
          </div>

          {/* 오른쪽: 웹캠 화면 */}
          <div className={commonStyles.rightColumn}>
            
            {/* Enhanced VideoPlayer */}
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
                analysisData={analysisData}
                isMediaPipeReady={isMediaPipeReady}
                isAnalyzing={isAnalyzing}
                mediaStream={mediaStream}
                showFaceGuide={faceGuideEnabled}
                onCalibrationComplete={handleCalibrationComplete}
                isInterviewStarted={isInterviewStarted}
                forceGuideComplete={forceGuideComplete}
              />
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