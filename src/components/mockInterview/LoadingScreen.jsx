import React from 'react';
import styles from '../../styles/mockInterview/MockInterview.module.css';

const LoadingScreen = () => {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        {/* 스피너 */}
        <div className={`${styles.spinner} ${styles.spinnerLg}`}></div>
        
        {/* 로딩 텍스트 */}
        <h2 className={styles.loadingTitle}>
          면접 질문을 불러오는 중...
        </h2>
        
        <p className={styles.loadingDescription}>
          Spring Boot API에서 데이터 로드 중
        </p>
        
        <p className={styles.loadingSubtext}>
          잠시만 기다려주세요...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;