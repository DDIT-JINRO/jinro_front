import React from 'react';
import { X, FileText, CheckCircle } from 'lucide-react';

const InterviewResult = ({ 
  questions, 
  answers, 
  onClose, 
  onRestart 
}) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 완료 헤더 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
          padding: '32px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: '#10b981', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle size={40} style={{ color: 'white' }} />
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#1f2937', 
            marginBottom: '8px' 
          }}>
            🎉 면접이 완료되었습니다!
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
            총 {questions.length}개의 질문에 대한 답변이 기록되었습니다.
          </p>
        </div>

        {/* 질문별 답변 결과 */}
        {questions.map((question, index) => (
          <div key={index} style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
            padding: '24px',
            marginBottom: '16px'
          }}>
            {/* 질문 번호 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '16px'
            }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ 
                  color: 'white', 
                  fontWeight: '600', 
                  fontSize: '14px' 
                }}>
                  {index + 1}
                </span>
              </div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1f2937', 
                margin: 0 
              }}>
                질문 {index + 1}
              </h3>
            </div>
            
            {/* 질문 내용 */}
            <div style={{ 
              backgroundColor: '#dbeafe', 
              borderRadius: '8px', 
              padding: '16px',
              marginBottom: '16px'
            }}>
              <p style={{ 
                color: '#1e40af', 
                fontSize: '16px', 
                fontWeight: '500', 
                margin: 0 
              }}>
                Q. {question}
              </p>
            </div>
            
            {/* 답변 내용 */}
            <div style={{ 
              backgroundColor: '#f0fdf4', 
              borderRadius: '8px', 
              padding: '16px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px'
              }}>
                <FileText size={16} style={{ color: '#059669', marginRight: '8px' }} />
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#059669' 
                }}>
                  음성 인식 결과
                </span>
              </div>
              <p style={{ 
                color: '#064e3b', 
                fontSize: '15px', 
                lineHeight: '1.6', 
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {answers[index] || '답변이 기록되지 않았습니다.'}
              </p>
              
              {/* 답변 통계 */}
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb'
              }}>
                📊 답변 길이: {answers[index] ? answers[index].length : 0}자 | 
                🕐 예상 답변 시간: {answers[index] ? Math.ceil(answers[index].length / 200) : 0}분
              </div>
            </div>
          </div>
        ))}

        {/* 액션 버튼 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
          padding: '24px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onRestart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            🔄 다시 면접 보기
          </button>
          
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
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