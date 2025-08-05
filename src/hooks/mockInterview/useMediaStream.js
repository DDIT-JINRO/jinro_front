import { useState, useEffect, useRef } from 'react';

/**
 * 웹캠과 마이크를 관리하는 커스텀 훅
 */
export const useMediaStream = () => {
  const [mediaStream, setMediaStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  const videoRef = useRef(null);

  // 카메라 시작
  const startCamera = async () => {
    try {      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setMediaStream(stream);
      setCameraPermissionGranted(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      await setupAudioAnalysis(stream);
      
    } catch (error) {
      console.error('❌ 카메라 접근 오류:', error);
      setCameraPermissionGranted(false);
      alert('카메라와 마이크 접근 권한이 필요합니다.');
    }
  };

  // 오디오 분석 설정
  const setupAudioAnalysis = async (stream) => {
    try {      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      
      analyserNode.fftSize = 512;
      analyserNode.smoothingTimeConstant = 0.8;
      analyserNode.minDecibels = -90;
      analyserNode.maxDecibels = -10;
      
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArr = new Uint8Array(bufferLength);
      
      source.connect(analyserNode);
      
      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      setDataArray(dataArr);
      setAudioInitialized(true);
            
    } catch (error) {
      console.error('❌ 오디오 분석 설정 실패:', error);
      setAudioInitialized(false);
    }
  };

  // 카메라 토글
  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  // 마이크 토글
  const toggleMic = async () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        
        // 마이크 상태에 따라 오디오 컨텍스트 제어
        if (audioTrack.enabled) {
          if (audioContext && audioContext.state === 'suspended') {
            try {
              await audioContext.resume();
            } catch (error) {
              console.error('AudioContext 재활성화 실패:', error);
            }
          }
        }
      }
    }
  };

  // 미디어 정리
  const cleanupMedia = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
  };

  // 컴포넌트 마운트 시 카메라 시작
  useEffect(() => {
    startCamera();
    
    return () => {
      cleanupMedia();
    };
  }, []);

  return {
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
    startCamera,
    cleanupMedia
  };
};