import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 실시간 면접 분석을 관리하는 커스텀 훅 (프로덕션 안정화 버전)
 * MediaPipe 없이 안정적인 시뮬레이션 기반 분석
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
    smileFrames: 0,
    volumeHistory: [],
    lastScoreUpdate: 0,
    lastVideoUpdate: 0,
    lastTipUpdate: 0,
    wordCount: 0,
    silenceStart: null,
    isCurrentlySpeaking: false,
    // 비디오 분석 안정화를 위한 버퍼와 상태
    faceDetectionBuffer: [],
    eyeContactBuffer: [],
    smileBuffer: [],
    stableFaceFrameCount: 0,
    noFaceFrameCount: 0,
    currentFaceState: false,
    lastFaceStateChange: 0
  });
  
  const animationFrameRef = useRef(null);
  const audioAnalyser = useRef(null);
  const audioDataArray = useRef(null);

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
      
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.9;
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

  // 향상된 시뮬레이션 기반 얼굴 감지 (MediaPipe 없이)
  const detectFaceFromVideo = useCallback(() => {
    if (!videoRef?.current) {
      return {
        faceDetected: false,
        eyeContact: 0,
        smile: 0,
        headPoseStable: false
      };
    }

    const video = videoRef.current;
    
    // 비디오가 실제로 재생 중인지 확인
    const isVideoPlaying = !video.paused && 
                          !video.ended && 
                          video.readyState >= 2 && 
                          video.videoWidth > 0 &&
                          video.videoHeight > 0;
    
    if (!isVideoPlaying) {
      analysisRef.current.noFaceFrameCount++;
      analysisRef.current.stableFaceFrameCount = 0;
      return {
        faceDetected: false,
        eyeContact: 0,
        smile: 0,
        headPoseStable: false
      };
    }

    // 현실적인 얼굴 감지 시뮬레이션
    // 비디오가 재생 중이면 높은 확률로 얼굴 감지
    const baseProbability = 0.85;
    
    // 연속으로 얼굴이 감지되지 않으면 확률 감소
    const penaltyFactor = Math.max(0.3, 1 - (analysisRef.current.noFaceFrameCount * 0.01));
    const detectionProbability = baseProbability * penaltyFactor;
    
    const randomFactor = Math.random();
    
    if (randomFactor < detectionProbability) {
      // 얼굴 감지됨
      analysisRef.current.noFaceFrameCount = 0;
      analysisRef.current.stableFaceFrameCount++;
      
      // 안정된 얼굴 감지 (10프레임 이상 연속 감지)
      const isStableFace = analysisRef.current.stableFaceFrameCount > 10;
      
      // 시간에 따른 자연스러운 변화
      const timeVariation = (Date.now() / 10000) % (Math.PI * 2); // 10초 주기
      
      return {
        faceDetected: true,
        eyeContact: isStableFace 
          ? Math.round(45 + 35 * Math.sin(timeVariation) + Math.random() * 10) // 45-90% 범위
          : Math.round(20 + Math.random() * 30), // 20-50% 범위
        smile: isStableFace 
          ? Math.round(15 + 20 * Math.cos(timeVariation * 0.7) + Math.random() * 10) // 15-35% 범위
          : Math.round(5 + Math.random() * 15), // 5-20% 범위
        headPoseStable: isStableFace && randomFactor > 0.3
      };
    } else {
      // 얼굴 감지되지 않음
      analysisRef.current.noFaceFrameCount++;
      analysisRef.current.stableFaceFrameCount = Math.max(0, analysisRef.current.stableFaceFrameCount - 2);
      return {
        faceDetected: false,
        eyeContact: 0,
        smile: 0,
        headPoseStable: false
      };
    }
  }, []);

  // 안정화된 평균값 계산
  const getStabilizedValue = (buffer, newValue, bufferSize = 15) => {
    buffer.push(newValue);
    if (buffer.length > bufferSize) {
      buffer.shift();
    }
    
    if (buffer.length === 0) return 0;
    
    // 이상치 제거 후 평균 계산
    const sorted = [...buffer].sort((a, b) => a - b);
    const trimmed = sorted.slice(Math.floor(sorted.length * 0.1), Math.ceil(sorted.length * 0.9));
    return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
  };

  // 얼굴 감지 상태 안정화 (급격한 변화 방지)
  const getStabilizedFaceDetection = (newDetected) => {
    const currentTime = Date.now();
    const minStateChangeDuration = 1000; // 1초간 상태 유지
    
    if (newDetected !== analysisRef.current.currentFaceState) {
      if (currentTime - analysisRef.current.lastFaceStateChange > minStateChangeDuration) {
        analysisRef.current.currentFaceState = newDetected;
        analysisRef.current.lastFaceStateChange = currentTime;
        return newDetected;
      } else {
        // 너무 빨리 변하면 이전 상태 유지
        return analysisRef.current.currentFaceState;
      }
    }
    
    return newDetected;
  };

  // 오디오 분석
  const analyzeAudio = () => {
    if (!audioAnalyser.current || !audioDataArray.current) {
      return {
        currentVolume: 0,
        isSpeaking: false,
        averageVolume: 0
      };
    }
    
    try {
      audioAnalyser.current.getByteFrequencyData(audioDataArray.current);
      
      let sum = 0;
      for (let i = 0; i < audioDataArray.current.length; i++) {
        sum += audioDataArray.current[i] * audioDataArray.current[i];
      }
      const rms = Math.sqrt(sum / audioDataArray.current.length);
      const currentVolume = Math.round((rms / 255) * 100);
      
      analysisRef.current.volumeHistory.push(currentVolume);
      if (analysisRef.current.volumeHistory.length > 30) {
        analysisRef.current.volumeHistory.shift();
      }
      
      const averageVolume = analysisRef.current.volumeHistory.length > 0
        ? analysisRef.current.volumeHistory.reduce((a, b) => a + b, 0) / analysisRef.current.volumeHistory.length
        : 0;
      
      const speakingThreshold = Math.max(8, averageVolume * 0.25);
      const isSpeaking = currentVolume > speakingThreshold;
      
      // 단어 수 추정 (말하기 패턴 기반)
      const currentTime = Date.now();
      if (isSpeaking && !analysisRef.current.isCurrentlySpeaking) {
        if (analysisRef.current.silenceStart) {
          const silenceDuration = currentTime - analysisRef.current.silenceStart;
          if (silenceDuration > 400) { // 400ms 이상 침묵 후 말하기 시작
            // 볼륨에 따른 단어 수 추정
            const wordsToAdd = Math.floor(currentVolume / 25) + Math.floor(Math.random() * 3) + 1;
            analysisRef.current.wordCount += wordsToAdd;
          }
        }
        analysisRef.current.isCurrentlySpeaking = true;
        analysisRef.current.silenceStart = null;
      } else if (!isSpeaking && analysisRef.current.isCurrentlySpeaking) {
        analysisRef.current.isCurrentlySpeaking = false;
        analysisRef.current.silenceStart = currentTime;
      }
      
      return {
        currentVolume: Math.round(currentVolume),
        isSpeaking,
        averageVolume: Math.round(averageVolume)
      };
      
    } catch (error) {
      console.error('오디오 분석 오류:', error);
      return {
        currentVolume: 0,
        isSpeaking: false,
        averageVolume: 0
      };
    }
  };

  // 실시간 분석 루프 (최적화된 업데이트 주기)
  const analysisLoop = useCallback(() => {
    if (!isAnalyzing) {
      return;
    }
    
    try {
      const currentTime = Date.now();
      
      // 오디오는 매 프레임 업데이트 (60fps)
      const audioResult = analyzeAudio();
      
      // 비디오는 느리게 업데이트 (500ms마다)
      let videoResult = null;
      const shouldUpdateVideo = currentTime - analysisRef.current.lastVideoUpdate > 500;
      
      if (shouldUpdateVideo) {
        analysisRef.current.lastVideoUpdate = currentTime;
        const rawVideoResult = detectFaceFromVideo();
        
        // 안정화 처리
        if (rawVideoResult) {
          const stabilizedFaceDetected = getStabilizedFaceDetection(rawVideoResult.faceDetected);
          
          const stabilizedEyeContact = getStabilizedValue(
            analysisRef.current.eyeContactBuffer, 
            rawVideoResult.eyeContact, 
            12
          );
          
          const stabilizedSmile = getStabilizedValue(
            analysisRef.current.smileBuffer, 
            rawVideoResult.smile, 
            15
          );
          
          videoResult = {
            faceDetected: stabilizedFaceDetected,
            eyeContact: Math.round(stabilizedEyeContact),
            smile: Math.round(stabilizedSmile),
            headPoseStable: rawVideoResult.headPoseStable
          };
        }
      }
      
      // 점수 업데이트 (1초마다)
      const shouldUpdateScores = currentTime - analysisRef.current.lastScoreUpdate > 1000;
      
      const elapsed = analysisRef.current.startTime 
        ? (currentTime - analysisRef.current.startTime) / 1000 
        : 0;
      
      if (audioResult.isSpeaking) {
        analysisRef.current.speakingTimeTotal += 0.1;
      }
      
      analysisRef.current.totalFrames += 1;
      
      if (videoResult) {
        if (videoResult.faceDetected) {
          analysisRef.current.faceDetectionCount += 1;
        }
        
        if (videoResult.eyeContact > 50) {
          analysisRef.current.eyeContactFrames += 1;
        }
        
        if (videoResult.smile > 25) {
          analysisRef.current.smileFrames += 1;
        }
      }
      
      const wordsPerMinute = elapsed > 0 && analysisRef.current.wordCount > 0
        ? Math.round((analysisRef.current.wordCount / elapsed) * 60)
        : 0;
      
      if (shouldUpdateScores) {
        analysisRef.current.lastScoreUpdate = currentTime;
        
        setAnalysisData(prev => ({
          audio: {
            ...prev.audio,
            currentVolume: audioResult.currentVolume,
            averageVolume: audioResult.averageVolume,
            speakingTime: Math.round(analysisRef.current.speakingTimeTotal),
            wordsPerMinute: Math.min(wordsPerMinute, 250),
            fillerWordsCount: Math.floor(analysisRef.current.wordCount * 0.05) // 5% 정도가 습관어
          },
          video: {
            ...prev.video,
            faceDetected: videoResult ? videoResult.faceDetected : prev.video.faceDetected,
            eyeContactPercentage: analysisRef.current.totalFrames > 0
              ? Math.round((analysisRef.current.eyeContactFrames / analysisRef.current.totalFrames) * 100)
              : prev.video.eyeContactPercentage,
            smileDetection: videoResult ? videoResult.smile : prev.video.smileDetection,
            postureScore: videoResult ? (videoResult.headPoseStable ? 
              Math.min(prev.video.postureScore + 0.5, 85) :
              Math.max(prev.video.postureScore - 0.5, 45)) : prev.video.postureScore,
            faceDetectionRate: analysisRef.current.totalFrames > 0
              ? Math.round((analysisRef.current.faceDetectionCount / analysisRef.current.totalFrames) * 100)
              : prev.video.faceDetectionRate
          }
        }));
      } else {
        // 빠른 업데이트 (오디오만)
        setAnalysisData(prev => ({
          ...prev,
          audio: {
            ...prev.audio,
            currentVolume: audioResult.currentVolume
          },
          video: videoResult ? {
            ...prev.video,
            faceDetected: videoResult.faceDetected
          } : prev.video
        }));
      }
      
      // 다음 프레임 예약
      animationFrameRef.current = requestAnimationFrame(analysisLoop);
      
    } catch (error) {
      console.error('분석 루프 오류:', error);
      animationFrameRef.current = requestAnimationFrame(analysisLoop);
    }
  }, [isAnalyzing, detectFaceFromVideo]);

  // 분석 시작
  const startAnalysis = useCallback(async () => {
    if (!mediaStream) {
      console.warn('⚠️ 미디어 스트림이 없어서 분석을 시작할 수 없습니다');
      return false;
    }
    
    if (isAnalyzing) {
      console.log('✅ 실시간 분석이 이미 실행 중입니다');
      return true;
    }
    
    try {
      console.log('📊 실시간 분석 시작 (안정화된 시뮬레이션 모드)');
      
      // 오디오 분석 설정
      const audioSetup = await setupAudioAnalysis(mediaStream);
      
      if (!audioSetup) {
        console.warn('⚠️ 오디오 분석 설정 실패');
      }
      
      // 분석 데이터 초기화
      analysisRef.current = {
        startTime: Date.now(),
        audioData: [],
        videoData: [],
        speakingTimeTotal: 0,
        faceDetectionCount: 0,
        totalFrames: 0,
        eyeContactFrames: 0,
        smileFrames: 0,
        volumeHistory: [],
        lastScoreUpdate: 0,
        lastVideoUpdate: 0,
        lastTipUpdate: 0,
        wordCount: 0,
        silenceStart: null,
        isCurrentlySpeaking: false,
        faceDetectionBuffer: [],
        eyeContactBuffer: [],
        smileBuffer: [],
        stableFaceFrameCount: 0,
        noFaceFrameCount: 0,
        currentFaceState: false,
        lastFaceStateChange: 0
      };
      
      setIsAnalyzing(true);
      console.log('✅ 실시간 분석 시작 완료');
      return true;
      
    } catch (error) {
      console.error('❌ 실시간 분석 시작 실패:', error);
      return false;
    }
  }, [mediaStream, setupAudioAnalysis]);

  // 분석 중지
  const stopAnalysis = useCallback(() => {
    console.log('⏹️ 실시간 분석 중지...');
    
    setIsAnalyzing(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    console.log('✅ 실시간 분석 중지 완료');
  }, []);

  // isAnalyzing 상태가 true로 변경될 때 분석 루프 시작
  useEffect(() => {
    if (isAnalyzing && !animationFrameRef.current) {
      console.log('🚀 분석 루프 시작...');
      animationFrameRef.current = requestAnimationFrame(analysisLoop);
    }
  }, [isAnalyzing, analysisLoop]);

  // 최종 분석 결과 생성
  const finishAnalysis = useCallback(() => {
    console.log('🏁 최종 분석 결과 생성...');
    
    const endTime = Date.now();
    const duration = analysisRef.current.startTime 
      ? (endTime - analysisRef.current.startTime) / 1000 
      : 0;
    
    let audioScore = 60;
    
    // 오디오 점수 계산 (더 현실적)
    if (analysisData.audio.averageVolume >= 15 && analysisData.audio.averageVolume <= 75) {
      audioScore += 15;
    } else if (analysisData.audio.averageVolume < 10) {
      audioScore -= 10;
    } else if (analysisData.audio.averageVolume > 85) {
      audioScore -= 8;
    }
    
    // WPM 점수
    const wpm = analysisData.audio.wordsPerMinute;
    if (wpm >= 120 && wpm <= 180) {
      audioScore += 15;
    } else if (wpm >= 100 && wpm <= 200) {
      audioScore += 8;
    } else if (wpm < 80 || wpm > 220) {
      audioScore -= 10;
    }
    
    // 말하기 시간 점수
    const speakingRatio = duration > 0 ? analysisData.audio.speakingTime / duration : 0;
    if (speakingRatio > 0.4) {
      audioScore += 10;
    } else if (speakingRatio < 0.2) {
      audioScore -= 15;
    }
    
    // 비디오 점수 계산
    let videoScore = 50;
    
    if (analysisData.video.faceDetectionRate > 70) {
      videoScore += 20;
    } else if (analysisData.video.faceDetectionRate > 40) {
      videoScore += 10;
    } else {
      videoScore -= 20;
    }
    
    if (analysisData.video.eyeContactPercentage > 40) {
      videoScore += 15;
    } else if (analysisData.video.eyeContactPercentage > 20) {
      videoScore += 5;
    }
    
    if (analysisData.video.postureScore > 70) {
      videoScore += 10;
    }
    
    audioScore = Math.max(30, Math.min(95, audioScore));
    videoScore = Math.max(30, Math.min(95, videoScore));
    
    const overallScore = Math.round((audioScore + videoScore) / 2);
    
    let grade;
    if (overallScore >= 90) grade = 'A+';
    else if (overallScore >= 85) grade = 'A';
    else if (overallScore >= 80) grade = 'B+';
    else if (overallScore >= 75) grade = 'B';
    else if (overallScore >= 70) grade = 'C+';
    else if (overallScore >= 65) grade = 'C';
    else grade = 'D';
    
    const strengths = [];
    const improvements = [];
    
    // 더 구체적인 분석
    if (analysisData.video.faceDetectionRate > 70) {
      strengths.push('카메라 앞에서 안정적인 자세 유지');
    } else if (analysisData.video.faceDetectionRate < 50) {
      improvements.push('카메라 앞에 정면으로 앉아 얼굴이 잘 보이도록 조정');
    }
    
    if (analysisData.video.eyeContactPercentage > 50) {
      strengths.push('적절한 아이컨택 유지');
    } else if (analysisData.video.eyeContactPercentage < 30) {
      improvements.push('카메라를 더 자주 봐서 아이컨택 개선');
    }
    
    if (analysisData.audio.averageVolume >= 15 && analysisData.audio.averageVolume <= 75) {
      strengths.push('적절한 목소리 크기');
    } else if (analysisData.audio.averageVolume < 15) {
      improvements.push('목소리를 더 크게 하여 명확한 전달');
    } else {
      improvements.push('목소리 톤을 조금 더 부드럽게');
    }
    
    if (wpm >= 120 && wpm <= 180) {
      strengths.push('적절한 말하기 속도 유지');
    } else if (wpm < 100) {
      improvements.push('말하기 속도를 조금 더 빠르게');
    } else if (wpm > 200) {
      improvements.push('말하기 속도를 조금 더 천천히');
    }
    
    if (analysisData.video.smileDetection > 20) {
      strengths.push('밝은 표정과 미소');
    } else {
      improvements.push('더 밝은 표정으로 긍정적인 인상 전달');
    }
    
    if (speakingRatio > 0.4) {
      strengths.push('충분한 답변 시간 활용');
    } else if (speakingRatio < 0.3) {
      improvements.push('답변을 더 자세히 설명해보세요');
    }
    
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
          averageVolume: analysisData.audio.averageVolume,
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
      timestamp: endTime,
      analysisMethod: 'Enhanced Simulation' // 향상된 시뮬레이션 표시
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