import React from 'react';

const LoadingScreen = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center' }}>
        {/* 스피너 */}
        <div style={{ 
          width: '64px', 
          height: '64px', 
          border: '4px solid #e5e7eb', 
          borderTop: '4px solid #3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        
        {/* 로딩 텍스트 */}
        <h2 style={{ 
          color: '#1f2937', 
          marginBottom: '8px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          면접 질문을 불러오는 중...
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '4px',
          fontSize: '16px'
        }}>
          Spring Boot API에서 데이터 로드 중
        </p>
        
        <p style={{ 
          color: '#9d9d9d', 
          fontSize: '12px',
          margin: 0
        }}>
          잠시만 기다려주세요...
        </p>
      </div>
      
      {/* 스피너 애니메이션 스타일 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;