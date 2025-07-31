// 🛠️ analysisUtils.js - 분석 결과 관련 유틸리티 함수

/**
 * 점수 임계값 상수
 */
export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  AVERAGE: 60,
  POOR: 40,
  VERY_POOR: 20
};

/**
 * 점수 레벨 상수
 */
export const SCORE_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good', 
  AVERAGE: 'average',
  POOR: 'poor',
  VERY_POOR: 'very_poor'
};

/**
 * 점수에 따른 색상 매핑
 */
export const SCORE_COLORS = {
  [SCORE_LEVELS.EXCELLENT]: '#059669', // green-600
  [SCORE_LEVELS.GOOD]: '#10b981',      // green-500
  [SCORE_LEVELS.AVERAGE]: '#f59e0b',   // amber-500
  [SCORE_LEVELS.POOR]: '#ef4444',      // red-500
  [SCORE_LEVELS.VERY_POOR]: '#dc2626'  // red-600
};

/**
 * 점수에 따른 등급 매핑
 */
export const SCORE_GRADES = {
  [SCORE_LEVELS.EXCELLENT]: 'A+',
  [SCORE_LEVELS.GOOD]: 'A',
  [SCORE_LEVELS.AVERAGE]: 'B',
  [SCORE_LEVELS.POOR]: 'C',
  [SCORE_LEVELS.VERY_POOR]: 'D'
};

/**
 * 점수를 레벨로 변환
 * @param {number} score - 점수 (0-100)
 * @returns {string} 점수 레벨
 */
export const getScoreLevel = (score) => {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return SCORE_LEVELS.EXCELLENT;
  if (score >= SCORE_THRESHOLDS.GOOD) return SCORE_LEVELS.GOOD;
  if (score >= SCORE_THRESHOLDS.AVERAGE) return SCORE_LEVELS.AVERAGE;
  if (score >= SCORE_THRESHOLDS.POOR) return SCORE_LEVELS.POOR;
  return SCORE_LEVELS.VERY_POOR;
};

/**
 * 점수에 따른 색상 반환
 * @param {number} score - 점수 (0-100)
 * @returns {string} 색상 코드
 */
export const getScoreColor = (score) => {
  const level = getScoreLevel(score);
  return SCORE_COLORS[level];
};

/**
 * 점수에 따른 등급 반환
 * @param {number} score - 점수 (0-100)
 * @returns {string} 등급
 */
export const getScoreGrade = (score) => {
  const level = getScoreLevel(score);
  return SCORE_GRADES[level];
};

/**
 * 점수를 안전하게 정규화 (0-100 범위로 제한)
 * @param {number} score - 원본 점수
 * @param {number} maxScore - 최대 점수 (기본값: 100)
 * @returns {number} 정규화된 점수
 */
export const normalizeScore = (score, maxScore = 100) => {
  if (typeof score !== 'number' || isNaN(score)) return 0;
  return Math.min(maxScore, Math.max(0, Math.round(score)));
};

/**
 * 전체 점수 계산 (가중 평균)
 * @param {Object} scores - 개별 점수 객체
 * @param {Object} weights - 가중치 객체 (기본값: 균등)
 * @returns {number} 종합 점수
 */
export const calculateOverallScore = (scores, weights = {}) => {
  const defaultWeights = {
    communication: 0.35, // 음성 표현 35%
    appearance: 0.25,    // 시각적 인상 25%
    content: 0.40        // 답변 내용 40%
  };

  const finalWeights = { ...defaultWeights, ...weights };
  
  const {
    communication = 0,
    appearance = 0, 
    content = 0
  } = scores;

  const weightedSum = 
    (communication * finalWeights.communication) +
    (appearance * finalWeights.appearance) +
    (content * finalWeights.content);

  return normalizeScore(weightedSum);
};

/**
 * 분석 결과 데이터 검증 및 기본값 설정
 * @param {Object} analysisResult - 원본 분석 결과
 * @returns {Object} 검증된 분석 결과
 */
export const validateAnalysisResult = (analysisResult) => {
  if (!analysisResult || typeof analysisResult !== 'object') {
    return getDefaultAnalysisResult();
  }

  const {
    overallScore = 0,
    scores = {},
    detailed = {},
    summary = {},
    duration = 0,
    analysisMethod = 'AI 분석'
  } = analysisResult;

  // 점수 검증 및 정규화
  const normalizedScores = {
    communication: normalizeScore(scores.communication),
    appearance: normalizeScore(scores.appearance),
    content: normalizeScore(scores.content)
  };

  // 전체 점수가 없으면 계산
  const finalOverallScore = overallScore || calculateOverallScore(normalizedScores);
  
  return {
    ...analysisResult,
    overallScore: normalizeScore(finalOverallScore),
    grade: analysisResult.grade || getScoreGrade(finalOverallScore),
    scores: normalizedScores,
    detailed: {
      audio: detailed.audio || {},
      video: detailed.video || {},
      text: detailed.text || {}
    },
    summary: {
      strengths: Array.isArray(summary.strengths) ? summary.strengths : [],
      improvements: Array.isArray(summary.improvements) ? summary.improvements : [],
      recommendation: summary.recommendation || '분석이 완료되었습니다.'
    },
    duration: Math.max(0, duration),
    analysisMethod
  };
};

