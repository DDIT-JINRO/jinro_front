import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 개선된 실시간 면접 분석 훅
 * MediaPipe Tasks Vision과 Web Audio API를 사용한 얼굴/음성 분석
 */
export const useRealTimeAnalysis = (mediaStream, videoRef) => {
  // 🎯 상태 관리 (변수명 통일)
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
      faceDetectionRate: 0,
      // 🎯 디버깅 및 상세 정보
      rawEyeContact: 0,
      eyeContactFramesCount: 0,
      totalFramesCount: 0,
      lastFaceDetection: null,
      faceConfidence: 0,
      facePosition: { x: 0, y: 0, width: 0, height: 0 }
    }
  });
  
  const [finalAnalysis, setFinalAnalysis] = useState(null);
  
  // 🎯 분석 데이터 추적 개선
  const analysisRef = useRef({
    startTime: null,
    // 오디오 관련
    lastSpeakingCheck: null,
    totalSpeakingDuration: 0,
    isSpeaking: false,
    volumeHistory: [],
    wordCount: 0,
    silenceStart: null,
    isCurrentlySpeaking: false,
    // 비디오 관련
    faceDetectionCount: 0,
    totalFrames: 0,
    eyeContactFrames: 0,
    smileFrames: 0,
    lastVideoUpdate: 0,
    lastScoreUpdate: 0,
    // MediaPipe 결과 버퍼
    faceDetectionBuffer: [],
    eyeContactBuffer: [],
    eyeContactRawBuffer: [],
    smileBuffer: [],
    // 🎯 얼굴 감지 품질 관리
    faceQualityHistory: [],
    consecutiveGoodFrames: 0,
    consecutiveBadFrames: 0,
    // 디버깅
    debugLogCount: 0,
    performanceMetrics: {
      avgProcessingTime: 0,
      frameProcessingTimes: [],
      errorCount: 0,
      lastError: null
    }
  });
  
  const animationFrameRef = useRef(null);
  const audioAnalyser = useRef(null);
  const audioDataArray = useRef(null);
  
  // MediaPipe 관련 refs
  const faceDetectorRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  
  // 🎯 MediaPipe 초기화 개선 (여러 CDN 시도 및 에러 처리 강화)
  const initializeMediaPipe = useCallback(async () => {
    try {      
      // 1단계: 라이브러리 가용성 체크
      let vision = null;
      let FilesetResolver, FaceDetector, FaceLandmarker;
      
      try {
        // 동적 import 시도
        const mediapipeModule = await import('@mediapipe/tasks-vision');
        FilesetResolver = mediapipeModule.FilesetResolver;
        FaceDetector = mediapipeModule.FaceDetector;
        FaceLandmarker = mediapipeModule.FaceLandmarker;
        
      } catch (importError) {
        console.error('❌ MediaPipe 모듈 import 실패:', importError);
        
        // CDN에서 직접 로드 시도
        try {
          if (!window.MediaPipeVision) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js';
            script.onerror = () => console.error('❌ MediaPipe CDN 로드 실패');
            document.head.appendChild(script);
            
            // 스크립트 로드 대기
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
              setTimeout(reject, 10000); // 10초 타임아웃
            });
          }
          
          FilesetResolver = window.MediaPipeVision.FilesetResolver;
          FaceDetector = window.MediaPipeVision.FaceDetector;
          FaceLandmarker = window.MediaPipeVision.FaceLandmarker;
          
        } catch (cdnError) {
          console.error('❌ CDN 로드도 실패:', cdnError);
          throw new Error('MediaPipe 라이브러리를 로드할 수 없습니다.');
        }
      }
      
      // 2단계: WASM 파일 로드 (여러 CDN 시도)
      const wasmUrls = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        'https://unpkg.com/@mediapipe/tasks-vision@latest/wasm',
        'https://cdn.skypack.dev/@mediapipe/tasks-vision@latest/wasm'
      ];
      
      for (const wasmUrl of wasmUrls) {
        try {          
          // 네트워크 연결 테스트
          const testResponse = await fetch(`${wasmUrl}/vision_wasm_internal.wasm`, { 
            method: 'HEAD',
            mode: 'no-cors' 
          });
          
          vision = await FilesetResolver.forVisionTasks(wasmUrl);
          break;
        } catch (error) {
          console.warn(`⚠️ WASM 로드 실패: ${wasmUrl}`, error);
          continue;
        }
      }
      
      if (!vision) {
        throw new Error('모든 WASM CDN에서 로드 실패');
      }
      
      // 3단계: 모델 파일 URL 확인 및 다운로드
      const modelUrls = {
        faceDetector: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        faceLandmarker: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
      };
      
      // 모델 파일 접근 가능성 체크
      for (const [modelName, modelUrl] of Object.entries(modelUrls)) {
        try {
          const response = await fetch(modelUrl, { method: 'HEAD', mode: 'no-cors' });
        } catch (error) {
          console.warn(`⚠️ 모델 파일 접근 불가: ${modelName}`, error);
        }
      }
      
      // 4단계: Face Detector 초기화 (에러 처리 강화)
      try {
        const faceDetector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelUrls.faceDetector,
            delegate: 'GPU' // GPU 사용 시도, 실패하면 CPU로 fallback
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.3, // 임계값 낮춤
          minSuppressionThreshold: 0.3
        });
        
        faceDetectorRef.current = faceDetector;
        
      } catch (detectorError) {
        console.warn('⚠️ Face Detector GPU 초기화 실패, CPU로 재시도:', detectorError);
        
        try {
          const faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: modelUrls.faceDetector,
              delegate: 'CPU' // CPU로 fallback
            },
            runningMode: 'VIDEO',
            minDetectionConfidence: 0.3,
            minSuppressionThreshold: 0.3
          });
          
          faceDetectorRef.current = faceDetector;
          
        } catch (cpuError) {
          console.error('❌ Face Detector CPU 초기화도 실패:', cpuError);
          throw cpuError;
        }
      }
      
      // 5단계: Face Landmarker 초기화 (선택적)
      try {
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelUrls.faceLandmarker,
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: 0.3,
          minFacePresenceConfidence: 0.3,
          minTrackingConfidence: 0.3,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false // 메모리 절약
        });
        
        faceLandmarkerRef.current = faceLandmarker;
        
      } catch (landmarkerError) {
        console.warn('⚠️ Face Landmarker 초기화 실패 (Face Detector만 사용):', landmarkerError);
        // Face Landmarker가 실패해도 Face Detector는 사용 가능
      }
      
      // 6단계: 최종 상태 설정
      setIsMediaPipeReady(true);
      
      return true;
      
    } catch (error) {
      console.error('❌ MediaPipe 초기화 완전 실패:', error);
      
      // 상세한 에러 정보 로깅
      console.error('📋 에러 상세:', {
        message: error.message,
        stack: error.stack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      
      analysisRef.current.performanceMetrics.errorCount += 1;
      analysisRef.current.performanceMetrics.lastError = error.message;
      
      setIsMediaPipeReady(false);
      return false;
    }
  }, []);

  // 🎯 오디오 분석 설정 개선
  const setupAudioAnalysis = useCallback(async (stream) => {
    try {      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      // 🎯 오디오 설정 최적화
      analyser.fftSize = 2048;        // 1024에서 2048로 증가 (더 정확한 분석)
      analyser.smoothingTimeConstant = 0.85; // 0.9에서 0.85로 조정
      analyser.minDecibels = -100;     // -90에서 -100으로 확장
      analyser.maxDecibels = -10;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyser);
      
      audioAnalyser.current = analyser;
      audioDataArray.current = dataArray;
      
      return true;
      
    } catch (error) {
      console.error('❌ 오디오 분석 설정 실패:', error);
      analysisRef.current.performanceMetrics.errorCount += 1;
      return false;
    }
  }, []);

  // 🎯 향상된 아이컨택 계산 (더 정확한 시선 추적)
  const calculateEyeContact = useCallback((landmarks, boundingBox, videoWidth, videoHeight) => {
    let eyeContactScore = 0;
    let calculationMethod = 'none';
    let confidence = 0;
    
    try {
      // 🎯 방법 1: Face Landmarks를 사용한 정밀 시선 추적 (개선된 버전)
      if (landmarks && landmarks.length > 468) {
        // MediaPipe Face Mesh의 주요 랜드마크 포인트들
        const leftEye = landmarks[33];       // 왼쪽 눈 중심
        const rightEye = landmarks[263];     // 오른쪽 눈 중심  
        const noseTip = landmarks[1];        // 코끝
        const leftEyeInner = landmarks[133]; // 왼쪽 눈 안쪽 모서리
        const rightEyeInner = landmarks[362];// 오른쪽 눈 안쪽 모서리
        const leftEyeOuter = landmarks[226]; // 🔧 수정: 왼쪽 눈 바깥쪽 모서리
        const rightEyeOuter = landmarks[446];// 🔧 수정: 오른쪽 눈 바깥쪽 모서리
        const forehead = landmarks[9];       // 이마 중앙
        const chin = landmarks[175];         // 턱 중앙

        if (leftEye && rightEye && noseTip && forehead && chin && 
            leftEyeInner && rightEyeInner && leftEyeOuter && rightEyeOuter) {
          
          // 🎯 방법 1A: 기본 시선 벡터 계산
          const eyeCenter = {
            x: (leftEye.x + rightEye.x) / 2,
            y: (leftEye.y + rightEye.y) / 2,
            z: (leftEye.z + rightEye.z) / 2
          };
          
          // 🎯 방법 1B: 눈의 형태를 고려한 시선 방향 계산 (새로 추가)
          const leftEyeVector = {
            x: leftEyeOuter.x - leftEyeInner.x,
            y: leftEyeOuter.y - leftEyeInner.y,
            z: leftEyeOuter.z - leftEyeInner.z
          };
          
          const rightEyeVector = {
            x: rightEyeOuter.x - rightEyeInner.x,
            y: rightEyeOuter.y - rightEyeInner.y,
            z: rightEyeOuter.z - rightEyeInner.z
          };
          
          // 평균 눈 방향 벡터
          const avgEyeDirection = {
            x: (leftEyeVector.x + rightEyeVector.x) / 2,
            y: (leftEyeVector.y + rightEyeVector.y) / 2,
            z: (leftEyeVector.z + rightEyeVector.z) / 2
          };
          
          // 🎯 눈꺼풀 개폐도 확인 (눈을 뜨고 있는지)
          const leftEyeOpenness = Math.abs(landmarks[159].y - landmarks[145].y); // 왼쪽 눈 위아래
          const rightEyeOpenness = Math.abs(landmarks[386].y - landmarks[374].y); // 오른쪽 눈 위아래
          const avgEyeOpenness = (leftEyeOpenness + rightEyeOpenness) / 2;
          const eyeOpennessScore = Math.min(1.0, avgEyeOpenness * 20); // 눈 뜸 정도 (0-1)
          
          // 🎯 개선된 시선 벡터 계산 (눈의 형태 + 코 방향 조합)
          const basicGazeVector = {
            x: eyeCenter.x - noseTip.x,
            y: eyeCenter.y - noseTip.y,
            z: eyeCenter.z - noseTip.z
          };
          
          // 눈의 방향과 기본 시선을 가중 평균
          const enhancedGazeVector = {
            x: basicGazeVector.x * 0.7 + avgEyeDirection.x * 0.3,
            y: basicGazeVector.y * 0.7 + avgEyeDirection.y * 0.3,
            z: basicGazeVector.z * 0.7 + avgEyeDirection.z * 0.3
          };
          
          // 얼굴 중심 계산
          const faceCenter = {
            x: (forehead.x + chin.x) / 2,
            y: (forehead.y + chin.y) / 2,
            z: (forehead.z + chin.z) / 2
          };
          
          // 🎯 머리 기울기 보정
          const headTilt = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
          const tiltCompensation = Math.abs(headTilt) < 0.2 ? 1.0 : 0.8;
          
          // 🎯 화면 중앙을 향하는 이상적인 벡터 (카메라 방향)
          const cameraVector = { x: 0, y: 0, z: -1 };
          
          // 정규화
          const gazeLength = Math.sqrt(
            enhancedGazeVector.x ** 2 + enhancedGazeVector.y ** 2 + enhancedGazeVector.z ** 2
          );
          
          if (gazeLength > 0) {
            const normalizedGaze = {
              x: enhancedGazeVector.x / gazeLength,
              y: enhancedGazeVector.y / gazeLength,
              z: enhancedGazeVector.z / gazeLength
            };
            
            // 🎯 각도 계산
            const dotProduct = normalizedGaze.x * cameraVector.x + 
                            normalizedGaze.y * cameraVector.y + 
                            normalizedGaze.z * cameraVector.z;
            
            const angle = Math.acos(Math.max(-1, Math.min(1, Math.abs(dotProduct)))) * (180 / Math.PI);
            
            // 🎯 거리 기반 보정
            const faceDistanceFromCenter = Math.sqrt(
              Math.pow(faceCenter.x - 0.5, 2) + Math.pow(faceCenter.y - 0.5, 2)
            );
            const centerBonus = faceDistanceFromCenter < 0.15 ? 5 : 0;
            
            // 🎯 점수 계산 (더 세밀한 등급 구분)
            const deviation = Math.abs(angle - 50); // 50에서의 편차

            if (deviation <= 2) { // 48-52도 - 완벽한 아이컨택
              eyeContactScore = 98 + centerBonus;
            } else if (deviation <= 5) { // 45-55도 - 매우 우수
              eyeContactScore = 90 + (5 - deviation) * 1.6 + centerBonus;
            } else if (deviation <= 10) { // 40-60도 - 우수한 아이컨택
              eyeContactScore = 80 + (10 - deviation) * 2 + centerBonus;
            } else if (deviation <= 18) { // 32-68도 - 좋은 아이컨택
              eyeContactScore = 65 + (18 - deviation) * 1.875;
            } else if (deviation <= 30) { // 20-80도 - 보통 아이컨택
              eyeContactScore = 45 + (30 - deviation) * 1.67;
            } else if (deviation <= 45) { // 5-95도 - 부족한 아이컨택
              eyeContactScore = 20 + (45 - deviation) * 1.67;
            } else { // 5도 미만 또는 95도 초과 - 매우 부족
              eyeContactScore = Math.max(0, 20 - (deviation - 45) * 0.5);
            }
            
            // 🎯 눈 뜸 정도와 머리 기울기 보정 적용
            eyeContactScore *= eyeOpennessScore; // 눈을 감고 있으면 점수 하락
            eyeContactScore *= tiltCompensation;
            
            confidence = 0.95; // 개선된 랜드마크 기반이므로 매우 높은 신뢰도
            calculationMethod = 'landmarks_enhanced_v2';

          }
        }
      }
      
      // 🎯 방법 2: Bounding Box 기반 계산 (개선된 fallback)
      if (eyeContactScore === 0 && boundingBox && videoWidth && videoHeight) {
        const faceCenter = {
          x: boundingBox.originX + boundingBox.width / 2,
          y: boundingBox.originY + boundingBox.height / 2
        };
        
        // 🎯 얼굴 크기 기반 거리 추정
        const faceSize = Math.sqrt(boundingBox.width * boundingBox.height);
        const optimalSize = 0.25; // 화면의 25%가 이상적
        const sizeRatio = faceSize / optimalSize;
        
        // 거리 보정 계수
        let distanceCorrection = 1.0;
        if (sizeRatio < 0.6) { // 너무 멀음
          distanceCorrection = 0.7;
        } else if (sizeRatio > 1.8) { // 너무 가까움
          distanceCorrection = 0.8;
        }
        
        // 화면 중앙과의 거리
        const distanceFromCenter = Math.sqrt(
          Math.pow(faceCenter.x - 0.5, 2) + Math.pow(faceCenter.y - 0.5, 2)
        );
        
        // 🎯 점수 계산 (거리 기반)
        if (distanceFromCenter <= 0.08) { // 매우 중앙
          eyeContactScore = 75 * distanceCorrection; // 랜드마크보다 낮은 최대 점수
        } else if (distanceFromCenter <= 0.15) { // 중앙 근처
          eyeContactScore = (65 + (0.15 - distanceFromCenter) * 100) * distanceCorrection;
        } else if (distanceFromCenter <= 0.25) { // 중앙에서 벗어남
          eyeContactScore = (45 + (0.25 - distanceFromCenter) * 200) * distanceCorrection;
        } else if (distanceFromCenter <= 0.4) { // 많이 벗어남
          eyeContactScore = (20 + (0.4 - distanceFromCenter) * 167) * distanceCorrection;
        } else { // 매우 벗어남
          eyeContactScore = Math.max(5, 20 - (distanceFromCenter - 0.4) * 50);
        }
        
        confidence = 0.5; // 바운딩박스 기반이므로 중간 신뢰도
        calculationMethod = 'boundingbox_enhanced';

      }
      
    } catch (error) {
      console.error('❌ 아이컨택 계산 오류:', error);
      analysisRef.current.performanceMetrics.errorCount += 1;
      eyeContactScore = 0;
      calculationMethod = 'error';
      confidence = 0;
    }
    
    return {
      score: Math.max(0, Math.min(100, Math.round(eyeContactScore))),
      method: calculationMethod,
      confidence: confidence
    };
  }, []);

  // 🎯 MediaPipe를 사용한 실제 얼굴 분석 (성능 최적화)
  const analyzeVideoWithMediaPipe = useCallback(() => {
    if (!videoRef?.current || !faceDetectorRef.current || !faceLandmarkerRef.current) {
      return {
        faceDetected: false,
        eyeContact: 0,
        smile: 0,
        headPoseStable: false,
        eyeContactMethod: 'no_mediapipe',
        faceConfidence: 0,
        facePosition: { x: 0, y: 0, width: 0, height: 0 }
      };
    }
    
    const processingStartTime = performance.now();
    
    try {
      const video = videoRef.current;
      
      // 🎯 비디오 상태 확인 강화
      if (!video.videoWidth || !video.videoHeight || video.paused || video.ended || video.readyState < 2) {
        return {
          faceDetected: false,
          eyeContact: 0,
          smile: 0,
          headPoseStable: false,
          eyeContactMethod: 'video_not_ready',
          faceConfidence: 0,
          facePosition: { x: 0, y: 0, width: 0, height: 0 }
        };
      }
      
      const currentTime = performance.now();
      
      // 🎯 Face Detection 수행
      let faceDetectionResults;
      let faceLandmarkResults;
      
      try {
        faceDetectionResults = faceDetectorRef.current.detectForVideo(video, currentTime);
      } catch (error) {
        console.error('Face Detection 실행 오류:', error);
        throw error;
      }
      
      try {
        faceLandmarkResults = faceLandmarkerRef.current.detectForVideo(video, currentTime);
      } catch (error) {
        console.error('Face Landmarks 실행 오류:', error);
        // Landmarks 실패해도 Detection은 사용 가능
        faceLandmarkResults = { faceLandmarks: [], faceBlendshapes: [] };
      }
      
      let faceDetected = false;
      let eyeContactResult = { score: 0, method: 'no_face', confidence: 0 };
      let smile = 0;
      let headPoseStable = false;
      let faceConfidence = 0;
      let facePosition = { x: 0, y: 0, width: 0, height: 0 };
      
      // 🎯 Face Detection 결과 처리
      if (faceDetectionResults.detections && faceDetectionResults.detections.length > 0) {
        const detection = faceDetectionResults.detections[0];
        const boundingBox = detection.boundingBox;
        
        faceDetected = true;
        faceConfidence = detection.categories?.[0]?.score || 0.8;
        
        // 정규화된 좌표를 픽셀 좌표로 변환
        facePosition = {
          x: boundingBox.originX * video.videoWidth,
          y: boundingBox.originY * video.videoHeight,
          width: boundingBox.width * video.videoWidth,
          height: boundingBox.height * video.videoHeight
        };
        
        // 🎯 Face Landmarks 결과 처리
        if (faceLandmarkResults.faceLandmarks && faceLandmarkResults.faceLandmarks.length > 0) {
          const landmarks = faceLandmarkResults.faceLandmarks[0];
          
          // 🎯 향상된 아이컨택 계산
          eyeContactResult = calculateEyeContact(landmarks, boundingBox, video.videoWidth, video.videoHeight);
          
          // 🎯 미소 감지 (랜드마크 기반)
          const leftMouthCorner = landmarks[61];   // 왼쪽 입꼴
          const rightMouthCorner = landmarks[291]; // 오른쪽 입꼴
          const upperLip = landmarks[13];          // 윗입술 중앙
          const lowerLip = landmarks[14];          // 아랫입술 중앙
          const mouthCenter = landmarks[17];       // 입 중앙
          
          if (leftMouthCorner && rightMouthCorner && upperLip && lowerLip && mouthCenter) {
            const mouthWidth = Math.abs(leftMouthCorner.x - rightMouthCorner.x);
            const mouthHeight = Math.abs(upperLip.y - lowerLip.y);
            const avgCornerY = (leftMouthCorner.y + rightMouthCorner.y) / 2;
            
            // 입꼴이 위로 올라가는 정도 계산
            const smileIntensity = (mouthCenter.y - avgCornerY) / mouthHeight;
            const mouthCurvature = Math.abs(leftMouthCorner.y - rightMouthCorner.y) / mouthWidth;
            
            // 종합 미소 점수
            smile = Math.max(0, Math.min(100, (smileIntensity * 150 + mouthCurvature * 100 + 10)));
          }
          
          // 🎯 머리 자세 안정성 (개선된 계산)
          if (analysisRef.current.previousLandmarks) {
            const currentNose = landmarks[1];  // 코끝
            const prevNose = analysisRef.current.previousLandmarks[1];
            
            if (currentNose && prevNose) {
              const movement = Math.sqrt(
                Math.pow(currentNose.x - prevNose.x, 2) + 
                Math.pow(currentNose.y - prevNose.y, 2) + 
                Math.pow(currentNose.z - prevNose.z, 2)
              );
              
              // 더 엄격한 안정성 기준
              headPoseStable = movement < 0.008; // 0.01에서 0.008로 강화
            }
          }
          
          analysisRef.current.previousLandmarks = landmarks;
          
          // 🎯 Blendshapes를 사용한 더 정확한 미소 감지
          if (faceLandmarkResults.faceBlendshapes && faceLandmarkResults.faceBlendshapes.length > 0) {
            const blendshapes = faceLandmarkResults.faceBlendshapes[0];
            
            const smileCategories = ['mouthSmileLeft', 'mouthSmileRight', 'mouthUpperUpLeft', 'mouthUpperUpRight'];
            let blendshapeSmile = 0;
            let foundCategories = 0;
            
            smileCategories.forEach(categoryName => {
              const category = blendshapes.categories.find(cat => cat.categoryName === categoryName);
              if (category) {
                blendshapeSmile += category.score;
                foundCategories++;
              }
            });
            
            if (foundCategories > 0) {
              const avgBlendshapeSmile = (blendshapeSmile / foundCategories) * 100;
              // 랜드마크와 블렌드셰이프 결과를 가중 평균
              smile = Math.round((smile * 0.6 + avgBlendshapeSmile * 0.4));
            }
          }
        } else {
          // Face Landmarks가 없으면 기본 아이컨택 계산만
          eyeContactResult = calculateEyeContact(null, boundingBox, video.videoWidth, video.videoHeight);
        }
        
        // 🎯 성능 메트릭 업데이트
        const processingTime = performance.now() - processingStartTime;
        analysisRef.current.performanceMetrics.frameProcessingTimes.push(processingTime);
        if (analysisRef.current.performanceMetrics.frameProcessingTimes.length > 60) {
          analysisRef.current.performanceMetrics.frameProcessingTimes.shift();
        }
        
        const avgProcessingTime = analysisRef.current.performanceMetrics.frameProcessingTimes.reduce((a, b) => a + b, 0) / 
                                 analysisRef.current.performanceMetrics.frameProcessingTimes.length;
        analysisRef.current.performanceMetrics.avgProcessingTime = avgProcessingTime;
      }
      
      return {
        faceDetected,
        eyeContact: eyeContactResult.score,
        smile: Math.round(smile),
        headPoseStable,
        eyeContactMethod: eyeContactResult.method,
        eyeContactConfidence: eyeContactResult.confidence,
        faceConfidence: Math.round(faceConfidence * 100),
        facePosition
      };
      
    } catch (error) {
      console.error('MediaPipe 비디오 분석 오류:', error);
      analysisRef.current.performanceMetrics.errorCount += 1;
      analysisRef.current.performanceMetrics.lastError = error.message;
      
      // 오류 발생 시 시뮬레이션으로 대체
      return analyzeVideoWithSimulation();
    }
  }, [calculateEyeContact]);

  // 🎯 향상된 시뮬레이션 (더 현실적인 패턴)
  const analyzeVideoWithSimulation = useCallback(() => {
    if (!videoRef?.current) {
      return {
        faceDetected: false,
        eyeContact: 0,
        smile: 0,
        headPoseStable: false,
        eyeContactMethod: 'no_video',
        faceConfidence: 0,
        facePosition: { x: 0, y: 0, width: 0, height: 0 }
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
        headPoseStable: false,
        eyeContactMethod: 'video_not_playing',
        faceConfidence: 0,
        facePosition: { x: 0, y: 0, width: 0, height: 0 }
      };
    }
    
    // 🎯 더 현실적인 시뮬레이션 패턴
    const elapsedTime = Date.now() - (analysisRef.current.startTime || Date.now());
    const timeInSeconds = elapsedTime / 1000;
    
    // 얼굴 감지 (95% 확률로 감지)
    const faceDetected = Math.random() > 0.05;
    
    if (!faceDetected) {
      return {
        faceDetected: false,
        eyeContact: 0,
        smile: 0,
        headPoseStable: false,
        eyeContactMethod: 'simulation_no_face',
        faceConfidence: 0,
        facePosition: { x: 0, y: 0, width: 0, height: 0 }
      };
    }
    
    // 🎯 자연스러운 아이컨택 패턴 (실제 면접과 유사)
    const basePattern = Math.sin(timeInSeconds * 0.05) * 0.3; // 천천히 변화하는 기본 패턴
    const shortVariation = Math.sin(timeInSeconds * 0.8) * 0.15; // 빠른 변화
    const randomNoise = (Math.random() - 0.5) * 0.2; // 무작위 변화
    
    let eyeContactBase = 55 + basePattern * 25 + shortVariation * 15 + randomNoise * 10;
    
    // 시간에 따른 아이컨택 트렌드 (면접이 진행될수록 더 안정적)
    if (timeInSeconds > 30) {
      eyeContactBase += Math.min(15, (timeInSeconds - 30) * 0.2); // 점진적 향상
    }
    
    const eyeContact = Math.max(15, Math.min(90, eyeContactBase));
    
    // 🎯 자연스러운 미소 패턴
    const smileBase = 25 + Math.sin(timeInSeconds * 0.1) * 10;
    const smileVariation = Math.random() * 15;
    const smile = Math.max(10, Math.min(60, smileBase + smileVariation));
    
    // 시뮬레이션된 얼굴 위치
    const centerX = video.videoWidth * 0.5;
    const centerY = video.videoHeight * 0.3;
    const faceWidth = video.videoWidth * (0.25 + Math.random() * 0.1);
    const faceHeight = video.videoHeight * (0.35 + Math.random() * 0.1);
    
    const facePosition = {
      x: centerX - faceWidth / 2 + (Math.random() - 0.5) * video.videoWidth * 0.1,
      y: centerY - faceHeight / 2 + (Math.random() - 0.5) * video.videoHeight * 0.05,
      width: faceWidth,
      height: faceHeight
    };
    
    return {
      faceDetected: true,
      eyeContact: Math.round(eyeContact),
      smile: Math.round(smile),
      headPoseStable: Math.random() > 0.25,
      eyeContactMethod: 'simulation_enhanced_realistic',
      faceConfidence: Math.round(85 + Math.random() * 10),
      facePosition
    };
  }, []);

  // 🎯 개선된 오디오 분석 (정확한 시간 계산)
  const analyzeAudio = useCallback(() => {
    if (!audioAnalyser.current || !audioDataArray.current) {
      return {
        currentVolume: 0,
        isSpeaking: false,
        averageVolume: 0
      };
    }
    
    try {
      audioAnalyser.current.getByteFrequencyData(audioDataArray.current);
      
      // 🎯 RMS 기반 볼륨 계산 (더 정확)
      let sumSquares = 0;
      let maxValue = 0;
      for (let i = 0; i < audioDataArray.current.length; i++) {
        const value = audioDataArray.current[i];
        sumSquares += value * value;
        maxValue = Math.max(maxValue, value);
      }
      
      const rms = Math.sqrt(sumSquares / audioDataArray.current.length);
      const currentVolume = Math.round((rms / 255) * 100);
      
      // 볼륨 히스토리 관리
      analysisRef.current.volumeHistory.push(currentVolume);
      if (analysisRef.current.volumeHistory.length > 50) { // 5초간의 데이터 (100ms * 50)
        analysisRef.current.volumeHistory.shift();
      }
      
      const averageVolume = analysisRef.current.volumeHistory.length > 0
        ? analysisRef.current.volumeHistory.reduce((a, b) => a + b, 0) / analysisRef.current.volumeHistory.length
        : 0;
      
      // 🎯 적응형 임계값 (주변 소음 고려)
      const noiseFloor = Math.min(...analysisRef.current.volumeHistory.slice(-20)); // 최근 2초간 최소값
      const speakingThreshold = Math.max(12, noiseFloor + 8, averageVolume * 0.3);
      const isSpeaking = currentVolume > speakingThreshold;
      
      // 🎯 정확한 말하기 시간 계산
      const currentTime = Date.now();
      
      if (isSpeaking && !analysisRef.current.isSpeaking) {
        // 말하기 시작
        analysisRef.current.isSpeaking = true;
        analysisRef.current.lastSpeakingCheck = currentTime;
      } else if (!isSpeaking && analysisRef.current.isSpeaking) {
        // 말하기 종료
        if (analysisRef.current.lastSpeakingCheck) {
          const speakingDuration = currentTime - analysisRef.current.lastSpeakingCheck;
          analysisRef.current.totalSpeakingDuration += speakingDuration;
        }
        analysisRef.current.isSpeaking = false;
        analysisRef.current.lastSpeakingCheck = null;
      } else if (isSpeaking && analysisRef.current.isSpeaking) {
        // 계속 말하는 중 - 중간 업데이트
        if (analysisRef.current.lastSpeakingCheck) {
          const speakingDuration = currentTime - analysisRef.current.lastSpeakingCheck;
          analysisRef.current.totalSpeakingDuration += speakingDuration;
          analysisRef.current.lastSpeakingCheck = currentTime;
        }
      }
      
      // 단어 수 추정 (개선된 로직)
      if (isSpeaking && !analysisRef.current.isCurrentlySpeaking) {
        if (analysisRef.current.silenceStart) {
          const silenceDuration = currentTime - analysisRef.current.silenceStart;
          // 긴 침묵 후 말하기 시작하면 단어 추가
          if (silenceDuration > 300) {
            const wordsToAdd = Math.floor(Math.random() * 2) + 1; // 1-2 단어
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
        averageVolume: Math.round(averageVolume),
        speakingThreshold: Math.round(speakingThreshold),
        noiseFloor: Math.round(noiseFloor)
      };
      
    } catch (error) {
      console.error('오디오 분석 오류:', error);
      analysisRef.current.performanceMetrics.errorCount += 1;
      return {
        currentVolume: 0,
        isSpeaking: false,
        averageVolume: 0
      };
    }
  }, []);

  // 🎯 아이컨택 데이터 안정화 함수
  const stabilizeEyeContactData = useCallback((newEyeContactValue, rawBuffer, smoothedBuffer) => {
    // 원시 값 버퍼에 추가
    rawBuffer.push(newEyeContactValue);
    if (rawBuffer.length > 15) { // 15프레임 히스토리
      rawBuffer.shift();
    }
    
    // 이상값 제거 (median filter)
    const sortedValues = [...rawBuffer].sort((a, b) => a - b);
    const median = sortedValues[Math.floor(sortedValues.length / 2)];
    
    // 이동 평균 계산 (최근 8개 값)
    const recentValues = rawBuffer.slice(-8);
    const movingAverage = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    
    // 중앙값과 이동평균의 가중 평균
    const stabilizedValue = Math.round(median * 0.4 + movingAverage * 0.6);
    
    // 안정화된 값 버퍼에 추가
    smoothedBuffer.push(stabilizedValue);
    if (smoothedBuffer.length > 10) {
      smoothedBuffer.shift();
    }
    
    return stabilizedValue;
  }, []);

  // 🎯 개선된 실시간 분석 루프
  const analysisLoop = useCallback(() => {
    if (!isAnalyzing) return;
    
    try {
      const currentTime = Date.now();
      
      // 오디오는 매 프레임 업데이트 (60fps)
      const audioResult = analyzeAudio();
      
      // 🎯 최근 비디오 결과를 저장할 ref 추가 (analysisRef.current에)
      // 이미 있다면 생략하고, 없다면 초기화 부분에 추가:
      // analysisRef.current.lastVideoResult = null;
      
      // 비디오는 200ms마다 업데이트 (5fps) - 성능 최적화
      let videoResult = null;
      const shouldUpdateVideo = currentTime - analysisRef.current.lastVideoUpdate > 200;
      
      if (shouldUpdateVideo) {
        analysisRef.current.lastVideoUpdate = currentTime;
        
        // MediaPipe 사용 가능하면 MediaPipe, 아니면 시뮬레이션
        if (isMediaPipeReady && faceDetectorRef.current && faceLandmarkerRef.current) {
          videoResult = analyzeVideoWithMediaPipe();
        } else {
          videoResult = analyzeVideoWithSimulation();
        }
        
        // 🚨 최근 비디오 결과를 저장 (상태 업데이트에서 사용)
        if (videoResult) {
          analysisRef.current.lastVideoResult = videoResult;
          
          // 아이컨택 데이터 안정화
          if (videoResult.eyeContact !== undefined) {
            const stabilizedEyeContact = stabilizeEyeContactData(
              videoResult.eyeContact,
              analysisRef.current.eyeContactRawBuffer,
              analysisRef.current.eyeContactBuffer
            );
            
            videoResult.eyeContactStabilized = stabilizedEyeContact;
            analysisRef.current.lastVideoResult.eyeContactStabilized = stabilizedEyeContact;

          }
        }
      }
      
      // 통계 업데이트
      const elapsed = analysisRef.current.startTime 
        ? (currentTime - analysisRef.current.startTime) / 1000 
        : 0;
      
      analysisRef.current.totalFrames += 1;
      
      // 🚨 최근 비디오 결과 사용 (videoResult가 null이어도 마지막 결과 사용)
      const currentVideoResult = videoResult || analysisRef.current.lastVideoResult;
      
      if (currentVideoResult) {
        if (currentVideoResult.faceDetected) {
          analysisRef.current.faceDetectionCount += 1;
        }
        
        // 아이컨택 프레임 카운팅
        const eyeContactThreshold = 45;
        const eyeContactValue = currentVideoResult.eyeContactStabilized || currentVideoResult.eyeContact;
        
        if (eyeContactValue >= eyeContactThreshold) {
          analysisRef.current.eyeContactFrames += 1;
        }
        
        if (currentVideoResult.smile > 25) {
          analysisRef.current.smileFrames += 1;
        }
      }
      
      // WPM 계산
      const wordsPerMinute = elapsed > 0 && analysisRef.current.wordCount > 0
        ? Math.round((analysisRef.current.wordCount / elapsed) * 60)
        : 0;
      
      // 점수는 1초마다 업데이트
      const shouldUpdateScores = currentTime - analysisRef.current.lastScoreUpdate > 1000;
      
      if (shouldUpdateScores) {
        analysisRef.current.lastScoreUpdate = currentTime;
        
        const totalSpeakingTimeInSeconds = Math.round(analysisRef.current.totalSpeakingDuration / 1000);
        
        // 🚨 최근 비디오 결과 사용 (null 방지)
        const videoResultForUpdate = analysisRef.current.lastVideoResult;
        
        // 아이컨택 퍼센티지 계산
        let eyeContactPercentage = 0;
        
        if (analysisRef.current.totalFrames > 0) {
          eyeContactPercentage = Math.round((analysisRef.current.eyeContactFrames / analysisRef.current.totalFrames) * 100);
        }
        
        // 현재 비디오 결과에서 직접 아이컨택 값 사용
        if (videoResultForUpdate && videoResultForUpdate.eyeContact !== undefined) {
          const currentEyeContact = videoResultForUpdate.eyeContactStabilized || videoResultForUpdate.eyeContact;
          
          // 누적 평균과 현재 값의 가중 평균 사용
          eyeContactPercentage = Math.round(
            eyeContactPercentage * 0.7 + currentEyeContact * 0.3
          );
        }
        
        setAnalysisData(prev => {
          const newData = {
            audio: {
              ...prev.audio,
              currentVolume: audioResult.currentVolume,
              averageVolume: audioResult.averageVolume,
              speakingTime: totalSpeakingTimeInSeconds,
              wordsPerMinute: Math.min(wordsPerMinute, 300),
              fillerWordsCount: Math.floor(analysisRef.current.wordCount * 0.06)
            },
            video: {
              ...prev.video,
              faceDetected: videoResultForUpdate ? videoResultForUpdate.faceDetected : prev.video.faceDetected,
              eyeContactPercentage: eyeContactPercentage, // 🚨 이제 제대로 된 값이 들어감
              smileDetection: videoResultForUpdate ? videoResultForUpdate.smile : prev.video.smileDetection,
              postureScore: videoResultForUpdate ? (videoResultForUpdate.headPoseStable ? 
                Math.min(prev.video.postureScore + 0.3, 90) :
                Math.max(prev.video.postureScore - 0.2, 40)) : prev.video.postureScore,
              faceDetectionRate: analysisRef.current.totalFrames > 0
                ? Math.round((analysisRef.current.faceDetectionCount / analysisRef.current.totalFrames) * 100)
                : prev.video.faceDetectionRate,
              // 디버깅 정보
              rawEyeContact: videoResultForUpdate ? videoResultForUpdate.eyeContact : prev.video.rawEyeContact,
              eyeContactFramesCount: analysisRef.current.eyeContactFrames,
              totalFramesCount: analysisRef.current.totalFrames,
              lastFaceDetection: videoResultForUpdate?.faceDetected ? new Date().toISOString() : prev.video.lastFaceDetection,
              faceConfidence: videoResultForUpdate ? videoResultForUpdate.faceConfidence : prev.video.faceConfidence,
              facePosition: videoResultForUpdate ? videoResultForUpdate.facePosition : prev.video.facePosition
            }
          };
          
          return newData;
        });
        
      } else {
        // 빠른 업데이트 (오디오와 실시간 얼굴 감지)
        const quickVideoResult = videoResult || analysisRef.current.lastVideoResult;
        
        setAnalysisData(prev => ({
          ...prev,
          audio: {
            ...prev.audio,
            currentVolume: audioResult.currentVolume
          },
          video: quickVideoResult ? {
            ...prev.video,
            faceDetected: quickVideoResult.faceDetected,
            rawEyeContact: quickVideoResult.eyeContact,
            faceConfidence: quickVideoResult.faceConfidence,
            facePosition: quickVideoResult.facePosition
          } : prev.video
        }));
      }

      // 다음 프레임 예약
      animationFrameRef.current = requestAnimationFrame(analysisLoop);
      
    } catch (error) {
      console.error('분석 루프 오류:', error);
      analysisRef.current.performanceMetrics.errorCount += 1;
      analysisRef.current.performanceMetrics.lastError = error.message;
      
      // 오류가 발생해도 루프 계속 진행
      animationFrameRef.current = requestAnimationFrame(analysisLoop);
    }
  }, [isAnalyzing, isMediaPipeReady, analyzeAudio, analyzeVideoWithMediaPipe, analyzeVideoWithSimulation, stabilizeEyeContactData]);

  // 🎯 분석 시작 함수
  // useRealTimeAnalysis.js - startAnalysis 함수에 디버깅 로그 추가
  const startAnalysis = useCallback(async () => {    
    if (!mediaStream) {
      console.warn('⚠️ 미디어 스트림이 없어서 분석을 시작할 수 없습니다');
      return false;
    }
    
    if (isAnalyzing) {
      return true;
    }
    
    try {
      // MediaPipe 초기화 시도
      const mediaPipeReady = await initializeMediaPipe();
      
      // 오디오 분석 설정
      const audioSetup = await setupAudioAnalysis(mediaStream);
      
      if (!audioSetup) {
        console.warn('⚠️ 오디오 분석 설정 실패, 계속 진행');
      }
      
      // 분석 데이터 초기화
      analysisRef.current = {
        startTime: Date.now(),
        lastSpeakingCheck: null,
        totalSpeakingDuration: 0,
        isSpeaking: false,
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
        eyeContactRawBuffer: [],
        smileBuffer: [],
        previousLandmarks: null,
        faceQualityHistory: [],
        consecutiveGoodFrames: 0,
        consecutiveBadFrames: 0,
        debugLogCount: 0,
        lastVideoResult: null,
        performanceMetrics: {
          avgProcessingTime: 0,
          frameProcessingTimes: [],
          errorCount: 0,
          lastError: null
        }
      };
      
      setIsAnalyzing(true);
      
      return true;
      
    } catch (error) {
      console.error('❌❌❌ 실시간 분석 시작 실패:', error);
      console.error('❌ 에러 스택:', error.stack);
      analysisRef.current.performanceMetrics.errorCount += 1;
      analysisRef.current.performanceMetrics.lastError = error.message;
      return false;
    }
  }, [mediaStream, initializeMediaPipe, setupAudioAnalysis]);

  // 🎯 분석 중지 함수
  const stopAnalysis = useCallback(() => {    
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
    
    // 🎯 최종 통계 로그
    if (analysisRef.current.startTime) {
      const totalDuration = (Date.now() - analysisRef.current.startTime) / 1000;
      const totalSpeakingTimeInSeconds = Math.round(analysisRef.current.totalSpeakingDuration / 1000);
      const eyeContactRate = analysisRef.current.totalFrames > 0 
        ? (analysisRef.current.eyeContactFrames / analysisRef.current.totalFrames * 100) 
        : 0;
    }
    
  }, []);

  // 🎯 최종 분석 결과 생성
  // 🎯 최종 분석 결과 생성 (Gemini API 연동 버전)
  const finishAnalysis = useCallback(async (additionalData = {}) => {
    const endTime = Date.now();
    const duration = analysisRef.current.startTime 
      ? Math.round((endTime - analysisRef.current.startTime) / 1000)
      : additionalData.interviewData?.totalDuration || 0;
    
    // 🎯 실제 수집된 데이터 추출
    const realTimeData = additionalData.realTimeData || analysisData;
    const interviewData = additionalData.interviewData || {};
    const technicalInfo = additionalData.technicalInfo || {};
    const geminiAnalysis = additionalData.geminiAnalysis; // 🎯 Gemini 분석 결과

    let result;
    
    // 🎯 Gemini 분석 결과가 있으면 우선 사용
    if (geminiAnalysis) {      
      // Gemini 분석 결과를 기본으로 하되, 실시간 데이터도 포함
      result = {
        // Gemini 분석 기본 정보
        overallScore: geminiAnalysis.overallScore,
        grade: geminiAnalysis.grade,
        scores: {
          communication: geminiAnalysis.scores?.communication || 75,
          appearance: geminiAnalysis.scores?.appearance || 75,
          content: geminiAnalysis.scores?.content || 75
        },
        
        // 🎯 Gemini 상세 분석 + 실시간 데이터 통합
        detailed: {
          audio: {
            // Gemini 분석 결과
            speechClarity: geminiAnalysis.detailed?.audio?.speechClarity || 75,
            paceAppropriate: geminiAnalysis.detailed?.audio?.paceAppropriate || 75,
            volumeConsistency: geminiAnalysis.detailed?.audio?.volumeConsistency || 75,
            feedback: geminiAnalysis.detailed?.audio?.feedback || '음성 분석이 완료되었습니다.',
            
            // 실시간 데이터 추가
            averageVolume: Math.round(realTimeData?.audio?.averageVolume || 0),
            speakingTime: realTimeData?.audio?.speakingTime || 0,
            wordsPerMinute: realTimeData?.audio?.wordsPerMinute || 0,
            fillerWords: realTimeData?.audio?.fillerWordsCount || 0,
            speakingRatio: duration > 0 ? Math.round((realTimeData?.audio?.speakingTime || 0) / duration * 100) : 0
          },
          video: {
            // Gemini 분석 결과
            eyeContact: geminiAnalysis.detailed?.video?.eyeContact || 75,
            facialExpression: geminiAnalysis.detailed?.video?.facialExpression || 75,
            posture: geminiAnalysis.detailed?.video?.posture || 75,
            feedback: geminiAnalysis.detailed?.video?.feedback || '비언어적 소통 분석이 완료되었습니다.',
            
            // 실시간 데이터 추가
            faceDetectionRate: Math.round(realTimeData?.video?.faceDetectionRate || 0),
            eyeContactPercentage: Math.round(realTimeData?.video?.eyeContactPercentage || 0),
            smileFrequency: Math.round(realTimeData?.video?.smileDetection || 0),
            postureScore: Math.round(realTimeData?.video?.postureScore || 0),
            headPoseStability: Math.round((realTimeData?.video?.postureScore || 0) * 0.9)
          },
          text: {
            // Gemini 분석 결과
            contentQuality: geminiAnalysis.detailed?.text?.contentQuality || 75,
            structureLogic: geminiAnalysis.detailed?.text?.structureLogic || 75,
            relevance: geminiAnalysis.detailed?.text?.relevance || 75,
            feedback: geminiAnalysis.detailed?.text?.feedback || '답변 내용 분석이 완료되었습니다.',
            
            // 실시간 계산 데이터 추가
            completionRate: (() => {
              const answers = interviewData.answers || [];
              const questions = interviewData.questions || [];
              const completedAnswers = answers.filter(answer => answer && answer.trim().length > 0);
              return questions.length > 0 ? Math.round((completedAnswers.length / questions.length) * 100) : 0;
            })(),
            averageAnswerLength: (() => {
              const answers = interviewData.answers || [];
              const totalLength = answers.reduce((sum, answer) => sum + (answer?.length || 0), 0);
              const completedAnswers = answers.filter(answer => answer && answer.trim().length > 0);
              return completedAnswers.length > 0 ? Math.round(totalLength / completedAnswers.length) : 0;
            })(),
            vocabularyRichness: (() => {
              const answers = interviewData.answers || [];
              const allWords = answers.join(' ').toLowerCase().split(/\s+/).filter(word => word.length > 2);
              const uniqueWords = [...new Set(allWords)];
              return allWords.length > 0 ? Math.round((uniqueWords.length / allWords.length) * 100) : 0;
            })(),
            totalWords: (() => {
              const answers = interviewData.answers || [];
              return answers.join(' ').split(/\s+/).filter(word => word.length > 0).length;
            })(),
            uniqueWords: (() => {
              const answers = interviewData.answers || [];
              const allWords = answers.join(' ').toLowerCase().split(/\s+/).filter(word => word.length > 2);
              return [...new Set(allWords)].length;
            })()
          }
        },
        
        // Gemini 요약 정보 사용
        summary: {
          strengths: geminiAnalysis.summary?.strengths || ['성실한 태도', '기본기 보유'],
          improvements: geminiAnalysis.summary?.improvements || ['답변 구체화', '자신감 향상'],
          recommendation: geminiAnalysis.summary?.recommendation || '지속적인 연습을 통해 더욱 발전하실 수 있습니다!'
        },
        
        // 메타데이터
        duration,
        timestamp: geminiAnalysis.timestamp || new Date().toISOString(),
        analysisMethod: geminiAnalysis.analysisMethod || 'Gemini AI Expert Analysis',
        
        // 성능 메트릭 (기존 유지)
        performanceMetrics: {
          totalFrames: analysisRef.current.totalFrames,
          avgProcessingTime: analysisRef.current.performanceMetrics.avgProcessingTime,
          errorCount: analysisRef.current.performanceMetrics.errorCount
        },
        
        // 실제 면접 데이터
        interviewStats: {
          questionsTotal: (interviewData.questions || []).length,
          questionsAnswered: (interviewData.answers || []).filter(a => a && a.trim()).length,
          completionRate: (() => {
            const questions = interviewData.questions || [];
            const answers = interviewData.answers || [];
            const completed = answers.filter(a => a && a.trim()).length;
            return questions.length > 0 ? Math.round((completed / questions.length) * 100) : 0;
          })(),
          totalAnswerLength: (interviewData.answers || []).reduce((sum, a) => sum + (a?.length || 0), 0),
          hasRecording: interviewData.hasRecording || false,
          recordingDuration: interviewData.totalDuration || duration
        }
      };
      
    } else {      
      // 🎯 음성 분석 점수 계산 (실제 데이터 기반)
      let audioScore = 65; // 기본 점수
      
      const avgVolume = realTimeData?.audio?.averageVolume || 0;
      const speakingTime = realTimeData?.audio?.speakingTime || 0;
      const wpm = realTimeData?.audio?.wordsPerMinute || 0;
      const fillerWords = realTimeData?.audio?.fillerWordsCount || 0;
      const speakingRatio = duration > 0 ? (speakingTime / duration) : 0;
      
      // 볼륨 점수 (최적 범위: 20-80)
      if (avgVolume >= 25 && avgVolume <= 75) {
        audioScore += 15; // 완벽한 볼륨
      } else if (avgVolume >= 15 && avgVolume <= 85) {
        audioScore += 8;  // 양호한 볼륨
      } else if (avgVolume < 10) {
        audioScore -= 20; // 너무 작음
      } else if (avgVolume > 90) {
        audioScore -= 15; // 너무 큼
      }
      
      // WPM 점수 (최적 범위: 130-180) - 🎯 오타 수정: wmp -> wpm
      if (wpm >= 130 && wpm <= 180) {
        audioScore += 12; // 완벽한 속도
      } else if (wpm >= 110 && wpm <= 200) {
        audioScore += 6;  // 양호한 속도
      } else if (wpm < 90 && wpm > 0) { // 🎯 오타 수정
        audioScore -= 15; // 너무 느림
      } else if (wpm > 220) {
        audioScore -= 10; // 너무 빠름
      }
      
      // 말하기 비율 점수 (적절한 말하기 시간: 40-80%)
      if (speakingRatio >= 0.4 && speakingRatio <= 0.8) {
        audioScore += 10; // 적절한 비율
      } else if (speakingRatio >= 0.2 && speakingRatio < 0.4) {
        audioScore += 3;  // 약간 적음
      } else if (speakingRatio < 0.2) {
        audioScore -= 15; // 너무 적게 말함
      } else if (speakingRatio > 0.9) {
        audioScore -= 8;  // 너무 많이 말함
      }
      
      // 습관어 페널티
      if (fillerWords === 0) {
        audioScore += 5;  // 습관어 없음
      } else if (fillerWords <= 3) {
        audioScore += 2;  // 적은 습관어
      } else if (fillerWords > 10) {
        audioScore -= 10; // 습관어 많음
      } else if (fillerWords > 5) {
        audioScore -= 5;  // 습관어 보통
      }
      
      // 🎯 영상 분석 점수 계산 (실제 데이터 기반)
      let videoScore = 60; // 기본 점수
      
      const faceDetectionRate = realTimeData?.video?.faceDetectionRate || 0;
      const eyeContactPercentage = realTimeData?.video?.eyeContactPercentage || 0;
      const smileDetection = realTimeData?.video?.smileDetection || 0;
      const postureScore = realTimeData?.video?.postureScore || 0;
      
      // 얼굴 감지율 점수
      if (faceDetectionRate >= 90) {
        videoScore += 15; // 완벽한 감지
      } else if (faceDetectionRate >= 75) {
        videoScore += 10; // 우수한 감지
      } else if (faceDetectionRate >= 50) {
        videoScore += 5;  // 보통 감지
      } else if (faceDetectionRate < 30) {
        videoScore -= 25; // 감지 부족
      }
      
      // 🎯 아이컨택 점수 (가장 중요한 요소 - 가중치 최대)
      if (eyeContactPercentage >= 80) {
        videoScore += 25; // 완벽한 아이컨택
      } else if (eyeContactPercentage >= 70) {
        videoScore += 20; // 우수한 아이컨택
      } else if (eyeContactPercentage >= 60) {
        videoScore += 15; // 좋은 아이컨택
      } else if (eyeContactPercentage >= 45) {
        videoScore += 8;  // 보통 아이컨택
      } else if (eyeContactPercentage >= 30) {
        videoScore += 3;  // 부족한 아이컨택
      } else if (eyeContactPercentage >= 15) {
        videoScore -= 5;  // 매우 부족
      } else {
        videoScore -= 20; // 아이컨택 없음
      }
      
      // 미소 점수
      if (smileDetection >= 40) {
        videoScore += 10; // 매우 밝은 표정
      } else if (smileDetection >= 25) {
        videoScore += 6;  // 밝은 표정
      } else if (smileDetection >= 15) {
        videoScore += 3;  // 보통 표정
      } else if (smileDetection < 5) {
        videoScore -= 5;  // 표정 부족
      }
      
      // 자세 점수
      if (postureScore >= 80) {
        videoScore += 8;  // 완벽한 자세
      } else if (postureScore >= 70) {
        videoScore += 5;  // 좋은 자세
      } else if (postureScore >= 60) {
        videoScore += 2;  // 보통 자세
      } else if (postureScore < 50) {
        videoScore -= 8;  // 자세 불안정
      }
      
      // 점수 범위 제한 및 가중 평균
      audioScore = Math.max(20, Math.min(95, audioScore));
      videoScore = Math.max(20, Math.min(95, videoScore));
      
      // 🎯 면접 답변 텍스트 분석
      const answers = interviewData.answers || [];
      const questions = interviewData.questions || [];
      let textScore = 70; // 기본 텍스트 점수
      
      // 답변 완성도 분석
      const completedAnswers = answers.filter(answer => answer && answer.trim().length > 0);
      const completionRate = questions.length > 0 ? (completedAnswers.length / questions.length) : 0;
      
      if (completionRate >= 1.0) {
        textScore += 15; // 모든 질문 답변
      } else if (completionRate >= 0.8) {
        textScore += 10; // 80% 이상 답변
      } else if (completionRate >= 0.6) {
        textScore += 5;  // 60% 이상 답변
      } else if (completionRate < 0.4) {
        textScore -= 15; // 40% 미만 답변
      }
      
      // 답변 길이 분석
      const totalAnswerLength = answers.reduce((sum, answer) => sum + (answer?.length || 0), 0);
      const avgAnswerLength = completedAnswers.length > 0 ? totalAnswerLength / completedAnswers.length : 0;
      
      if (avgAnswerLength >= 100) {
        textScore += 8;  // 충분한 답변 길이
      } else if (avgAnswerLength >= 50) {
        textScore += 4;  // 적절한 답변 길이
      } else if (avgAnswerLength < 20 && avgAnswerLength > 0) {
        textScore -= 10; // 답변 너무 짧음
      }
      
      // 답변 다양성 분석 (단어 다양성)
      const allWords = answers.join(' ').toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const uniqueWords = [...new Set(allWords)];
      const vocabularyRichness = allWords.length > 0 ? (uniqueWords.length / allWords.length) : 0;
      
      if (vocabularyRichness >= 0.7) {
        textScore += 6;  // 풍부한 어휘
      } else if (vocabularyRichness >= 0.5) {
        textScore += 3;  // 적절한 어휘
      } else if (vocabularyRichness < 0.3) {
        textScore -= 5;  // 단조로운 어휘
      }
      
      textScore = Math.max(20, Math.min(95, textScore));
      
      // 🎯 종합 점수 계산 (가중 평균)
      const overallScore = Math.round(
        (audioScore * 0.35 + videoScore * 0.45 + textScore * 0.2) // 영상 > 음성 > 텍스트 순 가중치
      );
      
      // 등급 계산
      let grade;
      if (overallScore >= 90) grade = 'A+';
      else if (overallScore >= 85) grade = 'A';
      else if (overallScore >= 80) grade = 'B+';
      else if (overallScore >= 75) grade = 'B';
      else if (overallScore >= 70) grade = 'C+';
      else if (overallScore >= 65) grade = 'C';
      else if (overallScore >= 60) grade = 'D+';
      else if (overallScore >= 55) grade = 'D';
      else grade = 'F';
      
      // 🎯 실제 데이터 기반 강점과 개선사항 분석
      const strengths = [];
      const improvements = [];
      
      // 얼굴 감지 관련
      if (faceDetectionRate >= 85) {
        strengths.push(`${isMediaPipeReady ? 'AI 분석: ' : ''}안정적인 카메라 앞 자세 유지 (${faceDetectionRate}%)`);
      } else if (faceDetectionRate < 60) {
        improvements.push('카메라 앞에 정면으로 앉아 얼굴이 잘 보이도록 위치 조정 필요');
      }
      
      // 🎯 아이컨택 관련 (상세 피드백)
      if (eyeContactPercentage >= 80) {
        strengths.push(`${isMediaPipeReady ? 'AI 시선 추적: ' : ''}탁월한 아이컨택 (${eyeContactPercentage}%) - 면접관과의 신뢰감 형성에 매우 효과적`);
      } else if (eyeContactPercentage >= 70) {
        strengths.push(`${isMediaPipeReady ? 'AI 시선 추적: ' : ''}우수한 아이컨택 (${eyeContactPercentage}%) - 자신감 있는 인상을 줌`);
      } else if (eyeContactPercentage >= 60) {
        strengths.push(`${isMediaPipeReady ? 'AI 시선 추적: ' : ''}좋은 아이컨택 유지 (${eyeContactPercentage}%)`);
        improvements.push('아이컨택을 조금 더 자주 유지하면 더욱 완벽해집니다');
      } else if (eyeContactPercentage >= 45) {
        improvements.push(`아이컨택 개선 필요 (현재 ${eyeContactPercentage}%) - 카메라 렌즈를 더 자주 봐주세요`);
      } else if (eyeContactPercentage >= 25) {
        improvements.push(`아이컨택이 부족합니다 (${eyeContactPercentage}%) - 카메라와의 시선 접촉 연습이 필요합니다`);
      } else {
        improvements.push('아이컨택이 매우 부족합니다. 카메라 렌즈를 직접 보는 연습을 집중적으로 해보세요');
      }
      
      // 음성 관련
      if (avgVolume >= 25 && avgVolume <= 75) {
        strengths.push(`적절한 목소리 크기와 명확성 (볼륨 ${avgVolume})`);
      } else if (avgVolume < 20) {
        improvements.push(`목소리를 더 크고 명확하게 발음해보세요 (현재 볼륨 ${avgVolume})`);
      } else if (avgVolume > 85) {
        improvements.push(`목소리 톤을 조금 더 부드럽게 조절해보세요 (현재 볼륨 ${avgVolume})`);
      }
      
      // WPM 관련
      if (wpm >= 130 && wpm <= 180) {
        strengths.push(`적절한 말하기 속도 (${wpm} WPM)`);
      } else if (wpm < 110 && wpm > 0) {
        improvements.push(`말하기 속도를 조금 더 빠르게 해보세요 (현재 ${wpm} WPM)`);
      } else if (wpm > 200) {
        improvements.push(`말하기 속도를 조금 늦춰서 더 명확하게 전달해보세요 (현재 ${wpm} WPM)`);
      }
      
      // 표정 관련
      if (smileDetection >= 35) {
        strengths.push(`${isMediaPipeReady ? 'AI 표정 분석: ' : ''}밝고 긍정적인 표정 (${smileDetection}%)`);
      } else if (smileDetection < 15) {
        improvements.push(`더 밝은 표정으로 긍정적인 인상을 만들어보세요 (현재 ${smileDetection}%)`);
      }
      
      // 말하기 비율 관련
      if (speakingRatio >= 0.5 && speakingRatio <= 0.8) {
        strengths.push(`적절한 답변 길이와 설명 (말하기 비율 ${Math.round(speakingRatio * 100)}%)`);
      } else if (speakingRatio < 0.3) {
        improvements.push(`답변을 더 자세히 설명해보세요 (현재 말하기 비율 ${Math.round(speakingRatio * 100)}%)`);
      } else if (speakingRatio > 0.85) {
        improvements.push(`더 간결하고 핵심적인 답변을 연습해보세요 (현재 말하기 비율 ${Math.round(speakingRatio * 100)}%)`);
      }
      
      // 답변 완성도 관련
      if (completionRate >= 1.0) {
        strengths.push(`모든 질문에 성실히 답변함 (${completedAnswers.length}/${questions.length})`);
      } else if (completionRate >= 0.8) {
        strengths.push(`대부분의 질문에 답변함 (${completedAnswers.length}/${questions.length})`);
      } else if (completionRate < 0.6) {
        improvements.push(`더 많은 질문에 답변하는 연습이 필요합니다 (현재 ${completedAnswers.length}/${questions.length})`);
      }
      
      // 답변 길이 관련
      if (avgAnswerLength >= 100) {
        strengths.push(`충분히 상세한 답변 제공 (평균 ${Math.round(avgAnswerLength)}자)`);
      } else if (avgAnswerLength < 30 && avgAnswerLength > 0) {
        improvements.push(`답변을 더 구체적이고 상세하게 작성해보세요 (평균 ${Math.round(avgAnswerLength)}자)`);
      }
      
      // 어휘 다양성 관련
      if (vocabularyRichness >= 0.7) {
        strengths.push(`풍부하고 다양한 어휘 사용 (어휘 다양성 ${Math.round(vocabularyRichness * 100)}%)`);
      } else if (vocabularyRichness < 0.4) {
        improvements.push(`더 다양한 어휘를 사용해보세요 (현재 어휘 다양성 ${Math.round(vocabularyRichness * 100)}%)`);
      }
      
      // 습관어 관련
      if (fillerWords === 0) {
        strengths.push('습관어 없이 명확한 발화');
      } else if (fillerWords <= 3) {
        strengths.push(`적은 습관어 사용으로 깔끔한 발화 (${fillerWords}회)`);
      } else if (fillerWords > 8) {
        improvements.push(`습관어 사용을 줄여보세요 (현재 ${fillerWords}회) - "음", "어", "그" 등의 사용 주의`);
      }
      
      // 기본 강점이 없는 경우 추가
      if (strengths.length === 0) {
        strengths.push('면접에 성실히 참여하는 적극적인 태도');
        strengths.push('주어진 시간 동안 꾸준히 답변하려는 노력');
      }
      
      // 기본 개선사항이 없는 경우 추가
      if (improvements.length === 0) {
        improvements.push('현재 수준을 유지하며 더욱 자연스러운 면접 연습 계속하기');
      }
      
      // 🎯 맞춤형 추천사항 생성
      let recommendation;
      if (overallScore >= 90) {
        recommendation = `🎉 매우 우수한 면접 태도입니다! ${isMediaPipeReady ? 'AI 분석 결과' : '분석 결과'} 모든 면에서 뛰어난 성과를 보였습니다. 특히 아이컨택(${eyeContactPercentage}%)과 말하기 태도가 훌륭합니다. 자신감을 가지고 실제 면접에 임하세요.`;
      } else if (overallScore >= 80) {
        recommendation = `👍 좋은 면접 실력을 보여주셨습니다. ${eyeContactPercentage < 60 ? '특히 아이컨택 부분을 더 연습하면' : avgVolume < 20 ? '목소리를 더 크게 하는 연습을 하면' : '현재 수준을 유지하시면'} 더욱 완벽해질 것입니다.`;
      } else if (overallScore >= 70) {
        recommendation = `📈 기본기는 잘 갖추어져 있습니다. 아이컨택(${eyeContactPercentage}%)과 목소리 전달력을 중점적으로 연습해보세요. 특히 ${completionRate < 0.8 ? '모든 질문에 답변하는 연습' : '답변의 구체성을 높이는 연습'}이 도움이 될 것입니다.`;
      } else if (overallScore >= 60) {
        recommendation = `💪 면접 기술 향상이 필요합니다. 특히 카메라와의 아이컨택(${eyeContactPercentage}%)과 자연스러운 말하기 연습을 더 해보세요. 충분한 연습을 통해 개선 가능합니다.`;
      } else {
        recommendation = `🎯 체계적인 면접 준비가 필요합니다. 기본적인 아이컨택, 자세, 말하기 속도부터 차근차근 연습해보세요. ${avgVolume < 15 ? '먼저 목소리 크기부터' : eyeContactPercentage < 25 ? '카메라 보는 연습부터' : '기본 자세부터'} 시작하는 것을 추천합니다.`;
      }
      
      // 최종 결과 객체 생성 (기존 로직)
      result = {
        // 기본 점수 정보
        overallScore,
        grade,
        scores: {
          communication: audioScore,
          appearance: videoScore,
          content: textScore
        },
        
        // 상세 분석 데이터 (실제 수집된 데이터)
        detailed: {
          audio: {
            averageVolume: Math.round(avgVolume),
            speakingTime: speakingTime,
            wordsPerMinute: wpm,
            fillerWords: fillerWords,
            speechClarity: Math.min(95, Math.max(60, 85 - fillerWords * 2)), // 습관어 기반 명확도
            speakingRatio: Math.round(speakingRatio * 100)
          },
          video: {
            faceDetectionRate: Math.round(faceDetectionRate),
            eyeContactPercentage: Math.round(eyeContactPercentage),
            smileFrequency: Math.round(smileDetection),
            postureScore: Math.round(postureScore),
            headPoseStability: Math.round(postureScore * 0.9) // 자세와 연관
          },
          text: {
            completionRate: Math.round(completionRate * 100),
            averageAnswerLength: Math.round(avgAnswerLength),
            vocabularyRichness: Math.round(vocabularyRichness * 100),
            totalWords: allWords.length,
            uniqueWords: uniqueWords.length
          }
        },
        
        // 요약 정보
        summary: {
          strengths,
          improvements,
          recommendation
        },
        
        // 메타데이터
        duration,
        timestamp: endTime,
        analysisMethod: isMediaPipeReady 
          ? 'MediaPipe AI (2024) - Enhanced Face & Eye Tracking + Web Audio API' 
          : 'Advanced Simulation with Realistic Patterns + Web Audio API',
        
        // 성능 메트릭
        performanceMetrics: {
          totalFrames: analysisRef.current.totalFrames,
          avgProcessingTime: analysisRef.current.performanceMetrics.avgProcessingTime,
          errorCount: analysisRef.current.performanceMetrics.errorCount
        },
        
        // 실제 면접 데이터
        interviewStats: {
          questionsTotal: questions.length,
          questionsAnswered: completedAnswers.length,
          completionRate: Math.round(completionRate * 100),
          totalAnswerLength: totalAnswerLength,
          hasRecording: interviewData.hasRecording || false,
          recordingDuration: interviewData.totalDuration || duration
        }
      };
    }
    
    setFinalAnalysis(result);
    
    return result;
  }, [analysisData, isMediaPipeReady]);

  // isAnalyzing 상태가 true로 변경될 때 분석 루프 시작
  useEffect(() => {
    if (isAnalyzing && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(analysisLoop);
    }
  }, [isAnalyzing, analysisLoop]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, [stopAnalysis]);

  return {
    isAnalyzing,           // ✅ 변수명 통일
    analysisData,          // ✅ 실시간 분석 데이터
    finalAnalysis,         // ✅ 최종 분석 결과
    startAnalysis,         // ✅ 분석 시작 함수
    stopAnalysis,          // ✅ 분석 중지 함수
    finishAnalysis,        // ✅ 분석 완료 함수
    isMediaPipeReady       // ✅ MediaPipe 준비 상태
  };
};