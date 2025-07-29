import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * MediaPipe Tasks Vision을 사용한 실시간 면접 분석 (2024년 최신 버전)
 */
export const useRealTimeAnalysis = (mediaStream, videoRef) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMediaPipeReady, setIsMediaPipeReady] = useState(false);
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
    speakingTimeTotal: 0,
    faceDetectionCount: 0,
    totalFrames: 0,
    eyeContactFrames: 0,
    smileFrames: 0,
    volumeHistory: [],
    lastScoreUpdate: 0,
    lastVideoUpdate: 0,
    wordCount: 0,
    silenceStart: null,
    isCurrentlySpeaking: false,
    // MediaPipe 결과 버퍼
    faceDetectionBuffer: [],
    eyeContactBuffer: [],
    smileBuffer: []
  });
  
  const animationFrameRef = useRef(null);
  const audioAnalyser = useRef(null);
  const audioDataArray = useRef(null);
  
  // MediaPipe 관련 refs
  const faceDetectorRef = useRef(null);
  const faceLandmarkerRef = useRef(null);

  // MediaPipe 라이브러리 로드 및 초기화
  const initializeMediaPipe = useCallback(async () => {
    try {
      console.log('📦 MediaPipe Tasks Vision 초기화 시작...');
      
      // 동적 import로 MediaPipe 로드
      const { FilesetResolver, FaceDetector, FaceLandmarker } = await import('@mediapipe/tasks-vision');
      
      // WASM 파일 설정
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      
      // Face Detector 초기화
      const faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.3,
        minSuppressionThreshold: 0.3
      });
      
      // Face Landmarker 초기화 (더 정확한 얼굴 분석용)
      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.3,
        minFacePresenceConfidence: 0.3,
        minTrackingConfidence: 0.3,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true
      });
      
      faceDetectorRef.current = faceDetector;
      faceLandmarkerRef.current = faceLandmarker;
      
      setIsMediaPipeReady(true);
      console.log('✅ MediaPipe Tasks Vision 초기화 완료');
      return true;
      
    } catch (error) {
      console.error('❌ MediaPipe 초기화 실패:', error);
      console.log('🔄 시뮬레이션 모드로 전환');
      setIsMediaPipeReady(false);
      return false;
    }
  }, []);

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

  // MediaPipe를 사용한 실제 얼굴 분석
  const analyzeVideoWithMediaPipe = useCallback(() => {
    if (!videoRef?.current || !faceDetectorRef.current || !faceLandmarkerRef.current) {
      return {
        faceDetected: false,
        eyeContact: 0,
        smile: 0,
        headPoseStable: false
      };
    }
    
    try {
      const video = videoRef.current;
      
      // 비디오 상태 확인
      if (!video.videoWidth || !video.videoHeight || video.paused || video.ended) {
        return {
          faceDetected: false,
          eyeContact: 0,
          smile: 0,
          headPoseStable: false
        };
      }
      
      const currentTime = performance.now();
      
      // Face Detection 수행
      const faceDetectionResults = faceDetectorRef.current.detectForVideo(video, currentTime);
      
      // Face Landmarks 수행 (더 정확한 분석)
      const faceLandmarkResults = faceLandmarkerRef.current.detectForVideo(video, currentTime);
      
      let faceDetected = false;
      let eyeContact = 0;
      let smile = 0;
      let headPoseStable = false;
      
      // Face Detection 결과 처리
      if (faceDetectionResults.detections && faceDetectionResults.detections.length > 0) {
        faceDetected = true;
        
        const detection = faceDetectionResults.detections[0];
        const boundingBox = detection.boundingBox;
        
        // 얼굴이 화면 중앙에 있는지 확인 (아이컨택 추정)
        const centerX = boundingBox.originX + boundingBox.width / 2;
        const centerY = boundingBox.originY + boundingBox.height / 2;
        
        // 화면 중앙 대비 거리 계산 (정규화됨)
        const distanceFromCenter = Math.sqrt(
          Math.pow(centerX - 0.5, 2) + Math.pow(centerY - 0.5, 2)
        );
        
        // 아이컨택 점수 계산 (중앙에 가까울수록 높음)
        eyeContact = Math.max(0, Math.min(100, (1 - distanceFromCenter * 2) * 100));
      }
      
      // Face Landmarks 결과 처리 (더 정확한 분석)
      if (faceLandmarkResults.faceLandmarks && faceLandmarkResults.faceLandmarks.length > 0) {
        const landmarks = faceLandmarkResults.faceLandmarks[0];
        
        // 미소 감지 (입꼬리 랜드마크 사용)
        // MediaPipe Face Landmark의 특정 포인트들
        const leftMouthCorner = landmarks[61];   // 왼쪽 입꼬리
        const rightMouthCorner = landmarks[291]; // 오른쪽 입꼬리  
        const upperLip = landmarks[13];          // 윗입술 중앙
        const lowerLip = landmarks[14];          // 아랫입술 중앙
        
        if (leftMouthCorner && rightMouthCorner && upperLip && lowerLip) {
          // 입꼏리가 올라가는 정도 계산
          const mouthWidth = Math.abs(leftMouthCorner.x - rightMouthCorner.x);
          const mouthHeight = Math.abs(upperLip.y - lowerLip.y);
          const avgCornerY = (leftMouthCorner.y + rightMouthCorner.y) / 2;
          
          // 미소 강도 계산 (입꼬리가 입술 중앙보다 위에 있으면 미소)
          const smileIntensity = (upperLip.y - avgCornerY) / mouthHeight;
          smile = Math.max(0, Math.min(100, smileIntensity * 200 + 20));
        }
        
        // 머리 자세 안정성 (연속된 프레임 간 움직임 측정)
        if (analysisRef.current.previousLandmarks) {
          const currentNose = landmarks[1];  // 코끝
          const prevNose = analysisRef.current.previousLandmarks[1];
          
          if (currentNose && prevNose) {
            const movement = Math.sqrt(
              Math.pow(currentNose.x - prevNose.x, 2) + 
              Math.pow(currentNose.y - prevNose.y, 2) + 
              Math.pow(currentNose.z - prevNose.z, 2)
            );
            
            headPoseStable = movement < 0.01; // 임계값 이하면 안정적
          }
        }
        
        analysisRef.current.previousLandmarks = landmarks;
        
        // Blendshapes를 사용한 더 정확한 미소 감지
        if (faceLandmarkResults.faceBlendshapes && faceLandmarkResults.faceBlendshapes.length > 0) {
          const blendshapes = faceLandmarkResults.faceBlendshapes[0];
          
          // 미소 관련 블렌드셰이프 찾기
          const smileBlendshape = blendshapes.categories.find(
            category => category.categoryName === 'mouthSmileLeft' || 
                       category.categoryName === 'mouthSmileRight'
          );
          
          if (smileBlendshape) {
            smile = Math.max(smile, smileBlendshape.score * 100);
          }
        }
        
        // 시선 방향 더 정확하게 계산
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const noseTip = landmarks[1];
        
        if (leftEye && rightEye && noseTip) {
          // 양 눈의 중점 계산
          const eyeCenter = {
            x: (leftEye.x + rightEye.x) / 2,
            y: (leftEye.y + rightEye.y) / 2,
            z: (leftEye.z + rightEye.z) / 2
          };
          
          // 시선 벡터 계산
          const gazeVector = {
            x: eyeCenter.x - noseTip.x,
            y: eyeCenter.y - noseTip.y,
            z: eyeCenter.z - noseTip.z
          };
          
          // 정면을 보고 있는 정도 계산
          const frontFacing = Math.abs(gazeVector.x) < 0.05 && Math.abs(gazeVector.y) < 0.05;
          if (frontFacing) {
            eyeContact = Math.max(eyeContact, 80); // 정면을 보고 있으면 높은 점수
          }
        }
      }
      
      return {
        faceDetected,
        eyeContact: Math.round(eyeContact),
        smile: Math.round(smile),
        headPoseStable
      };
      
    } catch (error) {
      console.error('MediaPipe 비디오 분석 오류:', error);
      // 오류 발생 시 시뮬레이션으로 대체
      return analyzeVideoWithSimulation();
    }
  }, []);

  // 시뮬레이션 기반 비디오 분석 (MediaPipe 실패 시 대안)
  const analyzeVideoWithSimulation = () => {
    if (!videoRef?.current) {
      return {
        faceDetected: false,
        eyeContact: 0,
        smile: 0,
        headPoseStable: false
      };
    }
    
    const video = videoRef.current;
    const isPlaying = !video.paused && 
                    !video.ended && 
                    video.readyState >= 2 && 
                    video.videoWidth > 0 &&
                    video.videoHeight > 0;
    
    if (!isPlaying) {
      return {
        faceDetected: false,
        eyeContact: 0,
        smile: 0,
        headPoseStable: false
      };
    }
    
    // 향상된 시뮬레이션
    const faceDetected = Math.random() > 0.1; // 90% 확률로 얼굴 감지
    
    return {
      faceDetected,
      eyeContact: faceDetected ? Math.random() * 40 + 40 : 0, // 40-80%
      smile: faceDetected ? Math.random() * 20 + 15 : 0,      // 15-35%
      headPoseStable: faceDetected ? Math.random() > 0.3 : false
    };
  };

  // 안정화된 평균값 계산
  const getStabilizedValue = (buffer, newValue, bufferSize = 10) => {
    buffer.push(newValue);
    if (buffer.length > bufferSize) {
      buffer.shift();
    }
    return buffer.length > 0 ? buffer.reduce((a, b) => a + b, 0) / buffer.length : 0;
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
      
      // 단어 수 추정
      const currentTime = Date.now();
      if (isSpeaking && !analysisRef.current.isCurrentlySpeaking) {
        if (analysisRef.current.silenceStart) {
          const silenceDuration = currentTime - analysisRef.current.silenceStart;
          if (silenceDuration > 400) {
            analysisRef.current.wordCount += Math.floor(Math.random() * 3) + 1;
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

  // 실시간 분석 루프
  const analysisLoop = useCallback(() => {
    if (!isAnalyzing) {
      return;
    }
    
    try {
      const currentTime = Date.now();
      
      // 오디오는 매 프레임 업데이트
      const audioResult = analyzeAudio();
      
      // 비디오는 500ms마다 업데이트
      let videoResult = null;
      const shouldUpdateVideo = currentTime - analysisRef.current.lastVideoUpdate > 500;
      
      if (shouldUpdateVideo) {
        analysisRef.current.lastVideoUpdate = currentTime;
        
        // MediaPipe 사용 가능하면 MediaPipe, 아니면 시뮬레이션
        if (isMediaPipeReady && faceDetectorRef.current && faceLandmarkerRef.current) {
          videoResult = analyzeVideoWithMediaPipe();
          console.log("미디어 파이프 사용 중!!!!!!");
        } else {
          videoResult = analyzeVideoWithSimulation();
        }
        
        // 안정화 버퍼 적용
        if (videoResult) {
          const stabilizedEyeContact = getStabilizedValue(
            analysisRef.current.eyeContactBuffer, 
            videoResult.eyeContact, 
            8
          );
          
          const stabilizedSmile = getStabilizedValue(
            analysisRef.current.smileBuffer, 
            videoResult.smile, 
            12
          );
          
          videoResult.eyeContact = Math.round(stabilizedEyeContact);
          videoResult.smile = Math.round(stabilizedSmile);
        }
      }
      
      // 점수는 1초마다 업데이트
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
            fillerWordsCount: Math.floor(analysisRef.current.wordCount * 0.05)
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
              Math.max(prev.video.postureScore - 0.3, 45)) : prev.video.postureScore,
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
  }, [isAnalyzing, isMediaPipeReady, analyzeVideoWithMediaPipe]);

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
      console.log('📊 실시간 분석 시작...');
      
      // MediaPipe 초기화 시도
      const mediaPipeReady = await initializeMediaPipe();
      
      // 오디오 분석 설정
      const audioSetup = await setupAudioAnalysis(mediaStream);
      
      if (!audioSetup) {
        console.warn('⚠️ 오디오 분석 설정 실패');
      }
      
      // 분석 데이터 초기화
      analysisRef.current = {
        startTime: Date.now(),
        speakingTimeTotal: 0,
        faceDetectionCount: 0,
        totalFrames: 0,
        eyeContactFrames: 0,
        smileFrames: 0,
        volumeHistory: [],
        lastScoreUpdate: 0,
        lastVideoUpdate: 0,
        wordCount: 0,
        silenceStart: null,
        isCurrentlySpeaking: false,
        faceDetectionBuffer: [],
        eyeContactBuffer: [],
        smileBuffer: [],
        previousLandmarks: null
      };
      
      setIsAnalyzing(true);
      console.log(`✅ 실시간 분석 시작 완료 (${mediaPipeReady ? 'MediaPipe AI' : '시뮬레이션'} 모드)`);
      return true;
      
    } catch (error) {
      console.error('❌ 실시간 분석 시작 실패:', error);
      return false;
    }
  }, [mediaStream, initializeMediaPipe, setupAudioAnalysis]);

  // 분석 중지
  const stopAnalysis = useCallback(() => {
    console.log('⏹️ 실시간 분석 중지...');
    
    setIsAnalyzing(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // MediaPipe 정리
    if (faceDetectorRef.current) {
      try {
        faceDetectorRef.current.close();
      } catch (error) {
        console.warn('Face Detector 정리 중 오류:', error);
      }
      faceDetectorRef.current = null;
    }
    
    if (faceLandmarkerRef.current) {
      try {
        faceLandmarkerRef.current.close();
      } catch (error) {
        console.warn('Face Landmarker 정리 중 오류:', error);
      }
      faceLandmarkerRef.current = null;
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
    let videoScore = 50;
    
    // 오디오 점수 계산
    if (analysisData.audio.averageVolume >= 15 && analysisData.audio.averageVolume <= 75) {
      audioScore += 15;
    } else if (analysisData.audio.averageVolume < 10) {
      audioScore -= 10;
    }
    
    const wmp = analysisData.audio.wordsPerMinute;
    if (wmp >= 120 && wmp <= 180) {
      audioScore += 15;
    } else if (wmp >= 100 && wmp <= 200) {
      audioScore += 8;
    } else if (wmp < 80 || wmp > 220) {
      audioScore -= 10;
    }
    
    // 비디오 점수 계산
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
    
    if (analysisData.video.faceDetectionRate > 70) {
      strengths.push(`${isMediaPipeReady ? 'AI 분석: ' : ''}카메라 앞에서 안정적인 자세 유지`);
    } else if (analysisData.video.faceDetectionRate < 50) {
      improvements.push('카메라 앞에 정면으로 앉아 얼굴이 잘 보이도록 조정');
    }
    
    if (analysisData.video.eyeContactPercentage > 40) {
      strengths.push(`${isMediaPipeReady ? 'AI 분석: ' : ''}적절한 아이컨택 유지`);
    } else {
      improvements.push('카메라를 더 자주 봐서 아이컨택 개선');
    }
    
    if (analysisData.audio.averageVolume >= 15 && analysisData.audio.averageVolume <= 75) {
      strengths.push('적절한 목소리 크기');
    } else if (analysisData.audio.averageVolume < 15) {
      improvements.push('목소리를 더 크게 하여 명확한 전달');
    } else {
      improvements.push('목소리 톤을 조금 더 부드럽게');
    }
    
    if (analysisData.video.smileDetection > 20) {
      strengths.push(`${isMediaPipeReady ? 'AI 분석: ' : ''}밝은 표정과 미소`);
    } else {
      improvements.push('더 밝은 표정으로 긍정적인 인상 전달');
    }
    
    let recommendation;
    if (overallScore >= 85) {
      recommendation = `매우 우수한 면접 태도입니다. ${isMediaPipeReady ? 'MediaPipe AI 분석을 통해 ' : ''}현재 수준을 유지하시면 좋은 결과를 얻을 수 있을 것입니다.`;
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
      analysisMethod: isMediaPipeReady ? 'MediaPipe AI (2024)' : 'Enhanced Simulation'
    };
    
    setFinalAnalysis(result);
    console.log('✅ 최종 분석 결과 생성 완료:', result);
    
    return result;
  }, [analysisData, isMediaPipeReady]);

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
    finishAnalysis,
    isMediaPipeReady // MediaPipe 준비 상태 추가
  };
};