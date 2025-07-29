import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 실시간 면접 분석을 관리하는 커스텀 훅
 * MediaPipe와 Web Audio API를 사용한 얼굴/음성 분석
 */
export const useRealTimeAnalysis = (mediaStream, videoRef) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState({
    audio: {
      currentVolume: 0,
      averageVolume: 0,
      speakingTime: 0,
      wordsPerMinute: 0,
      fillerWordsCount: 0,
      speechClarity: 85
    },
    video: {
      faceDetected: false,
      eyeContactPercentage: 0,
      smileDetection: 0,
      postureScore: 70,
      headPoseStability: 75,
      faceDetectionRate: 0
    }
  });
  
  const [finalAnalysis, setFinalAnalysis] = useState(null);
  
  // 분석 상태 관리
  const analysisRef = useRef({
    startTime: null,
    audioData: [],
    videoData: [],
    speakingTimeTotal: 0,
    faceDetectionCount: 0,
    totalFrames: 0,
    eyeContactFrames: 0,
    smileFrames: 0
  });
  
  const animationFrameRef = useRef(null);
  const audioAnalyser = useRef(null);
  const audioDataArray = useRef(null);
  const faceDetectionRef = useRef(null);

  // 오디오 분석 설정
  const setupAudioAnalysis = useCallback(async (stream) => {
    try {
      console.log('🔊 오디오 분석 설정 시작...');
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyser);
      
      audioAnalyser.current = analyser;
      audioDataArray.current = dataArray;
      
      console.log('✅ 오디오 분석 설정 완료');
      return true;
      
    } catch (error) {
      console.error('❌ 오디오 분석 설정 실패:', error);
      return false;
    }
  }, []);

  // 얼굴 인식 설정 (MediaPipe 시뮬레이션)
  const setupFaceDetection = useCallback(async () => {
    try {
      console.log('👤 얼굴 인식 설정 시작...');
      
      // 실제 MediaPipe 대신 기본적인 얼굴 감지 시뮬레이션
      // 실제 프로덕션에서는 MediaPipe나 face-api.js 사용
      faceDetectionRef.current = {
        isActive: true,
        detectFace: (videoElement) => {
          if (!videoElement || !videoElement.videoWidth) {
            return {
              faceDetected: false,
              eyeContact: 0,
              smile: 0,
              headPose: { stable: false }
            };
          }
          
          // 비디오가 재생 중이면 얼굴이 감지된 것으로 가정
          const isPlaying = !videoElement.paused && !videoElement.ended && 
                          videoElement.readyState > 2 && videoElement.videoWidth > 0;
          
          if (isPlaying) {
            return {
              faceDetected: true,
              eyeContact: Math.random() * 100, // 실제로는 시선 추적 알고리즘
              smile: Math.random() * 50 + 10,  // 실제로는 표정 인식 알고리즘
              headPose: { stable: Math.random() > 0.3 }
            };
          }
          
          return {
            faceDetected: false,
            eyeContact: 0,
            smile: 0,
            headPose: { stable: false }
          };
        }
      };
      
      console.log('✅ 얼굴 인식 설정 완료 (시뮬레이션 모드)');
      return true;
      
    } catch (error) {
      console.error('❌ 얼굴 인식 설정 실패:', error);
      return false;
    }
  }, []);

  // 오디오 분석 수행
  const analyzeAudio = useCallback(() => {
    if (!audioAnalyser.current || !audioDataArray.current) {
      return {
        currentVolume: 0,
        isSpeaking: false
      };
    }
    
    try {
      audioAnalyser.current.getByteFrequencyData(audioDataArray.current);
      
      // 볼륨 계산
      let sum = 0;
      for (let i = 0; i < audioDataArray.current.length; i++) {
        sum += audioDataArray.current[i];
      }
      const averageVolume = sum / audioDataArray.current.length;
      const currentVolume = Math.round((averageVolume / 255) * 100);
      
      // 말하기 감지 (볼륨이 일정 수준 이상)
      const isSpeaking = currentVolume > 5;
      
      return {
        currentVolume,
        isSpeaking
      };
      
    } catch (error) {
      console.error('오디오 분석 오류:', error);
      return {
        currentVolume: 0,
        isSpeaking: false
      };
    }
  }, []);

  // 비디오 분석 수행
  const analyzeVideo = useCallback(() => {
    if (!videoRef.current || !faceDetectionRef.current) {
      return {
        faceDetected: false,
        eyeContact: 0,
        smile: 0,
        headPoseStable: false
      };
    }
    
    try {
      const detection = faceDetectionRef.current.detectFace(videoRef.current);
      
      return {
        faceDetected: detection.faceDetected,
        eyeContact: Math.round(detection.eyeContact),
        smile: Math.round(detection.smile),
        headPoseStable: detection.headPose.stable
      };
      
    } catch (error) {
      console.error('비디오 분석 오류:', error);
      return {
        faceDetected: false,
        eyeContact: 0,
        smile: 0,
        headPoseStable: false
      };
    }
  }, [videoRef]);

  // 실시간 분석 루프
  const analysisLoop = useCallback(() => {
    if (!isAnalyzing) return;
    
    try {
      // 오디오 분석
      const audioResult = analyzeAudio();
      
      // 비디오 분석
      const videoResult = analyzeVideo();
      
      // 분석 데이터 업데이트
      const currentTime = Date.now();
      const elapsed = analysisRef.current.startTime 
        ? (currentTime - analysisRef.current.startTime) / 1000 
        : 0;
      
      // 통계 업데이트
      if (audioResult.isSpeaking) {
        analysisRef.current.speakingTimeTotal += 0.1; // 100ms 간격 추정
      }
      
      analysisRef.current.totalFrames += 1;
      
      if (videoResult.faceDetected) {
        analysisRef.current.faceDetectionCount += 1;
      }
      
      if (videoResult.eyeContact > 60) {
        analysisRef.current.eyeContactFrames += 1;
      }
      
      if (videoResult.smile > 30) {
        analysisRef.current.smileFrames += 1;
      }
      
      // 실시간 데이터 업데이트
      setAnalysisData(prev => ({
        audio: {
          ...prev.audio,
          currentVolume: audioResult.currentVolume,
          speakingTime: Math.round(analysisRef.current.speakingTimeTotal),
          wordsPerMinute: elapsed > 0 
            ? Math.round((analysisRef.current.speakingTimeTotal / elapsed) * 150) // 추정 WPM
            : 0
        },
        video: {
          ...prev.video,
          faceDetected: videoResult.faceDetected,
          eyeContactPercentage: analysisRef.current.totalFrames > 0
            ? Math.round((analysisRef.current.eyeContactFrames / analysisRef.current.totalFrames) * 100)
            : 0,
          smileDetection: Math.round(videoResult.smile),
          postureScore: videoResult.headPoseStable ? 80 : 60,
          faceDetectionRate: analysisRef.current.totalFrames > 0
            ? Math.round((analysisRef.current.faceDetectionCount / analysisRef.current.totalFrames) * 100)
            : 0
        }
      }));
      
      // 다음 프레임 예약
      animationFrameRef.current = requestAnimationFrame(analysisLoop);
      
    } catch (error) {
      console.error('분석 루프 오류:', error);
    }
  }, [isAnalyzing, analyzeAudio, analyzeVideo]);

  // 분석 시작
  const startAnalysis = useCallback(async () => {
    if (!mediaStream) {
      console.warn('⚠️ 미디어 스트림이 없어서 분석을 시작할 수 없습니다');
      return false;
    }
    
    try {
      console.log('📊 실시간 분석 시작...');
      
      // 오디오 분석 설정
      const audioSetup = await setupAudioAnalysis(mediaStream);
      if (!audioSetup) {
        console.warn('⚠️ 오디오 분석 설정 실패');
      }
      
      // 얼굴 인식 설정
      const faceSetup = await setupFaceDetection();
      if (!faceSetup) {
        console.warn('⚠️ 얼굴 인식 설정 실패');
      }
      
      // 분석 시작
      analysisRef.current.startTime = Date.now();
      analysisRef.current.audioData = [];
      analysisRef.current.videoData = [];
      analysisRef.current.speakingTimeTotal = 0;
      analysisRef.current.faceDetectionCount = 0;
      analysisRef.current.totalFrames = 0;
      analysisRef.current.eyeContactFrames = 0;
      analysisRef.current.smileFrames = 0;
      
      setIsAnalyzing(true);
      
      // 분석 루프 시작
      animationFrameRef.current = requestAnimationFrame(analysisLoop);
      
      console.log('✅ 실시간 분석 시작 완료');
      return true;
      
    } catch (error) {
      console.error('❌ 실시간 분석 시작 실패:', error);
      return false;
    }
  }, [mediaStream, setupAudioAnalysis, setupFaceDetection, analysisLoop]);

  // 분석 중지
  const stopAnalysis = useCallback(() => {
    console.log('⏹️ 실시간 분석 중지...');
    
    setIsAnalyzing(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (faceDetectionRef.current) {
      faceDetectionRef.current.isActive = false;
    }
    
    console.log('✅ 실시간 분석 중지 완료');
  }, []);

  // 최종 분석 결과 생성
  const finishAnalysis = useCallback(() => {
    console.log('🏁 최종 분석 결과 생성...');
    
    const endTime = Date.now();
    const duration = analysisRef.current.startTime 
      ? (endTime - analysisRef.current.startTime) / 1000 
      : 0;
    
    // 점수 계산
    const audioScore = Math.min(95, Math.max(40, 
      60 + 
      (analysisData.audio.speakingTime > 30 ? 10 : -5) + // 적절한 말하기 시간
      (analysisData.audio.currentVolume > 20 && analysisData.audio.currentVolume < 80 ? 10 : -5) // 적절한 볼륨
    ));
    
    const videoScore = Math.min(95, Math.max(40,
      50 +
      (analysisData.video.faceDetectionRate > 80 ? 15 : -10) + // 얼굴 감지율
      (analysisData.video.eyeContactPercentage > 50 ? 15 : -5) + // 아이컨택
      (analysisData.video.smileDetection > 20 ? 10 : -5) // 표정
    ));
    
    const overallScore = Math.round((audioScore + videoScore) / 2);
    
    let grade;
    if (overallScore >= 90) grade = 'A+';
    else if (overallScore >= 85) grade = 'A';
    else if (overallScore >= 80) grade = 'B+';
    else if (overallScore >= 75) grade = 'B';
    else if (overallScore >= 70) grade = 'C+';
    else if (overallScore >= 65) grade = 'C';
    else grade = 'D';
    
    // 강점과 개선사항 분석
    const strengths = [];
    const improvements = [];
    
    if (analysisData.video.faceDetectionRate > 80) {
      strengths.push('카메라 앞에서 안정적인 자세 유지');
    } else {
      improvements.push('카메라 앞에 정면으로 앉아 얼굴이 잘 보이도록 조정');
    }
    
    if (analysisData.video.eyeContactPercentage > 60) {
      strengths.push('적절한 아이컨택 유지');
    } else {
      improvements.push('카메라를 더 자주 봐서 아이컨택 개선');
    }
    
    if (analysisData.audio.currentVolume > 20 && analysisData.audio.currentVolume < 80) {
      strengths.push('적절한 목소리 크기');
    } else if (analysisData.audio.currentVolume <= 20) {
      improvements.push('목소리를 더 크게 하여 명확한 전달');
    } else {
      improvements.push('목소리 톤을 조금 더 부드럽게');
    }
    
    if (analysisData.video.smileDetection > 30) {
      strengths.push('밝은 표정과 미소');
    } else {
      improvements.push('더 밝은 표정으로 긍정적인 인상 전달');
    }
    
    // 추천사항
    let recommendation;
    if (overallScore >= 85) {
      recommendation = '매우 우수한 면접 태도입니다. 현재 수준을 유지하시면 좋은 결과를 얻을 수 있을 것입니다.';
    } else if (overallScore >= 70) {
      recommendation = '전반적으로 좋은 면접 자세입니다. 몇 가지 개선사항을 보완하면 더욱 완벽해질 것입니다.';
    } else {
      recommendation = '기본기는 갖추어져 있습니다. 개선사항을 중점적으로 연습하여 면접 실력을 향상시켜보세요.';
    }
    
    const result = {
      overallScore,
      grade,
      scores: {
        communication: audioScore,
        appearance: videoScore
      },
      detailed: {
        audio: {
          averageVolume: analysisData.audio.currentVolume,
          speakingTime: analysisData.audio.speakingTime,
          wordsPerMinute: analysisData.audio.wordsPerMinute,
          fillerWords: analysisData.audio.fillerWordsCount,
          speechClarity: analysisData.audio.speechClarity
        },
        video: {
          faceDetectionRate: analysisData.video.faceDetectionRate,
          eyeContactPercentage: analysisData.video.eyeContactPercentage,
          smileFrequency: analysisData.video.smileDetection,
          postureScore: analysisData.video.postureScore,
          headPoseStability: analysisData.video.headPoseStability
        }
      },
      summary: {
        strengths,
        improvements,
        recommendation
      },
      duration: Math.round(duration),
      timestamp: endTime
    };
    
    setFinalAnalysis(result);
    console.log('✅ 최종 분석 결과 생성 완료:', result);
    
    return result;
  }, [analysisData]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log('🧹 실시간 분석 정리...');
      stopAnalysis();
    };
  }, [stopAnalysis]);

  return {
    isAnalyzing,
    analysisData,
    finalAnalysis,
    startAnalysis,
    stopAnalysis,
    finishAnalysis
  };
};