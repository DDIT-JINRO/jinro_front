import React from 'react';
import { X } from 'lucide-react';

const ProgressBar = ({
  currentQuestion,
  totalQuestions,
  progressPercentage,
  isListening,
  onEndInterview
}) => {
  return (
    <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '8px' 
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: isListening ? '#10b981' : '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {isListening && (
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></div>
            )}
            모의면접 진행 중 {isListening ? '(🎤 음성 인식 중)' : ''} ({totalQuestions}개 질문 로드됨)
          </h2>
          
          {/* 면접 종료 버튼 */}
          <button
            onClick={onEndInterview}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            <X size={16} />
            면접 종료
          </button>
        </div>
        
        {/* 진행률 바 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
            질문 {currentQuestion + 1} / {totalQuestions}
          </span>
          
          <div style={{ 
            flex: 1, 
            backgroundColor: '#e5e7eb', 
            borderRadius: '9999px', 
            height: '12px', 
            overflow: 'hidden' 
          }}>
            <div 
              style={{ 
                height: '100%', 
                backgroundColor: '#3b82f6', 
                transition: 'all 0.3s ease-out',
                width: `${progressPercentage}%`
              }}
            />
          </div>
          
          <span style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
            {Math.round(progressPercentage)}% 완료
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;