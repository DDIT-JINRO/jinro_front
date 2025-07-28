// API 관련 상수
export const API_BASE_URL = 'http://localhost:8080';
export const API_ENDPOINTS = {
  GET_INTERVIEW_QUESTIONS: '/imtintrvw/aiimtintrvw/api/getInterviewQuestions'
};

// 타이머 관련 상수
export const TIMER_DEFAULTS = {
  INITIAL_TIME: 120, // 2분
  LOW_TIME_THRESHOLD: 30, // 30초 이하일 때 경고
  WARNING_TIME_THRESHOLD: 60 // 1분 이하일 때 주의
};

// 오디오 분석 관련 상수
export const AUDIO_CONFIG = {
  FFT_SIZE: 512,
  SMOOTHING_TIME_CONSTANT: 0.8,
  MIN_DECIBELS: -90,
  MAX_DECIBELS: -10
};

// 미디어 스트림 관련 상수
export const MEDIA_CONSTRAINTS = {
  video: true,
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

// 음성 인식 관련 상수
export const SPEECH_RECOGNITION_CONFIG = {
  continuous: true,
  interimResults: true,
  lang: 'ko-KR',
  maxAlternatives: 1
};

// 질문 관련 상수
export const QUESTION_DEFAULTS = {
  DEFAULT_QUESTION_COUNT: 3,
  FALLBACK_QUESTIONS: [
    "자기소개를 해주세요.",
    "지원 동기를 말씀해 주세요.",
    "본인의 장점과 단점은 무엇인가요?"
  ]
};

// PostMessage 관련 상수
export const POST_MESSAGE = {
  ALLOWED_ORIGIN: 'http://localhost:8080',
  INTERVIEW_QUESTIONS_TYPE: 'INTERVIEW_QUESTIONS_DATA',
  TIMEOUT: 5000
};

// 색상 관련 상수
export const COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  SECONDARY: '#6b7280',
  LISTENING: '#10b981',
  WAITING: '#6b7280'
};

// 애니메이션 관련 상수
export const ANIMATION_DURATION = {
  FAST: '0.2s',
  NORMAL: '0.3s',
  SLOW: '0.5s'
};