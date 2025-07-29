import React from 'react';
import { SkipForward, CheckCircle } from 'lucide-react';

const QuestionCard = ({
  currentQuestionText,
  currentQuestion,
  totalQuestions,
  currentAnswer,
  isListening,
  isLastQuestion,
  onNext
}) => {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
      padding: '24px' 
    }}>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '16px' 
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
          현재 질문
        </h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '12px',
          color: isListening ? '#10b981' : '#6b7280'
        }}>
          <div style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            backgroundColor: isListening ? '#10b981' : '#6b7280'
          }}></div>
          {isListening ? '음성 인식 중' : '서버 로드 완료'}
        </div>
      </div>
      
      {/* 질문 내용 */}
      <div style={{ 
        backgroundColor: '#dbeafe', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '16px' 
      }}>
        <p style={{ color: '#1f2937', lineHeight: '1.6', margin: 0 }}>
          {currentQuestionText}
        </p>
      </div>
      
      {/* 현재 답변 미리보기 */}
      {currentAnswer && (
        <div style={{ 
          backgroundColor: '#f0fdf4', 
          borderRadius: '8px', 
          padding: '12px', 
          marginBottom: '16px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#059669', 
            marginBottom: '4px', 
            fontWeight: '600' 
          }}>
            💬 현재 인식된 답변 ({currentAnswer.length}자)
          </div>
          <p style={{ 
            fontSize: '14px', 
            color: '#064e3b', 
            margin: 0, 
            lineHeight: '1.4',
            maxHeight: '60px',
            overflow: 'hidden'
          }}>
            {currentAnswer}
          </p>
        </div>
      )}
      
      {/* 하단 컨트롤 */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          💡 총 {totalQuestions}개 질문 중 {currentQuestion + 1}번째
        </div>
        
        {isLastQuestion ? (
          <button
            onClick={onNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <CheckCircle size={16} />
            면접 완료
          </button>
        ) : (
          <button
            onClick={onNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
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