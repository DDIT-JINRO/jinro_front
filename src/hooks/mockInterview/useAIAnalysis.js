import { useState, useCallback } from 'react';
import { interviewAnalysisApi } from '../../api/mockInterview/interviewAnalysisApi';

/**
 * AI 면접 분석을 관리하는 커스텀 훅
 */
export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // AI 분석 실행
  const analyzeInterview = useCallback(async (questions, answers, realTimeData, recordingDuration) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress(0);
    
    try {
      console.log('🎯 Gemini AI 분석 시작...');
      
      // 프로그레스 시뮬레이션
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // 백엔드 API 요청 데이터 구성
      const requestData = {
        interview_data: {
          questions: questions || [],
          answers: answers || [],
          duration: recordingDuration || 0,
          sessionId: `interview_${Date.now()}`
        },
        realtime_analysis: {
          audio: {
            averageVolume: realTimeData?.audio?.averageVolume || 0,
            speakingTime: realTimeData?.audio?.speakingTime || 0,
            wordsPerMinute: realTimeData?.audio?.wordsPerMinute || 0,
            fillerWordsCount: realTimeData?.audio?.fillerWordsCount || 0
          },
          video: {
            faceDetected: realTimeData?.video?.faceDetected || false,
            eyeContactPercentage: realTimeData?.video?.eyeContactPercentage || 0,
            smileDetection: realTimeData?.video?.smileDetection || 0,
            postureScore: realTimeData?.video?.postureScore || 0,
            faceDetectionRate: realTimeData?.video?.faceDetectionRate || 0
          }
        }
      };

      // 백엔드 API 호출
      const analysisResponse = await interviewAnalysisApi.requestDetailedAnalysis(requestData);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);

      // 기존 프론트엔드 형식에 맞게 변환
      const transformedResult = {
        overallScore: analysisResponse.overallScore,
        grade: analysisResponse.grade,
        timestamp: analysisResponse.timestamp,
        duration: recordingDuration,
        analysisMethod: analysisResponse.analysisMethod,
        
        detailed: {
          audio: {
            speechClarity: analysisResponse.detailed?.audio?.speechClarity || 75,
            paceAppropriate: analysisResponse.detailed?.audio?.paceAppropriate || 75,
            volumeConsistency: analysisResponse.detailed?.audio?.volumeConsistency || 75,
            feedback: analysisResponse.detailed?.audio?.feedback || '음성 분석이 완료되었습니다.'
          },
          video: {
            eyeContact: analysisResponse.detailed?.video?.eyeContact || 75,
            facialExpression: analysisResponse.detailed?.video?.facialExpression || 75,
            posture: analysisResponse.detailed?.video?.posture || 75,
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
          strengths: analysisResponse.summary?.strengths || ['성실한 태도', '기본기 보유'],
          improvements: analysisResponse.summary?.improvements || ['답변 구체화', '자신감 향상'],
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
      console.log('✅ Gemini AI 분석 완료:', transformedResult);

    } catch (error) {
      console.error('❌ AI 분석 실패:', error);
      setAnalysisError(error.message);
      
      // 에러 시 기본값 제공 (선택사항)
      setAnalysisResult({
        overallScore: 70,
        grade: 'B',
        timestamp: new Date().toISOString(),
        duration: recordingDuration,
        analysisMethod: 'Gemini AI Expert Analysis (오류로 인한 기본 분석)',
        
        detailed: {
          audio: {
            speechClarity: 70,
            paceAppropriate: 70,
            volumeConsistency: 70,
            feedback: '음성 분석 중 오류가 발생했습니다. 다시 시도해주세요.'
          },
          video: {
            eyeContact: 70,
            facialExpression: 70,
            posture: 70,
            feedback: '영상 분석 중 오류가 발생했습니다. 다시 시도해주세요.'
          },
          text: {
            contentQuality: 70,
            structureLogic: 70,
            relevance: 70,
            feedback: '답변 분석 중 오류가 발생했습니다. 다시 시도해주세요.'
          }
        },
        
        summary: {
          strengths: ['면접에 참여해주셔서 감사합니다'],
          improvements: ['네트워크 연결을 확인해주세요'],
          recommendation: '잠시 후 다시 시도해주세요. 기술적 문제가 지속되면 관리자에게 문의해주세요.'
        },
        
        scores: {
          communication: 70,
          appearance: 70,
          content: 70,
          overall: 70
        }
      });
      
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

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
}