import React from 'react';
import '../../css/aptiTest/loadingPage.css'; // 방금 만든 CSS 파일을 임포트합니다.

function LoadingPage() {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p className="loading-text">로딩 중 입니다. 잠시만 기다려 주세요...</p>
    </div>
  );
}

export default LoadingPage;