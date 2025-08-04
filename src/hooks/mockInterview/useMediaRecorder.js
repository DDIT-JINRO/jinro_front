import { useState, useRef, useCallback } from 'react';

/**
 * 면접 녹화를 관리하는 커스텀 훅
 */
export const useMediaRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingError, setRecordingError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const videoChunksRef = useRef([]);

  // 녹화 시작
  const startRecording = useCallback(async (mediaStream) => {
    try {      
      if (!mediaStream) {
        throw new Error('미디어 스트림이 없습니다.');
      }

      // MediaRecorder 설정
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus' // 또는 'video/mp4'
      };

      // 브라우저 호환성 체크
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/mp4';
        }
      }

      const mediaRecorder = new MediaRecorder(mediaStream, options);
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      // 데이터 수집 이벤트
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      // 녹화 완료 이벤트
      mediaRecorder.onstop = () => {
        setRecordedChunks([...videoChunksRef.current]);
        setIsRecording(false);
        
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };

      // 녹화 오류 이벤트
      mediaRecorder.onerror = (error) => {
        console.error('❌ 녹화 오류:', error);
        setRecordingError(error.error);
        setIsRecording(false);
      };

      // 녹화 시작
      mediaRecorder.start(1000); // 1초마다 데이터 수집
      setIsRecording(true);
      setRecordingError(null);
      setRecordingDuration(0);

      // 녹화 시간 카운터
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('❌ 녹화 시작 실패:', error);
      setRecordingError(error.message);
    }
  }, []);

  // 녹화 중지
  const stopRecording = useCallback(() => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

    } catch (error) {
      console.error('❌ 녹화 중지 실패:', error);
      setRecordingError(error.message);
    }
  }, [isRecording]);

  // 녹화된 비디오 Blob 생성
  const getRecordedVideoBlob = useCallback(() => {
    if (recordedChunks.length === 0) {
      return null;
    }

    const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
    const blob = new Blob(recordedChunks, { type: mimeType });

    return blob;
  }, [recordedChunks]);

  // 녹화된 비디오 URL 생성
  const getRecordedVideoURL = useCallback(() => {
    const blob = getRecordedVideoBlob();
    return blob ? URL.createObjectURL(blob) : null;
  }, [getRecordedVideoBlob]);

  // 녹화 데이터 초기화
  const clearRecording = useCallback(() => {
    setRecordedChunks([]);
    setRecordingDuration(0);
    setRecordingError(null);
    videoChunksRef.current = [];
  }, []);

  // 녹화 시간 포맷팅
  const formatRecordingTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 컴포넌트 언마운트 시 정리
  const cleanup = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  }, [isRecording, stopRecording]);

  return {
    isRecording,
    recordedChunks,
    recordingDuration,
    recordingError,
    startRecording,
    stopRecording,
    getRecordedVideoBlob,
    getRecordedVideoURL,
    clearRecording,
    formatRecordingTime: () => formatRecordingTime(recordingDuration),
    cleanup,
    hasRecording: recordedChunks.length > 0
  };
};