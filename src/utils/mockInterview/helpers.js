/**
 * 시간을 MM:SS 형식으로 포맷팅
 * @param {number} seconds - 초 단위 시간
 * @returns {string} MM:SS 형식의 문자열
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 원형 프로그레스 바를 위한 계산
 * @param {number} progress - 진행률 (0-100)
 * @param {number} radius - 원의 반지름 (기본값: 45)
 * @returns {object} circumference와 strokeDashoffset 값
 */
export const calculateCircularProgress = (progress, radius = 45) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return { circumference, strokeDashoffset };
};

/**
 * 배열에서 랜덤으로 n개 선택
 * @param {Array} array - 원본 배열
 * @param {number} count - 선택할 개수
 * @returns {Array} 랜덤하게 선택된 요소들의 배열
 */
export const selectRandomItems = (array, count) => {
  if (array.length <= count) {
    return [...array];
  }
  
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
};

/**
 * URL 파라미터를 객체로 파싱
 * @param {string} url - URL 문자열 (기본값: 현재 URL)
 * @returns {object} 파라미터 객체
 */
export const parseUrlParams = (url = window.location.search) => {
  const params = new URLSearchParams(url);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
};

/**
 * API 요청을 위한 URL 생성
 * @param {string} endpoint - API 엔드포인트
 * @param {object} params - 쿼리 파라미터 객체
 * @returns {string} 완성된 API URL
 */
export const buildApiUrl = (endpoint, params = {}) => {
  const url = new URL(endpoint, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};

/**
 * 디바운스 함수
 * @param {Function} func - 실행할 함수
 * @param {number} delay - 지연 시간 (밀리초)
 * @returns {Function} 디바운스된 함수
 */
export const debounce = (func, delay) => {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * 쓰로틀 함수
 * @param {Function} func - 실행할 함수
 * @param {number} delay - 지연 시간 (밀리초)
 * @returns {Function} 쓰로틀된 함수
 */
export const throttle = (func, delay) => {
  let inThrottle;
  
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, delay);
    }
  };
};

/**
 * 로컬 스토리지에 안전하게 데이터 저장
 * @param {string} key - 저장할 키
 * @param {any} value - 저장할 값
 * @returns {boolean} 저장 성공 여부
 */
export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('로컬 스토리지 저장 실패:', error);
    return false;
  }
};

/**
 * 로컬 스토리지에서 안전하게 데이터 읽기
 * @param {string} key - 읽을 키
 * @param {any} defaultValue - 기본값
 * @returns {any} 저장된 값 또는 기본값
 */
export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('로컬 스토리지 읽기 실패:', error);
    return defaultValue;
  }
};

/**
 * 미디어 권한 확인
 * @returns {Promise<object>} 카메라/마이크 권한 상태
 */
export const checkMediaPermissions = async () => {
  try {
    const permissions = await Promise.all([
      navigator.permissions.query({ name: 'camera' }),
      navigator.permissions.query({ name: 'microphone' })
    ]);
    
    return {
      camera: permissions[0].state,
      microphone: permissions[1].state
    };
  } catch (error) {
    console.error('권한 확인 실패:', error);
    return {
      camera: 'prompt',
      microphone: 'prompt'
    };
  }
};

/**
 * 브라우저 지원 여부 확인
 * @returns {object} 지원 기능들의 상태
 */
export const checkBrowserSupport = () => {
  return {
    mediaDevices: !!navigator.mediaDevices?.getUserMedia,
    speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    audioContext: !!(window.AudioContext || window.webkitAudioContext),
    postMessage: !!window.postMessage
  };
};

/**
 * 에러 로깅 유틸리티
 * @param {string} context - 에러 발생 컨텍스트
 * @param {Error} error - 에러 객체
 * @param {object} additionalInfo - 추가 정보
 */
export const logError = (context, error, additionalInfo = {}) => {
  const errorInfo = {
    context,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...additionalInfo
  };
  
  console.error(`[${context}] 에러 발생:`, errorInfo);
  
  // 여기에 원격 에러 로깅 서비스 연동 코드 추가 가능
  // 예: Sentry, LogRocket 등
};