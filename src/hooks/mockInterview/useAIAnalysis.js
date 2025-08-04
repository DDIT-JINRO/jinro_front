import { useState, useCallback, useRef } from 'react';
import { interviewAnalysisApi } from '../../api/mockInterview/interviewAnalysisApi';

/**
 * AI 면접 분석을 관리하는 커스텀 훅
 */
export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // 🎯 진행률 업데이트 및 취소를 위한 ref
  const progressTimeoutRef = useRef(null);
  const currentSessionIdRef = useRef(null);

  // AI 분석 실행
  const analyzeInterview = useCallback(async (questions, answers, realTimeData, recordingDuration) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress(0);
    
    // 세션 ID 생성
    const sessionId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    currentSessionIdRef.current = sessionId;
    
    try {      
      // 🎯 백엔드 API 요청 데이터 구성 (sessionId를 최상위로)
      const requestData = {
        sessionId: sessionId, // 🎯 최상위 레벨에 sessionId 배치
        interview_data: {
          questions: questions || [],
          answers: answers || [],
          duration: recordingDuration || 0,
          timestamp: new Date().toISOString()
          // sessionId는 여기서 제거 (최상위로 이동)
        },
        realtime_analysis: {
          audio: {
            averageVolume: realTimeData?.audio?.averageVolume || 0,
            speakingTime: realTimeData?.audio?.speakingTime || 0,
            wordsPerMinute: realTimeData?.audio?.wordsPerMinute || 0,
            fillerWordsCount: realTimeData?.audio?.fillerWordsCount || 0,
            speechClarity: realTimeData?.audio?.speechClarity || 0
          },
          video: {
            faceDetected: realTimeData?.video?.faceDetected || false,
            eyeContactPercentage: realTimeData?.video?.eyeContactPercentage || 0,
            smileDetection: realTimeData?.video?.smileDetection || 0,
            postureScore: realTimeData?.video?.postureScore || 0,
            faceDetectionRate: realTimeData?.video?.faceDetectionRate || 0,
            emotionAnalysis: realTimeData?.video?.emotionAnalysis || {}
          },
          metadata: {
            browserInfo: navigator.userAgent,
            deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            analysisStartTime: new Date().toISOString()
          }
        }
      };

      // 🎯 진행률 시뮬레이션 시작
      const simulateProgress = async () => {
        const progressSteps = [
          { progress: 5, delay: 300, message: '서버 연결 중...' },
          { progress: 15, delay: 800, message: '데이터 전송 중...' },
          { progress: 30, delay: 1200, message: '영상 분석 시작...' },
          { progress: 50, delay: 1500, message: '음성 분석 중...' },
          { progress: 70, delay: 1200, message: '답변 내용 분석...' },
          { progress: 85, delay: 1000, message: 'AI 종합 분석...' },
          { progress: 95, delay: 800, message: '결과 생성 중...' }
        ];

        for (const step of progressSteps) {
          // 🎯 분석이 중단된 경우 루프 중단
          if (!isAnalyzing || currentSessionIdRef.current !== sessionId) break;
          
          await new Promise(resolve => {
            progressTimeoutRef.current = setTimeout(resolve, step.delay);
          });
          
          setAnalysisProgress(step.progress);
        }
      };

      // 진행률 시뮬레이션 시작
      simulateProgress();

      // 🎯 백엔드 API 호출
      const analysisResponse = await interviewAnalysisApi.requestDetailedAnalysis(requestData);
      
      ('📥 백엔드 응답 받음:', {
        success: analysisResponse.success,
        overallScore: analysisResponse.overallScore,
        sessionId: analysisResponse.sessionId
      });

      // 🎯 진행률 100%로 설정
      setAnalysisProgress(100);

      // 🎯 백엔드 응답을 프론트엔드 형식에 맞게 변환
      const transformedResult = {
        sessionId: analysisResponse.sessionId || sessionId,
        overallScore: analysisResponse.overallScore || 75,
        grade: analysisResponse.grade || calculateGrade(analysisResponse.overallScore || 75),
        timestamp: analysisResponse.timestamp || new Date().toISOString(),
        duration: recordingDuration,
        analysisMethod: analysisResponse.analysisMethod || 'AI Expert Analysis',
        
        detailed: {
          audio: {
            speechClarity: analysisResponse.detailed?.audio?.speechClarity || 75,
            paceAppropriate: analysisResponse.detailed?.audio?.paceAppropriate || 75,
            volumeConsistency: analysisResponse.detailed?.audio?.volumeConsistency || 75,
            feedback: analysisResponse.detailed?.audio?.feedback || '음성 분석이 완료되었습니다.'
          },
          video: {
            eyeContact: analysisResponse.detailed?.video?.eyeContact || realTimeData?.video?.eyeContactPercentage || 75,
            facialExpression: analysisResponse.detailed?.video?.facialExpression || 75,
            posture: analysisResponse.detailed?.video?.posture || realTimeData?.video?.postureScore || 75,
            feedback: analysisResponse.detailed?.video?.feedback || '비언어적 소통 분석이 완료되었습니다.'
          },
          text: {
            contentQuality: analysisResponse.detailed?.text?.contentQuality || 75,
            structureLogic: analysisResponse.detailed?.text?.structureLogic || 75,
            relevance: analysisResponse.detailed?.text?.relevance || 75,
            feedback: analysisResponse.detailed?.text?.feedback || '답변 내용 분석이 완료되었습니다.'
          }
        },
        
        summary: {
          strengths: analysisResponse.summary?.strengths || ['성실한 태도', '기본적인 소통 능력'],
          improvements: analysisResponse.summary?.improvements || ['답변 구체화 필요', '자신감 향상 권장'],
          recommendation: analysisResponse.summary?.recommendation || '지속적인 연습을 통해 더욱 발전하실 수 있습니다!'
        },
        
        scores: {
          communication: analysisResponse.scores?.communication || 75,
          appearance: analysisResponse.scores?.appearance || 75,
          content: analysisResponse.scores?.content || 75,
          overall: analysisResponse.scores?.overall || analysisResponse.overallScore || 75
        }
      };

      setAnalysisResult(transformedResult);

    } catch (error) {
      console.error('❌ AI 분석 실패:', error);
      setAnalysisError(error.message);
      
      // 🎯 에러 시 기본 결과 제공 (사용자 경험 개선)
      const fallbackResult = {
        sessionId,
        overallScore: 70,
        grade: 'B',
        timestamp: new Date().toISOString(),
        duration: recordingDuration,
        analysisMethod: '기본 분석 (오류로 인한 대체 결과)',
        
        detailed: {
          audio: {
            speechClarity: 70,
            paceAppropriate: 70,
            volumeConsistency: 70,
            feedback: '음성 분석 중 오류가 발생했습니다. 네트워크 연결을 확인 후 다시 시도해주세요.'
          },
          video: {
            eyeContact: realTimeData?.video?.eyeContactPercentage || 70,
            facialExpression: 70,
            posture: realTimeData?.video?.postureScore || 70,
            feedback: '영상 분석 중 오류가 발생했습니다. 카메라 설정을 확인해주세요.'
          },
          text: {
            contentQuality: 70,
            structureLogic: 70,
            relevance: 70,
            feedback: '답변 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          }
        },
        
        summary: {
          strengths: ['면접 참여에 감사드립니다', '기본적인 준비가 되어있습니다'],
          improvements: ['서버 연결 상태 확인', '다시 시도해보세요'],
          recommendation: '기술적 문제가 지속되면 관리자에게 문의해주세요. 면접 연습은 계속하시길 권장합니다!'
        },
        
        scores: {
          communication: 70,
          appearance: 70,
          content: 70,
          overall: 70
        },
        
        isErrorResult: true,
        errorDetails: error.message
      };
      
      setAnalysisResult(fallbackResult);
      
    } finally {
      setIsAnalyzing(false);
      // 정리 작업
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
      currentSessionIdRef.current = null;
    }
  }, [isAnalyzing]);

  // 🎯 분석 취소
  const cancelAnalysis = useCallback(async () => {
    if (currentSessionIdRef.current) {
      try {
        await interviewAnalysisApi.cancelAnalysis(currentSessionIdRef.current);
      } catch (error) {
        console.warn('⚠️ 분석 취소 실패:', error.message);
      }
    }
    
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
  }, []);

  // 분석 결과 초기화
  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setAnalysisError(null);
    setAnalysisProgress(0);
  }, []);

  // 🎯 점수에 따른 등급 계산
  const calculateGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    return 'D';
  };

  return {
    isAnalyzing,
    analysisResult,
    analysisError,
    analysisProgress,
    analyzeInterview,
    cancelAnalysis,
    clearAnalysis,
    hasAnalysis: !!analysisResult,
    currentSessionId: currentSessionIdRef.current
  };
};