import React from 'react';
import { X, FileText, CheckCircle, Play, Brain, Download, Clock } from 'lucide-react';

const InterviewResult = ({ 
  questions, 
  answers, 
  onClose, 
  onRestart,
  onStartAIAnalysis,
  hasRecording = false,
  recordingDuration = 0,
  hasRealTimeAnalysis = false
}) => {
  
  // 시간 포맷팅 함수
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  // 답변 통계 계산
  const calculateAnswerStats = (answer) => {
    if (!answer) return { length: 0, estimatedTime: 0, wordCount: 0 };
    
    const length = answer.length;
    const wordCount = answer.split(/\s+/).filter(word => word.length > 0).length;
    const estimatedTime = Math.ceil(wordCount / 150); // 분당 150단어 기준
    
    return { length, estimatedTime, wordCount };
  };

  // 전체 면접 통계
  const totalStats = answers.reduce((acc, answer) => {
    const stats = calculateAnswerStats(answer);
    return {
      totalChars: acc.totalChars + stats.length,
      totalWords: acc.totalWords + stats.wordCount,
      totalEstimatedTime: acc.totalEstimatedTime + stats.estimatedTime
    };
  }, { totalChars: 0, totalWords: 0, totalEstimatedTime: 0 });

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
          <p style={{ color: '#6b7280', fontSize: '16px', margin: '0 0 16px 0' }}>
            총 {questions.length}개의 질문에 대한 답변이 기록되었습니다.
          </p>
          
          {/* 면접 통계 요약 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '16px',
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                {totalStats.totalWords}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>총 단어 수</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                {totalStats.totalChars}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>총 글자 수</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                {totalStats.totalEstimatedTime}분
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>예상 답변시간</div>
            </div>
            {hasRecording && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                  {formatDuration(recordingDuration)}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>실제 녹화시간</div>
              </div>
            )}
          </div>
        </div>

        {/* AI 분석 옵션 (실시간 분석이 있는 경우) */}
        {hasRealTimeAnalysis && onStartAIAnalysis && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
            padding: '24px',
            marginBottom: '24px',
            border: '2px solid #3b82f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Brain size={32} style={{ color: '#3b82f6', marginRight: '12px' }} />
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                  🤖 AI 면접 분석 결과 확인
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>
                  실시간으로 수집된 음성, 영상 데이터를 바탕으로 상세한 분석 리포트를 제공합니다
                </p>
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              border: '1px solid #bfdbfe'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', margin: '0 0 8px 0' }}>
                📊 분석 항목
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af' }}>
                <li>🎤 <strong>음성 분석:</strong> 목소리 톤, 말하기 속도, 볼륨, 습관어 사용</li>
                <li>👁️ <strong>영상 분석:</strong> 아이컨택, 표정, 자세, 얼굴 감지</li>
                <li>📈 <strong>종합 평가:</strong> 개인별 맞춤 피드백 및 개선 방향</li>
                <li>📋 <strong>상세 리포트:</strong> 다운로드 가능한 분석 보고서</li>
              </ul>
            </div>
            
            <button
              onClick={onStartAIAnalysis}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                width: '100%',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              <Brain size={20} />
              AI 분석 결과 확인하기
            </button>
          </div>
        )}

        {/* 녹화 영상 정보 (녹화가 있는 경우) */}
        {hasRecording && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
            padding: '24px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Play size={24} style={{ color: '#8b5cf6', marginRight: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                📹 면접 녹화 영상
              </h3>
            </div>
            <div style={{ 
              backgroundColor: '#faf5ff', 
              padding: '16px', 
              borderRadius: '8px',
              border: '1px solid #e9d5ff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Clock size={16} style={{ color: '#8b5cf6' }} />
                <span style={{ color: '#7c3aed', fontWeight: '600' }}>
                  녹화 시간: {formatDuration(recordingDuration)}
                </span>
              </div>
              <p style={{ color: '#6b46c1', fontSize: '14px', margin: '8px 0 0 0' }}>
                💡 AI 분석에서 녹화된 영상을 함께 확인할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* 질문별 답변 결과 */}
        {questions.map((question, index) => {
          const answerStats = calculateAnswerStats(answers[index]);
          
          return (
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
                  margin: '0 0 12px 0',
                  whiteSpace: 'pre-wrap'
                }}>
                  {answers[index] || '답변이 기록되지 않았습니다.'}
                </p>
                
                {/* 답변 통계 */}
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '8px'
                }}>
                  <div>📊 답변 길이: <strong>{answerStats.length}자</strong></div>
                  <div>📝 단어 수: <strong>{answerStats.wordCount}개</strong></div>
                  <div>🕐 예상 시간: <strong>{answerStats.estimatedTime}분</strong></div>
                  <div>📈 완성도: <strong>{answers[index] ? '완료' : '미완료'}</strong></div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 액션 버튼 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
          padding: '24px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
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
              transition: 'background-color 0.2s',
              minWidth: '160px',
              justifyContent: 'center'
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
              transition: 'background-color 0.2s',
              minWidth: '160px',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            <X size={16} />
            면접 종료
          </button>
        </div>

        {/* 개발자 정보 */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px', 
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          <p style={{ margin: 0 }}>
            💡 <strong>개인정보 보호:</strong> 모든 음성 인식 및 분석은 브라우저에서 처리되어 외부로 전송되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewResult;