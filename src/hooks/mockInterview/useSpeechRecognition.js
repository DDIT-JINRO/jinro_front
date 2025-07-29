import { useState, useEffect, useRef } from 'react';

/**
 * 음성 인식을 관리하는 커스텀 훅
 */
export const useSpeechRecognition = () => {
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  
  // 음성 인식 초기화
  useEffect(() => {
    console.log('🎙️ 음성 인식 초기화 시작...');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      
      // 음성 인식 설정
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'ko-KR';
      recognitionInstance.maxAlternatives = 1;
      
      // 음성 인식 이벤트 처리
      recognitionInstance.onstart = () => {
        console.log('🎤 음성 인식 시작됨');
        setIsListening(true);
      };
      
      recognitionInstance.onend = () => {
        console.log('🎤 음성 인식 종료됨');
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('❌ 음성 인식 오류:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          console.log('⚠️ 음성이 감지되지 않음');
        } else if (event.error === 'audio-capture') {
          console.log('⚠️ 오디오 캡처 실패');
        } else if (event.error === 'not-allowed') {
          console.log('⚠️ 마이크 권한이 거부됨');
        }
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // 음성 인식 결과 처리
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // 최종 결과가 있으면 현재 답변에 추가
        if (finalTranscript) {
          console.log('✅ 음성 인식 결과:', finalTranscript);
          setCurrentAnswer(prev => {
            const newAnswer = prev + (prev ? ' ' : '') + finalTranscript;
            console.log('📝 현재 답변 업데이트:', newAnswer);
            return newAnswer;
          });
        }
        
        // 중간 결과 로깅
        if (interimTranscript) {
          console.log('🔄 중간 인식 결과:', interimTranscript);
        }
      };
      
      setRecognition(recognitionInstance);
      setSpeechSupported(true);
      console.log('✅ 음성 인식 설정 완료');
      
    } else {
      console.warn('⚠️ 이 브라우저는 음성 인식을 지원하지 않습니다');
      setSpeechSupported(false);
    }
  }, []);

  // 음성 인식 시작
  const startListening = (isMicOn) => {
    if (!speechSupported) {
      console.warn('⚠️ 음성 인식이 지원되지 않습니다');
      return;
    }
    
    if (!isMicOn) {
      console.warn('⚠️ 마이크가 꺼져있어서 음성 인식을 시작할 수 없습니다');
      return;
    }
    
    if (recognition && !isListening) {
      try {
        console.log('🎤 음성 인식 시작 요청 (마이크 ON 상태)');
        
        // 이전 인식이 완전히 종료될 때까지 대기
        const attemptStart = () => {
          try {
            recognition.start();
            console.log('✅ 음성 인식 시작 성공');
          } catch (error) {
            if (error.name === 'InvalidStateError') {
              console.log('🔄 음성 인식이 아직 종료되지 않음, 재시도...');
              setTimeout(attemptStart, 100);
            } else {
              console.error('❌ 음성 인식 시작 실패:', error);
            }
          }
        };
        
        attemptStart();
        
      } catch (error) {
        console.error('❌ 음성 인식 시작 실패:', error);
      }
    }
  };

  // 음성 인식 중지
  const stopListening = () => {
    if (recognition && isListening) {
      console.log('🎤 음성 인식 중지 요청');
      recognition.stop();
    }
  };

  // 현재 답변 초기화
  const clearCurrentAnswer = () => {
    setCurrentAnswer('');
  };

  // 현재 답변 반환 및 초기화
  const getCurrentAnswerAndClear = () => {
    const answer = currentAnswer;
    clearCurrentAnswer();
    return answer;
  };

  return {
    isListening,
    currentAnswer,
    speechSupported,
    startListening,
    stopListening,
    clearCurrentAnswer,
    getCurrentAnswerAndClear
  };
};