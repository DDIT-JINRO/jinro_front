import React, { useState } from 'react';
import { Download, Copy, RefreshCw, Database, Code, BarChart3, Mic, Eye, Brain, Clock } from 'lucide-react';

const DeveloperDataTab = ({ 
  analysisResult, 
  realTimeAnalysisData, 
  questions, 
  answers, 
  recordingDuration,
  sessionMetadata = {}
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});

  // 실제 데이터 종합
  const consolidatedData = {
    sessionInfo: {
      timestamp: new Date().toISOString(),
      sessionId: `interview_${Date.now()}`,
      totalDuration: recordingDuration || 0,
      questionsCount: questions?.length || 0,
      answersCount: answers?.filter(a => a && a.trim()).length || 0,
      completionRate: questions?.length ? (answers?.filter(a => a && a.trim()).length / questions.length * 100).toFixed(1) : 0,
      ...sessionMetadata
    },
    
    // 실시간 분석 Raw 데이터
    realTimeData: realTimeAnalysisData || {},
    
    // AI 분석 결과
    aiAnalysisResult: analysisResult || {},
    
    // 면접 내용
    interviewContent: {
      questions: questions || [],
      answers: answers || [],
      questionAnswerPairs: questions?.map((q, i) => ({
        questionIndex: i,
        question: q,
        answer: answers[i] || '',
        answerLength: answers[i]?.length || 0,
        wordCount: answers[i] ? answers[i].split(/\s+/).filter(w => w.length > 0).length : 0
      })) || []
    },
    
    // 계산된 메트릭스
    calculatedMetrics: {
      averageAnswerLength: answers?.length ? 
        answers.reduce((sum, a) => sum + (a?.length || 0), 0) / answers.length : 0,
      totalWords: answers?.reduce((sum, a) => 
        sum + (a ? a.split(/\s+/).filter(w => w.length > 0).length : 0), 0) || 0,
      averageWordsPerAnswer: answers?.length ? 
        (answers.reduce((sum, a) => 
          sum + (a ? a.split(/\s+/).filter(w => w.length > 0).length : 0), 0) / answers.length) : 0,
      speakingTimePercentage: realTimeAnalysisData?.audio?.speakingTime && recordingDuration ? 
        (realTimeAnalysisData.audio.speakingTime / recordingDuration * 100).toFixed(1) : 0
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = async (data) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      alert('데이터가 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('복사 실패:', err);
      alert('복사에 실패했습니다.');
    }
  };

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const DataCard = ({ title, data, icon: Icon, description }) => (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '16px'
    }}>
      <div style={{
        background: '#f8fafc',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={20} color="#3b82f6" />
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            {title}
          </h4>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => copyToClipboard(data)}
            style={{
              padding: '4px 8px',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Copy size={12} />
            복사
          </button>
          <button
            onClick={() => downloadJSON(data, title.toLowerCase().replace(/\s+/g, '_'))}
            style={{
              padding: '4px 8px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Download size={12} />
            다운로드
          </button>
        </div>
      </div>
      
      {description && (
        <div style={{ padding: '12px 16px', background: '#f0f9ff', fontSize: '14px', color: '#1e40af' }}>
          {description}
        </div>
      )}
      
      <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
        <pre style={{
          background: '#1f2937',
          color: '#f9fafb',
          padding: '16px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );

  const MetricSummary = ({ metrics }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>완료율</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
          {metrics.completionRate}%
        </div>
      </div>
      
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>총 단어 수</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0891b2' }}>
          {metrics.totalWords}
        </div>
      </div>
      
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>평균 답변 길이</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>
          {Math.round(metrics.averageAnswerLength)}자
        </div>
      </div>
      
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>말하기 비율</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
          {metrics.speakingTimePercentage}%
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#f9fafb',
      minHeight: '100vh',
      padding: '20px' 
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: '#111827' }}>
            🔬 개발자 데이터 뷰어
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            면접 세션: {consolidatedData.sessionInfo.sessionId} | 
            완료율: {consolidatedData.sessionInfo.completionRate}% |
            총 시간: {Math.floor((consolidatedData.sessionInfo.totalDuration || 0) / 60)}분
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => downloadJSON(consolidatedData, 'complete_interview_data')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            전체 데이터 다운로드
          </button>
        </div>
      </div>

      {/* 메트릭 요약 */}
      <MetricSummary metrics={consolidatedData.calculatedMetrics} />

      {/* 탭 네비게이션 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {[
            { id: 'overview', label: '세션 정보', icon: Database },
            { id: 'realtime', label: '실시간 분석', icon: BarChart3 },
            { id: 'ai', label: 'AI 분석 결과', icon: Brain },
            { id: 'content', label: '면접 내용', icon: Code },
            { id: 'raw', label: '전체 Raw 데이터', icon: RefreshCw }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeSection === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeSection === tab.id ? '#3b82f6' : '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '24px' }}>
          {activeSection === 'overview' && (
            <div>
              <DataCard
                title="세션 정보"
                data={consolidatedData.sessionInfo}
                icon={Database}
                description="면접 세션의 기본 정보와 메타데이터"
              />
              <DataCard
                title="계산된 메트릭스"
                data={consolidatedData.calculatedMetrics}
                icon={BarChart3}
                description="수집된 데이터를 바탕으로 계산된 통계 지표"
              />
            </div>
          )}

          {activeSection === 'realtime' && (
            <div>
              <DataCard
                title="음성 분석 데이터"
                data={consolidatedData.realTimeData?.audio || {}}
                icon={Mic}
                description="실시간으로 수집된 음성 관련 데이터 (볼륨, 말하기 시간, WPM 등)"
              />
              <DataCard
                title="영상 분석 데이터"
                data={consolidatedData.realTimeData?.video || {}}
                icon={Eye}
                description="실시간으로 수집된 영상 관련 데이터 (얼굴 감지, 아이컨택, 표정 등)"
              />
            </div>
          )}

          {activeSection === 'ai' && (
            <div>
              <DataCard
                title="AI 분석 결과"
                data={consolidatedData.aiAnalysisResult}
                icon={Brain}
                description="AI 엔진이 실시간 데이터를 바탕으로 생성한 종합 분석 결과"
              />
            </div>
          )}

          {activeSection === 'content' && (
            <div>
              <DataCard
                title="질문 목록"
                data={consolidatedData.interviewContent.questions}
                icon={Code}
                description="면접에서 사용된 질문들"
              />
              <DataCard
                title="답변 목록"
                data={consolidatedData.interviewContent.answers}
                icon={Code}
                description="사용자가 제공한 답변들"
              />
              <DataCard
                title="질문-답변 매칭"
                data={consolidatedData.interviewContent.questionAnswerPairs}
                icon={Code}
                description="질문과 답변을 매칭한 구조화된 데이터"
              />
            </div>
          )}

          {activeSection === 'raw' && (
            <div>
              <DataCard
                title="전체 통합 데이터"
                data={consolidatedData}
                icon={RefreshCw}
                description="모든 수집된 데이터를 통합한 완전한 JSON 구조"
              />
            </div>
          )}
        </div>
      </div>

      {/* 푸터 정보 */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '12px'
      }}>
        <p style={{ margin: 0 }}>
          🔒 모든 데이터는 브라우저에서 처리되었으며 외부로 전송되지 않았습니다. | 
          생성 시간: {new Date().toLocaleString('ko-KR')}
        </p>
      </div>
    </div>
  );
};

export default DeveloperDataTab;