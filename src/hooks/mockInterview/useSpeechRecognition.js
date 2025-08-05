import { useState, useEffect, useRef } from 'react';

/**
 * 음성 인식을 관리하는 커스텀 훅 (개선된 버전)
 */
export const useSpeechRecognition = () => {
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const restartTimeoutRef = useRef(null);

  // 음성 인식 초기화
  useEffect(() => {    
    // 브라우저 지원 확인 (더 정확한 체크)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    
    if (!SpeechRecognition) {
      console.warn('⚠️ 이 브라우저는 음성 인식을 지원하지 않습니다');
      setSpeechSupported(false);
      setIsInitialized(true);
      return;
    }

    try {
      const recognitionInstance = new SpeechRecognition();
      
      // 음성 인식 설정 (더 안정적인 설정)
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'ko-KR';
      recognitionInstance.maxAlternatives = 1;
      
      // Chrome에서의 추가 설정
      if ('webkitSpeechRecognition' in window) {
        recognitionInstance.interimResults = true;
        recognitionInstance.continuous = true;
      }

      // 음성 인식 이벤트 처리 (개선된 버전)
      recognitionInstance.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        
        // 자동 재시작 타이머 클리어
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = null;
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        
        // 의도적으로 중지한 것이 아니라면 자동 재시작
        if (recognitionRef.current && recognitionRef.current.shouldRestart) {
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && recognitionRef.current.shouldRestart) {
              try {
                recognitionInstance.start();
              } catch (error) {
                console.error('음성 인식 재시작 실패:', error);
              }
            }
          }, 100);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('❌ 음성 인식 오류:', event.error, event);
        setIsListening(false);
        isListeningRef.current = false;
        
        // 에러별 처리
        switch(event.error) {
          case 'no-speech':
            // no-speech는 정상적인 상황이므로 재시작
            if (recognitionRef.current && recognitionRef.current.shouldRestart) {
              restartTimeoutRef.current = setTimeout(() => {
                if (recognitionRef.current && recognitionRef.current.shouldRestart) {
                  try {
                    recognitionInstance.start();
                  } catch (error) {
                    console.error('no-speech 후 재시작 실패:', error);
                  }
                }
              }, 500);
            }
            break;
            
          case 'audio-capture':
            console.error('⚠️ 오디오 캡처 실패 - 마이크 확인 필요');
            break;
            
          case 'not-allowed':
            console.error('⚠️ 마이크 권한이 거부됨');
            break;
            
          case 'network':
            console.error('⚠️ 네트워크 오류');
            break;
            
          case 'aborted':
            break;
            
          default:
            console.error('⚠️ 알 수 없는 음성 인식 오류:', event.error);
        }
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // 음성 인식 결과 처리 (개선된 버전)
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim();
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // 최종 결과가 있으면 현재 답변에 추가
        if (finalTranscript && finalTranscript.length > 0) {
          setCurrentAnswer(prev => {
            const newAnswer = prev + (prev ? ' ' : '') + finalTranscript;
            return newAnswer;
          });
        }
      };
      
      // recognition 인스턴스에 제어 플래그 추가
      recognitionInstance.shouldRestart = false;
      
      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
      setSpeechSupported(true);
      setIsInitialized(true);
      
    } catch (error) {
      console.error('❌ 음성 인식 초기화 실패:', error);
      setSpeechSupported(false);
      setIsInitialized(true);
    }
  }, []);

  // 음성 인식 시작
  const startListening = (isMicOn) => {
    if (!speechSupported || !isInitialized) {
      console.warn('⚠️ 음성 인식이 지원되지 않거나 초기화되지 않음');
      return false;
    }
    
    if (!isMicOn) {
      console.warn('⚠️ 마이크가 꺼져있어서 음성 인식을 시작할 수 없습니다');
      return false;
    }
    
    if (!recognition || !recognitionRef.current) {
      console.warn('⚠️ 음성 인식 인스턴스가 없습니다');
      return false;
    }
    
    if (isListeningRef.current) {
      return true;
    }
    
    try {      
      // 재시작 플래그 설정
      recognitionRef.current.shouldRestart = true;
      
      // 이전 타이머 클리어
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      recognition.start();
      return true;
      
    } catch (error) {
      console.error('❌ 음성 인식 시작 실패:', error);
      
      if (error.name === 'InvalidStateError') {
        try {
          recognition.stop();
          setTimeout(() => {
            try {
              recognition.start();
            } catch (retryError) {
              console.error('재시작 실패:', retryError);
            }
          }, 100);
        } catch (stopError) {
          console.error('중지 실패:', stopError);
        }
      }
      return false;
    }
  };

  // 음성 인식 중지
  const stopListening = () => {
    if (!recognition || !recognitionRef.current) {
      console.warn('⚠️ 음성 인식 인스턴스가 없습니다');
      return;
    }
    
    try {      
      // 재시작 플래그 해제
      recognitionRef.current.shouldRestart = false;
      
      // 타이머 클리어
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      if (isListeningRef.current) {
        recognition.stop();
      }
      
    } catch (error) {
      console.error('❌ 음성 인식 중지 실패:', error);
    }
  };

  // 현재 답변 초기화
  const clearCurrentAnswer = () => {
    setCurrentAnswer('');
  };

  // 현재 답변 반환 및 초기화
  const getCurrentAnswerAndClear = () => {
    const answer = currentAnswer.trim();
    clearCurrentAnswer();
    return answer;
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.shouldRestart = false;
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('정리 중 음성 인식 중지 실패:', error);
        }
      }
    };
  }, []);

  return {
    isListening: isListening && isListeningRef.current,
    currentAnswer,
    speechSupported,
    isInitialized,
    startListening,
    stopListening,
    clearCurrentAnswer,
    getCurrentAnswerAndClear
  };
};