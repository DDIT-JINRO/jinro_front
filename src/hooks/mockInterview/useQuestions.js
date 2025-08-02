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
    console.log(`🎲 전체 ${questionsArray.length}개 질문 중 랜덤으로 ${count}개 선택`);
    
    if (questionsArray.length <= count) {
      console.log(`⚠️ 전체 질문 수(${questionsArray.length})가 요청 개수(${count})보다 적어서 모든 질문 사용`);
      return questionsArray;
    }
    
    const shuffled = [...questionsArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const selected = shuffled.slice(0, count);
    
    console.log('🎯 선택된 질문들:');
    selected.forEach((question, index) => {
      console.log(`   ${index + 1}. ${question}`);
    });
    
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
    console.log('🔄 기본 질문으로 대체:', fallbackQuestions);
  };

  // 서버에서 질문 데이터 로드
  const loadQuestionsFromServer = async () => {
    console.log('🌐 서버에서 질문 데이터 로드 시작...');
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');
      const questionListId = urlParams.get('questionListId');
      const industryCode = urlParams.get('industryCode');
      const questionCount = urlParams.get('questionCount') || '10';
      
      console.log('📄 URL 파라미터:', { type, questionListId, industryCode, questionCount });
      
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
      console.log('🌐 API 요청 URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      console.log('📡 API 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 서버 응답 데이터:', data);
      
      if (data.success && data.questions && Array.isArray(data.questions)) {
        console.log('✅ 서버에서 질문 데이터 수신 성공');
        console.log('📊 질문 개수:', data.questions.length);
        
        // iqContent 값들만 추출
        const allQuestionTexts = data.questions.map((item, index) => {
          console.log(`📝 서버 질문 ${index + 1}:`, item.iqContent);
          return item.iqContent || `질문 ${index + 1}을 불러올 수 없습니다.`;
        });

        // 랜덤으로 3개 선택
        const selectedQuestions = selectRandomQuestions(allQuestionTexts, 3);
        
        setQuestions(selectedQuestions);
        setQuestionsLoaded(true);
        setAnswers(new Array(selectedQuestions.length).fill(''));
        console.log('✅ 질문 로드 완료:', selectedQuestions);
        
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
    console.log('📬 PostMessage 리스너 설정');
    
    const handleMessage = (event) => {
      console.log('📬 PostMessage 수신:', event);
      
      if (questionsLoaded && questions.length > 0) {
        console.log('✅ 질문이 이미 로드되어 있어 PostMessage 무시');
        return;
      }
      
      if (event.origin !== backUrl) {
        console.warn('⚠️ 허용되지 않은 Origin:', event.origin);
        return;
      }
      
      if (event.data && event.data.type === 'INTERVIEW_QUESTIONS_DATA') {
        console.log('✅ 면접 질문 데이터 수신:', event.data.questions);
        
        if (Array.isArray(event.data.questions) && event.data.questions.length > 0) {
          const questionTexts = event.data.questions.map((item, index) => {
            console.log(`📝 PostMessage 질문 ${index + 1}:`, item.iqContent);
            return item.iqContent || `질문 ${index + 1}을 불러올 수 없습니다.`;
          });
          
          const selectedQuestions = selectRandomQuestions(questionTexts, 3);
          
          setQuestions(selectedQuestions);
          setQuestionsLoaded(true);
          setAnswers(new Array(selectedQuestions.length).fill(''));
          console.log('✅ PostMessage로 질문 로드 성공:', selectedQuestions);
          
          window.removeEventListener('message', handleMessage);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    const timeoutId = setTimeout(() => {
      if (questionsLoaded && questions.length > 0) {
        console.log('✅ 이미 질문이 로드되어 있어 PostMessage 타임아웃 취소');
        window.removeEventListener('message', handleMessage);
        return;
      }
      
      console.warn('⚠️ PostMessage 타임아웃 - 기본 질문 사용');
      window.removeEventListener('message', handleMessage);
      setFallbackQuestions();
    }, 5000);
    
    return () => {
      console.log('🧹 PostMessage 리스너 및 타임아웃 정리');
      clearTimeout(timeoutId);
      window.removeEventListener('message', handleMessage);
    };
  };

  // 통합 질문 로드 함수
  const loadQuestions = async () => {
    if (questionsInitialized.current || (questionsLoaded && questions.length > 0)) {
      console.log('✅ 질문이 이미 로드되어 있음, 재로드 생략');
      return null;
    }
    
    questionsInitialized.current = true;
    console.log('🎯 질문 데이터 로드 시작...');
    
    try {
      const serverLoadSuccess = await loadQuestionsFromServer();
      
      if (serverLoadSuccess) {
        console.log('✅ 서버에서 질문 로드 성공, PostMessage 시도 생략');
        return null;
      }
      
      console.log('🔄 서버 로드 실패, PostMessage 시도...');
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
    console.log('🚀 질문 로드 초기화');
    
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
      console.log('🔄 질문 로드 cleanup');
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