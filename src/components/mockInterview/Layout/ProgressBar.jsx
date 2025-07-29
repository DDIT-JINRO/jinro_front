import React from 'react';
import { X } from 'lucide-react';
import styles from '../../../styles/mockInterview/MockInterview.module.css';

const ProgressBar = ({
  currentQuestion,
  totalQuestions,
  progressPercentage,
  isListening,
  onEndInterview
}) => {
  return (
    <div className={styles.progressBar}>
      <div className={styles.progressBarInner}>
        {/* 헤더 */}
        <div className={styles.progressBarHeader}>
          <h2 className={`
            ${styles.progressBarTitle} 
            ${isListening ? styles.listening : ''}
          `}>
            {isListening && (
              <div className={styles.pulsingDot}></div>
            )}
            모의면접 진행 중 {isListening ? '(🎤 음성 인식 중)' : ''} ({totalQuestions}개 질문 로드됨)
          </h2>
          
          {/* 면접 종료 버튼 */}
          <button
            onClick={onEndInterview}
            className={`${styles.btn} ${styles.btnDanger}`}
          >
            <X size={16} />
            면접 종료
          </button>
        </div>
        
        {/* 진행률 바 */}
        <div className={styles.progressBarContent}>
          <span className={styles.progressBarText}>
            질문 {currentQuestion + 1} / {totalQuestions}
          </span>
          
          <div className={styles.progressBarFill}>
            <div 
              className={styles.progressBarFillInner}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <span className={styles.progressBarText}>
            {Math.round(progressPercentage)}% 완료
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;