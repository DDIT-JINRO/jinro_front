import React from 'react';
import { X, FileText, CheckCircle } from 'lucide-react';
import styles from '../../../styles/mockInterview/MockInterview.module.css';

const InterviewResult = ({ 
  questions, 
  answers, 
  onClose, 
  onRestart 
}) => {
  return (
    <div className={styles.interviewResult}>
      <div className={styles.interviewResultContainer}>
        
        {/* 완료 헤더 */}
        <div className={styles.interviewResultHeader}>
          <div className={styles.interviewResultIcon}>
            <CheckCircle size={40} style={{ color: 'white' }} />
          </div>
          <h1 className={styles.interviewResultTitle}>
            🎉 면접이 완료되었습니다!
          </h1>
          <p className={styles.interviewResultDescription}>
            총 {questions.length}개의 질문에 대한 답변이 기록되었습니다.
          </p>
        </div>

        {/* 질문별 답변 결과 */}
        {questions.map((question, index) => (
          <div key={index} className={styles.interviewResultQuestion}>
            {/* 질문 번호 */}
            <div className={styles.interviewResultQuestionHeader}>
              <div className={styles.interviewResultQuestionNumber}>
                <span className={styles.interviewResultQuestionNumberText}>
                  {index + 1}
                </span>
              </div>
              <h3 className={styles.interviewResultQuestionTitle}>
                질문 {index + 1}
              </h3>
            </div>
            
            {/* 질문 내용 */}
            <div className={styles.interviewResultQuestionContent}>
              <p className={styles.interviewResultQuestionText}>
                Q. {question}
              </p>
            </div>
            
            {/* 답변 내용 */}
            <div className={styles.interviewResultAnswer}>
              <div className={styles.interviewResultAnswerHeader}>
                <FileText size={16} style={{ color: '#059669' }} />
                <span className={styles.interviewResultAnswerLabel}>
                  음성 인식 결과
                </span>
              </div>
              <p className={styles.interviewResultAnswerText}>
                {answers[index] || '답변이 기록되지 않았습니다.'}
              </p>
              
              {/* 답변 통계 */}
              <div className={styles.interviewResultAnswerStats}>
                📊 답변 길이: {answers[index] ? answers[index].length : 0}자 | 
                🕐 예상 답변 시간: {answers[index] ? Math.ceil(answers[index].length / 200) : 0}분
              </div>
            </div>
          </div>
        ))}

        {/* 액션 버튼 */}
        <div className={styles.interviewResultActions}>
          <button
            onClick={onRestart}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            🔄 다시 면접 보기
          </button>
          
          <button
            onClick={onClose}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <X size={16} />
            면접 종료
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewResult;