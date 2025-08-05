/**
 * 점수에 따른 색상 반환
 * @param {number} score - 점수 (0-100)
 * @returns {string} - CSS 색상값
 */
export const getScoreColor = (score) => {
  if (!score && score !== 0) return '#6b7280'; // gray-500
  if (score >= 80) return '#22c55e'; // green-500
  if (score >= 60) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
};

/**
 * 점수에 따른 등급 반환
 * @param {number} score - 점수 (0-100)
 * @returns {string} - 등급 문자열
 */
export const getScoreGrade = (score) => {
  if (!score && score !== 0) return 'N/A';
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  return 'D';
};

/**
 * 점수에 따른 상태 텍스트 반환
 * @param {number} score - 점수 (0-100)
 * @returns {string} - 상태 텍스트
 */
export const getScoreStatus = (score) => {
  if (!score && score !== 0) return '분석 중';
  if (score >= 80) return '우수';
  if (score >= 60) return '양호';
  if (score >= 40) return '보통';
  return '개선 필요';
};

/**
 * 점수에 따른 배경색 반환 (연한 색상)
 * @param {number} score - 점수 (0-100)
 * @returns {string} - CSS 배경색값
 */
export const getScoreBackgroundColor = (score) => {
  if (!score && score !== 0) return '#f3f4f6'; // gray-100
  if (score >= 80) return '#dcfce7'; // green-100
  if (score >= 60) return '#fef3c7'; // amber-100
  return '#fee2e2'; // red-100
};

/**
 * 점수 범위 검증
 * @param {number} score - 점수
 * @returns {boolean} - 유효한 점수인지 여부
 */
export const isValidScore = (score) => {
  return typeof score === 'number' && score >= 0 && score <= 100;
};

/**
 * 점수 배열의 평균 계산
 * @param {number[]} scores - 점수 배열
 * @returns {number} - 평균 점수
 */
export const calculateAverageScore = (scores) => {
  const validScores = scores.filter(isValidScore);
  if (validScores.length === 0) return 0;
  return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length);
};

/**
 * 점수 임계값 상수
 */
export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  AVERAGE: 60,
  POOR: 40,
  VERY_POOR: 0
};

/**
 * 기본 분석 데이터 구조
 */
export const DEFAULT_ANALYSIS = {
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
    strengths: [], 
    improvements: [], 
    recommendation: '' 
  }
};

/**
 * 원형 진행률 계산 (0-360도)
 * @param {number} score - 점수 (0-100)
 * @returns {number} - 각도 (0-360)
 */
export const calculateCircularProgress = (score) => {
  if (!isValidScore(score)) return 0;
  return (score / 100) * 360;
};

/**
 * 점수 차이 계산 및 개선 여부 판단
 * @param {number} currentScore - 현재 점수
 * @param {number} previousScore - 이전 점수
 * @returns {object} - { difference, isImproved, changePercentage }
 */
export const compareScores = (currentScore, previousScore) => {
  if (!isValidScore(currentScore) || !isValidScore(previousScore)) {
    return { difference: 0, isImproved: false, changePercentage: 0 };
  }
  
  const difference = currentScore - previousScore;
  const changePercentage = previousScore === 0 ? 0 : Math.round((difference / previousScore) * 100);
  
  return {
    difference,
    isImproved: difference > 0,
    changePercentage: Math.abs(changePercentage)
  };
};

/**
 * 점수별 아이콘 반환
 * @param {number} score - 점수 (0-100)
 * @returns {string} - 이모지 아이콘
 */
export const getScoreIcon = (score) => {
  if (!score && score !== 0) return '⏳';
  if (score >= 90) return '🏆';
  if (score >= 80) return '🥇';
  if (score >= 70) return '🥈';
  if (score >= 60) return '🥉';
  if (score >= 40) return '📈';
  return '💪';
};

/**
 * 점수 히스토리 트렌드 분석
 * @param {number[]} scoreHistory - 점수 히스토리 배열
 * @returns {object} - 트렌드 분석 결과
 */
export const analyzeScoreTrend = (scoreHistory) => {
  if (!Array.isArray(scoreHistory) || scoreHistory.length < 2) {
    return { trend: 'insufficient_data', message: '분석할 데이터가 부족합니다.' };
  }
  
  const validScores = scoreHistory.filter(isValidScore);
  if (validScores.length < 2) {
    return { trend: 'insufficient_data', message: '유효한 점수가 부족합니다.' };
  }
  
  const recentScores = validScores.slice(-3); // 최근 3개 점수
  const trend = recentScores[recentScores.length - 1] - recentScores[0];
  
  if (trend > 5) {
    return { trend: 'improving', message: '꾸준히 향상되고 있습니다! 🚀' };
  } else if (trend < -5) {
    return { trend: 'declining', message: '조금 더 연습이 필요해 보입니다. 💪' };
  } else {
    return { trend: 'stable', message: '안정적인 수준을 유지하고 있습니다. 👍' };
  }
};