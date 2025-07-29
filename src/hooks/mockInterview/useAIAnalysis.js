import { useState, useCallback } from 'react';

/**
 * AI 면접 분석을 관리하는 커스텀 훅
 */
export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // AI 분석 실행
  const analyzeInterview = useCallback(async (interviewData) => {
    try {
      console.log('🤖 AI 면접 분석 시작...');
      setIsAnalyzing(true);
      setAnalysisError(null);
      setAnalysisProgress(0);

      const { videoBlob, answers, questions, recordingDuration } = interviewData;

      // 1. 비디오 분석 (시뮬레이션)
      setAnalysisProgress(10);
      console.log('👁️ 영상 분석 중...');
      const videoAnalysis = await analyzeVideo(videoBlob);
      
      // 2. 음성 분석 (시뮬레이션)
      setAnalysisProgress(40);
      console.log('🎤 음성 분석 중...');
      const audioAnalysis = await analyzeAudio(videoBlob);
      
      // 3. 텍스트 분석 (시뮬레이션)
      setAnalysisProgress(70);
      console.log('📝 답변 내용 분석 중...');
      const textAnalysis = await analyzeAnswers(answers, questions);
      
      // 4. 종합 분석 결과 생성
      setAnalysisProgress(90);
      console.log('📊 종합 분석 결과 생성 중...');
      const comprehensiveAnalysis = generateComprehensiveAnalysis({
        videoAnalysis,
        audioAnalysis,
        textAnalysis,
        recordingDuration,
        totalQuestions: questions.length
      });

      setAnalysisProgress(100);
      setAnalysisResult(comprehensiveAnalysis);
      console.log('✅ AI 분석 완료:', comprehensiveAnalysis);

    } catch (error) {
      console.error('❌ AI 분석 실패:', error);
      setAnalysisError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // 비디오 분석 (시뮬레이션 - 실제로는 백엔드 API 호출)
  const analyzeVideo = async (videoBlob) => {
    // 시뮬레이션을 위한 지연
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      faceDetection: {
        eyeContact: Math.floor(Math.random() * 30) + 60, // 60-90%
        facialExpression: Math.floor(Math.random() * 20) + 70, // 70-90%
        headPose: Math.floor(Math.random() * 25) + 65 // 65-90%
      },
      bodyLanguage: {
        posture: Math.floor(Math.random() * 20) + 70,
        handGestures: Math.floor(Math.random() * 30) + 60,
        stability: Math.floor(Math.random() * 25) + 65
      },
      overall: Math.floor(Math.random() * 20) + 70
    };
  };

  // 음성 분석 (시뮬레이션)
  const analyzeAudio = async (videoBlob) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      speechClarity: Math.floor(Math.random() * 20) + 70,
      speakingPace: Math.floor(Math.random() * 25) + 65,
      volumeLevel: Math.floor(Math.random() * 15) + 75,
      tonality: Math.floor(Math.random() * 20) + 70,
      fillerWords: Math.floor(Math.random() * 15) + 5, // 5-20개
      pauseAnalysis: Math.floor(Math.random() * 25) + 65,
      overall: Math.floor(Math.random() * 20) + 70
    };
  };

  // 텍스트 분석 (시뮬레이션)
  const analyzeAnswers = async (answers, questions) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const answerAnalyses = answers.map((answer, index) => {
      const wordCount = answer ? answer.split(' ').length : 0;
      return {
        questionIndex: index,
        wordCount,
        relevance: Math.floor(Math.random() * 20) + 70,
        clarity: Math.floor(Math.random() * 25) + 65,
        completeness: Math.floor(Math.random() * 20) + 70,
        keywords: extractKeywords(answer),
        sentiment: analyzeSentiment(answer)
      };
    });

    return {
      answers: answerAnalyses,
      overallCoherence: Math.floor(Math.random() * 20) + 70,
      vocabularyRichness: Math.floor(Math.random() * 25) + 65,
      grammarAccuracy: Math.floor(Math.random() * 15) + 80,
      overall: Math.floor(Math.random() * 20) + 70
    };
  };

  // 키워드 추출 (시뮬레이션)
  const extractKeywords = (text) => {
    if (!text) return [];
    const commonKeywords = ['경험', '프로젝트', '팀워크', '문제해결', '도전', '학습', '성장', '책임감'];
    return commonKeywords.filter(() => Math.random() > 0.7).slice(0, 3);
  };

  // 감정 분석 (시뮬레이션)
  const analyzeSentiment = (text) => {
    if (!text) return 'neutral';
    const sentiments = ['positive', 'neutral', 'confident'];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  };

  // 종합 분석 결과 생성
  const generateComprehensiveAnalysis = (analysisData) => {
    const { videoAnalysis, audioAnalysis, textAnalysis, recordingDuration, totalQuestions } = analysisData;
    
    const overallScore = Math.round(
      (videoAnalysis.overall + audioAnalysis.overall + textAnalysis.overall) / 3
    );

    const strengths = [];
    const improvements = [];

    // 강점 분석
    if (videoAnalysis.faceDetection.eyeContact >= 70) {
      strengths.push('👁️ 좋은 아이컨택을 유지했습니다');
    }
    if (audioAnalysis.speechClarity >= 75) {
      strengths.push('🗣️ 명확한 발음으로 말씀하셨습니다');
    }
    if (textAnalysis.overallCoherence >= 70) {
      strengths.push('📝 일관성 있는 답변을 하셨습니다');
    }

    // 개선사항 분석
    if (videoAnalysis.faceDetection.eyeContact < 60) {
      improvements.push('👁️ 카메라와의 아이컨택을 더 자주 해보세요');
    }
    if (audioAnalysis.speakingPace < 60) {
      improvements.push('⏱️ 말하는 속도를 조금 더 빠르게 해보세요');
    }
    if (textAnalysis.overallCoherence < 60) {
      improvements.push('📋 답변의 구조를 더 체계적으로 구성해보세요');
    }

    return {
      overallScore,
      grade: getGrade(overallScore),
      timestamp: new Date().toISOString(),
      duration: recordingDuration,
      totalQuestions,
      
      detailed: {
        video: videoAnalysis,
        audio: audioAnalysis,
        text: textAnalysis
      },
      
      summary: {
        strengths,
        improvements,
        recommendation: generateRecommendation(overallScore)
      },
      
      scores: {
        communication: Math.round((audioAnalysis.overall + textAnalysis.overall) / 2),
        appearance: videoAnalysis.overall,
        content: textAnalysis.overall,
        overall: overallScore
      }
    };
  };

  // 등급 계산
  const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    return 'C';
  };

  // 추천사항 생성
  const generateRecommendation = (score) => {
    if (score >= 85) {
      return '훌륭한 면접이었습니다! 자신감을 가지고 실제 면접에 임하세요.';
    } else if (score >= 70) {
      return '좋은 면접이었습니다. 몇 가지 부분을 보완하면 더욱 완벽해질 것입니다.';
    } else if (score >= 60) {
      return '기본기는 갖추어져 있습니다. 연습을 통해 더욱 발전시켜보세요.';
    } else {
      return '더 많은 연습이 필요합니다. 기본기부터 차근차근 준비해보세요.';
    }
  };

  // 분석 결과 초기화
  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setAnalysisError(null);
    setAnalysisProgress(0);
  }, []);

  return {
    isAnalyzing,
    analysisResult,
    analysisError,
    analysisProgress,
    analyzeInterview,
    clearAnalysis,
    hasAnalysis: !!analysisResult
  };
};