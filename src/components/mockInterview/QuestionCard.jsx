import React from 'react';
import { SkipForward, CheckCircle } from 'lucide-react';
import commonStyles from '../../styles/mockInterview/Common.module.css';
import styles from '../../styles/mockInterview/QuestionCard.module.css';

const QuestionCard = ({
  currentQuestionText,
  currentQuestion,
  totalQuestions,
  currentAnswer,
  isListening,
  isLastQuestion,
  onNext,
  onComplete  // ✅ 새로 추가: 면접 완료 전용 콜백
}) => {
  
  // 🎯 면접 완료 처리 함수
  const handleComplete = () => {
    console.log('🎉 면접 완료 버튼 클릭 - 녹화 중지 및 분석 시작');
    
    // 면접 완료 전용 콜백이 있으면 사용, 없으면 기존 onNext 사용
    if (onComplete) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <div className={styles.questionCard}>
      {/* 헤더 */}
      <div className={styles.questionCardHeader}>
        <h3 className={styles.questionCardTitle}>
          현재 질문
        </h3>
        <div className={`
          ${styles.questionCardStatus} 
          ${isListening ? styles.listening : styles.waiting}
        `}>
          <div className={`
            ${styles.questionCardStatusDot}
            ${isListening ? styles.listening : styles.waiting}
          `} style={{
            backgroundColor: isListening ? '#10b981' : '#6b7280'
          }}></div>
          {isListening ? '음성 인식 중' : '서버 로드 완료'}
        </div>
      </div>
      
      {/* 질문 내용 */}
      <div className={styles.questionCardContent}>
        <p className={styles.questionCardQuestion}>
          {currentQuestionText}
        </p>
      </div>
      
      {/* 현재 답변 미리보기 */}
      {currentAnswer && (
        <div className={styles.questionCardAnswer}>
          <div className={styles.questionCardAnswerLabel}>
            💬 현재 인식된 답변 ({currentAnswer.length}자)
          </div>
          <p className={styles.questionCardAnswerText}>
            {currentAnswer}
          </p>
        </div>
      )}
      
      {/* 하단 컨트롤 */}
      <div className={styles.questionCardFooter}>
        <div className={styles.questionCardInfo}>
          💡 총 {totalQuestions}개 질문 중 {currentQuestion + 1}번째
        </div>
        
        {isLastQuestion ? (
          <button
            onClick={handleComplete}  // ✅ 수정: 전용 핸들러 사용
            className={`${commonStyles.btn} ${commonStyles.btnSuccess}`}
          >
            <CheckCircle size={16} />
            면접 완료
          </button>
        ) : (
          <button
            onClick={onNext}
            className={`${commonStyles.btn} ${commonStyles.btnPrimary}`}
          >
            <SkipForward size={16} />
            다음 질문
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;