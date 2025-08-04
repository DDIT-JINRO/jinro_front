import { useState, useEffect, useRef } from 'react';

/**
 * 면접 질문 로딩을 관리하는 커스텀 훅
 */
export const useQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const questionsInitialized = useRef(false);

  const backUrl = import.meta.env.VITE_BACK_END_URL;

  // 랜덤 질문 선택 함수
  const selectRandomQuestions = (questionsArray, count = 3) => {
    
    if (questionsArray.length <= count) {
      return questionsArray;
    }
    
    const shuffled = [...questionsArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const selected = shuffled.slice(0, count);
    
    return selected;
  };

  // 대체 질문 설정 (데이터 로드 실패시)
  const setFallbackQuestions = () => {
    const fallbackQuestions = [
      "자기소개를 해주세요.",
      "지원 동기를 말씀해 주세요.",
      "본인의 장점과 단점은 무엇인가요?"
    ];
    setQuestions(fallbackQuestions);
    setQuestionsLoaded(true);
    setAnswers(new Array(fallbackQuestions.length).fill(''));
  };

  // 서버에서 질문 데이터 로드
  const loadQuestionsFromServer = async () => {    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');
      const questionListId = urlParams.get('questionListId');
      const industryCode = urlParams.get('industryCode');
      const questionCount = urlParams.get('questionCount') || '10';
            
      if (!type) {
        console.error('❌ 면접 타입이 없습니다');
        return false;
      }
      
      // API 파라미터 구성
      const apiParams = new URLSearchParams({
        type: type
      });
      
      if (type === 'saved' && questionListId) {
        apiParams.append('questionListId', questionListId);
      } else if (type === 'random' && industryCode) {
        apiParams.append('industryCode', industryCode);
        apiParams.append('questionCount', questionCount);
      } else {
        console.error('❌ 필수 파라미터 누락:', { type, questionListId, industryCode });
        return false;
      }
      
      // Spring Boot 서버에 API 요청
      const apiUrl = `${backUrl}/cdp/imtintrvw/aiimtintrvw/api/getInterviewQuestions?${apiParams.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
            
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.questions && Array.isArray(data.questions)) {        
        // iqContent 값들만 추출
        const allQuestionTexts = data.questions.map((item, index) => {
          return item.iqContent || `질문 ${index + 1}을 불러올 수 없습니다.`;
        });

        // 랜덤으로 3개 선택
        const selectedQuestions = selectRandomQuestions(allQuestionTexts, 3);
        
        setQuestions(selectedQuestions);
        setQuestionsLoaded(true);
        setAnswers(new Array(selectedQuestions.length).fill(''));
        
        return true;
        
      } else {
        console.error('❌ 서버 응답 오류:', data);
        throw new Error(data.message || '질문 데이터가 없습니다.');
      }
      
    } catch (error) {
      console.error('❌ 서버에서 질문 로드 실패:', error);
      console.error('❌ 오류 상세:', error.message);
      return false;
    }
  };

  // PostMessage 리스너 설정
  const setupPostMessageListener = () => {
    
    const handleMessage = (event) => {
      
      if (questionsLoaded && questions.length > 0) {
        return;
      }
      
      if (event.origin !== backUrl) {
        console.warn('⚠️ 허용되지 않은 Origin:', event.origin);
        return;
      }
      
      if (event.data && event.data.type === 'INTERVIEW_QUESTIONS_DATA') {
        
        if (Array.isArray(event.data.questions) && event.data.questions.length > 0) {
          const questionTexts = event.data.questions.map((item, index) => {
            return item.iqContent || `질문 ${index + 1}을 불러올 수 없습니다.`;
          });
          
          const selectedQuestions = selectRandomQuestions(questionTexts, 3);
          
          setQuestions(selectedQuestions);
          setQuestionsLoaded(true);
          setAnswers(new Array(selectedQuestions.length).fill(''));
          
          window.removeEventListener('message', handleMessage);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    const timeoutId = setTimeout(() => {
      if (questionsLoaded && questions.length > 0) {
        window.removeEventListener('message', handleMessage);
        return;
      }
      
      console.warn('⚠️ PostMessage 타임아웃 - 기본 질문 사용');
      window.removeEventListener('message', handleMessage);
      setFallbackQuestions();
    }, 5000);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('message', handleMessage);
    };
  };

  // 통합 질문 로드 함수
  const loadQuestions = async () => {
    if (questionsInitialized.current || (questionsLoaded && questions.length > 0)) {
      return null;
    }
    
    questionsInitialized.current = true;
    
    try {
      const serverLoadSuccess = await loadQuestionsFromServer();
      
      if (serverLoadSuccess) {
        return null;
      }
      
      return setupPostMessageListener();
      
    } catch (error) {
      console.error('❌ 모든 로드 방법 실패, 폴백 실행:', error);
      setFallbackQuestions();
      return null;
    }
  };

  // 다음 질문으로 이동
  const moveToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return false; // 아직 면접이 끝나지 않음
    }
    return true; // 면접 완료
  };

  // 답변 저장
  const saveAnswer = (questionIndex, answer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  // 면접 초기화 (재시작용)
  const resetInterview = () => {
    setCurrentQuestion(0);
    setAnswers(new Array(questions.length).fill(''));
  };

  // 질문 로드 초기화
  useEffect(() => {    
    let postMessageCleanup = null;
    
    const initializeQuestions = async () => {
      try {
        postMessageCleanup = await loadQuestions();
      } catch (error) {
        console.error('❌ 질문 초기화 실패:', error);
        setFallbackQuestions();
      }
    };
    
    initializeQuestions();
    
    return () => {
      if (postMessageCleanup && typeof postMessageCleanup === 'function') {
        postMessageCleanup();
      }
    };
  }, []);

  return {
    questions,
    questionsLoaded,
    answers,
    currentQuestion,
    totalQuestions: questions.length,
    currentQuestionText: questions[currentQuestion] || '질문을 불러오는 중...',
    progressPercentage: questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0,
    moveToNextQuestion,
    saveAnswer,
    resetInterview,
    isLastQuestion: currentQuestion === questions.length - 1
  };
};