/**
 * 기본 분석 결과 생성
 * @returns {Object} 기본 분석 결과
 */
export const getDefaultAnalysisResult = () => ({
  overallScore: 0,
  grade: 'N/A',
  scores: {
    communication: 0,
    appearance: 0,
    content: 0
  },
  detailed: {
    audio: {},
    video: {},
    text: {}
  },
  summary: {
    strengths: ['면접에 성실히 참여하는 적극적인 태도'],
    improvements: ['더 많은 연습을 통한 자신감 향상'],
    recommendation: '꾸준한 연습으로 면접 실력을 향상시켜보세요.'
  },
  duration: 0,
  analysisMethod: 'AI 분석'
});

/**
 * 시간을 포맷팅 (초 → MM:SS)
 * @param {number} seconds - 초 단위 시간
 * @returns {string} 포맷된 시간 문자열
 */
export const formatDuration = (seconds) => {
  if (typeof seconds !== 'number' || seconds < 0) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 점수 레벨에 따른 설명 메시지
 */
export const SCORE_MESSAGES = {
  [SCORE_LEVELS.EXCELLENT]: {
    title: '🌟 탁월함',
    description: '매우 우수한 면접 실력을 보여주셨습니다!'
  },
  [SCORE_LEVELS.GOOD]: {
    title: '👍 우수함', 
    description: '좋은 면접 실력을 갖추고 계십니다.'
  },
  [SCORE_LEVELS.AVERAGE]: {
    title: '📈 보통',
    description: '평균적인 수준이며, 조금 더 연습하면 좋아질 것 같습니다.'
  },
  [SCORE_LEVELS.POOR]: {
    title: '💪 개선 필요',
    description: '연습을 통해 실력을 향상시켜보세요.'
  },
  [SCORE_LEVELS.VERY_POOR]: {
    title: '🎯 집중 개선',
    description: '체계적인 연습이 필요합니다.'
  }
};

/**
 * 점수에 따른 메시지 반환
 * @param {number} score - 점수
 * @returns {Object} 메시지 객체 {title, description}
 */
export const getScoreMessage = (score) => {
  const level = getScoreLevel(score);
  return SCORE_MESSAGES[level];
};

/**
 * 피드백 품질 레벨 판단
 * @param {string} feedback - 피드백 내용
 * @returns {string} 품질 레벨 ('expert', 'ai', 'basic')
 */
export const getFeedbackQuality = (feedback) => {
  if (!feedback || typeof feedback !== 'string') return 'basic';
  
  const feedbackLength = feedback.length;
  const hasSpecificAdvice = /구체적|세부적|상세히|예를 들어|방법|전략/.test(feedback);
  const hasPersonalization = /당신|귀하|개인적|특별히|맞춤/.test(feedback);
  
  if (feedbackLength > 200 && hasSpecificAdvice && hasPersonalization) {
    return 'expert';
  } else if (feedbackLength > 100 && (hasSpecificAdvice || hasPersonalization)) {
    return 'ai';
  }
  
  return 'basic';
};

/**
 * 분석 결과를 CSV 형태로 변환
 * @param {Object} analysis - 분석 결과
 * @returns {string} CSV 문자열
 */
export const exportAnalysisToCSV = (analysis) => {
  const { overallScore, grade, scores, duration } = analysis;
  
  const csvData = [
    ['항목', '값'],
    ['종합 점수', overallScore],
    ['등급', grade],
    ['음성 표현', scores.communication],
    ['시각적 인상', scores.appearance], 
    ['답변 내용', scores.content],
    ['면접 시간', formatDuration(duration)],
    ['분석 일시', new Date().toLocaleString('ko-KR')]
  ];

  return csvData.map(row => row.join(',')).join('\n');
};

/**
 * 분석 결과를 JSON 형태로 내보내기
 * @param {Object} analysis - 분석 결과
 * @returns {string} JSON 문자열
 */
export const exportAnalysisToJSON = (analysis) => {
  const exportData = {
    ...analysis,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * 디바운스된 점수 애니메이션을 위한 유틸리티
 * @param {number} targetScore - 목표 점수
 * @param {number} duration - 애니메이션 지속 시간 (ms)
 * @param {Function} callback - 각 프레임마다 호출될 콜백
 */
export const animateScore = (targetScore, duration = 1500, callback) => {
  const startTime = Date.now();
  const startScore = 0;
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // easeOutCubic 이징 함수
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentScore = Math.round(startScore + (targetScore - startScore) * easedProgress);
    
    callback(currentScore);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};