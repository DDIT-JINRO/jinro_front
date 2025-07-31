// 🤖 AIAnalysisResult.jsx - 최적화된 면접 분석 결과 컴포넌트

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Brain, Eye, Mic, TrendingUp, TrendingDown, Star, BarChart3,
  Download, Play, ArrowLeft, MessageSquare, Clock, Target,
  CheckCircle, AlertCircle, Users, Smile
} from 'lucide-react';
import commonStyles from '../../styles/mockInterview/Common.module.css';
import styles from '../../styles/mockInterview/AIAnalysisResult.module.css';

// 🎯 상수 정의
const SCORE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 40
};

const DEFAULT_ANALYSIS = {
  overallScore: 0,
  grade: 'N/A',
  scores: { communication: 0, appearance: 0, content: 0 },
  detailed: { audio: {}, video: {}, text: {} },
  summary: { strengths: [], improvements: [], recommendation: '' }
};

const AIAnalysisResult = ({ 
  analysisResult, 
  recordedVideoURL,
  onBack,
  onDownloadReport,
  isRealTimeAnalysis = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // 🎯 안전한 분석 데이터 추출
  const analysis = useMemo(() => ({
    ...DEFAULT_ANALYSIS,
    ...analysisResult
  }), [analysisResult]);

  const { overallScore, grade, scores, detailed, summary } = analysis;

  // 🎯 데이터 검증 및 로깅
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 AIAnalysisResult 렌더링:', {
        hasData: !!analysisResult,
        overallScore,
        grade,
        hasDetailedFeedback: !!(detailed.audio?.feedback || detailed.video?.feedback || detailed.text?.feedback)
      });
    }
  }, [analysisResult, overallScore, grade, detailed]);

  // 🎯 점수에 따른 색상 반환
  const getScoreColor = (score) => {
    if (score >= SCORE_THRESHOLDS.HIGH) return '#10b981';
    if (score >= SCORE_THRESHOLDS.MEDIUM) return '#f59e0b';
    return '#ef4444';
  };

  // 🎯 원형 점수 표시 컴포넌트
  const CircularScore = ({ score, label, color = '#3b82f6' }) => {
    const radius = 68; // 1.5배 증가 (45 → 68)
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

    return (
      <div className={styles.scoreSection}>
        <div className={styles.circularScore}>
          <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="90" cy="90" r={radius}
              stroke="#e5e7eb" strokeWidth="18" fill="transparent"
            />
            <circle
              cx="90" cy="90" r={radius}
              stroke={color} strokeWidth="18" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div className={styles.circularScoreText}>
            <div className={styles.circularScoreValue}>{score}</div>
          </div>
        </div>
        <div className={styles.circularScoreLabel}>{label}</div>
      </div>
    );
  };

  // 🎯 진행 바 컴포넌트 (기본형)
  const ProgressBar = ({ score, label, icon: Icon, maxValue = 100, showUnit = true }) => (
    <div className={styles.progressItem}>
      <div className={styles.progressItemHeader}>
        <Icon size={20} />
        <span>{label}</span>
        <span className={styles.progressScore}>
          {score}{showUnit && typeof score === 'number' && score <= 100 ? '점' : ''}
        </span>
      </div>
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBarFill}
          style={{ 
            width: `${Math.min(100, (score / maxValue) * 100)}%`,
            backgroundColor: getScoreColor(score)
          }}
        />
      </div>
    </div>
  );

  // 🎯 피드백이 포함된 진행 바 컴포넌트
  const ProgressBarWithFeedback = ({ score, label, icon: Icon, feedback, maxValue = 100 }) => (
    <div className={styles.progressItemWithFeedback}>
      <ProgressBar 
        score={score} 
        label={label} 
        icon={Icon} 
        maxValue={maxValue}
      />
      
      {feedback && (
        <div className={styles.feedbackBox}>
          <div className={styles.feedbackHeader}>
            <Brain size={16} />
            <span>🤖 Gemini AI 전문가 피드백</span>
          </div>
          <div className={styles.feedbackContent}>
            <p>{feedback}</p>
          </div>
        </div>
      )}
    </div>
  );

  // 🎯 메트릭 아이템 컴포넌트
  const MetricItem = ({ label, value, unit = '' }) => (
    <div className={styles.metricItem}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}{unit}</div>
    </div>
  );

  // 🎯 분석 섹션 컴포넌트
  const AnalysisSection = ({ icon: Icon, title, feedback, metrics, iconColor }) => (
    <div className={styles.analysisSection}>
      <div className={styles.sectionHeader}>
        <Icon size={24} style={{ color: iconColor }} />
        <h3>{title}</h3>
      </div>
      <div className={styles.sectionContent}>
        {feedback && (
          <div className={styles.feedbackBox}>
            <h4>🎯 전문가 피드백</h4>
            <p>{feedback}</p>
          </div>
        )}
        {metrics && metrics.length > 0 && (
          <div className={styles.metricsGrid}>
            {metrics.map((metric, index) => (
              <MetricItem key={index} {...metric} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // 🎯 탭 데이터 구성
  const tabs = [
    { id: 'overview', label: '종합 분석', icon: BarChart3 },
    { id: 'detailed', label: '세부 분석', icon: Brain },
    ...(recordedVideoURL ? [{ id: 'video', label: '면접 영상', icon: Play }] : [])
  ];

  // 🎯 에러 상태 처리
  if (!analysisResult) {
    return (
      <div className={`${commonStyles.mockInterviewContainer} ${styles.aiAnalysisResult}`}>
        <div className={styles.analysisError}>
          <Brain size={64} />
          <h2>분석 결과를 불러올 수 없습니다</h2>
          <p>면접 데이터를 다시 확인해주세요.</p>
          <button 
            onClick={onBack} 
            className={`${commonStyles.btn} ${commonStyles.btnPrimary}`}
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${commonStyles.mockInterviewContainer} ${styles.aiAnalysisResult}`}>
      <div className={styles.analysisContent}>
        
        {/* 🎯 헤더 */}
        <div className={styles.analysisHeader}>
          <button onClick={onBack} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <Brain size={32} color="white" />
            </div>
            <div className={styles.headerText}>
              <h1>
                🤖 {analysis.analysisMethod?.includes('Gemini') ? 'Gemini AI 전문가' : '실시간'} 면접 분석 결과
              </h1>
              <p>음성과 영상을 종합적으로 분석했습니다</p>
            </div>
          </div>

          <button 
            onClick={onDownloadReport}
            className={`${commonStyles.btn} ${commonStyles.btnPrimary}`}
          >
            <Download size={16} />
            분석 보고서 다운로드
          </button>
        </div>

        {/* 🎯 전체 점수 요약 */}
        <div className={styles.aiScoreSummary}>
          <div className={styles.overallScoreCard}>
            <CircularScore 
              score={overallScore} 
              label="종합 점수" 
              color={getScoreColor(overallScore)} 
            />
            <div className={styles.gradeInfo}>
              <div className={styles.grade}>{grade}</div>
              <div className={styles.recommendation}>
                {summary.recommendation || '분석이 완료되었습니다'}
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 탭 메뉴 */}
        <div className={styles.analysisTabMenu}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 🎯 탭 컨텐츠 */}
        <div className={styles.tabContent}>
          
          {/* 📊 종합 분석 탭 */}
          {activeTab === 'overview' && (
            <div className={styles.overviewTab}>
              
              {/* 강점과 개선사항 */}
              <div className={styles.summarySection}>
                <div className={styles.strengthsCard}>
                  <div className={styles.cardHeader}>
                    <TrendingUp size={24} />
                    <h3>강점</h3>
                  </div>
                  <div className={styles.itemList}>
                    {(summary.strengths?.length > 0 ? summary.strengths : ['면접에 성실히 참여하는 적극적인 태도']).map((strength, index) => (
                      <div key={index} className={styles.listItem}>
                        <Star size={16} />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.improvementsCard}>
                  <div className={styles.cardHeader}>
                    <TrendingDown size={24} />
                    <h3>개선사항</h3>
                  </div>
                  <div className={styles.itemList}>
                    {(summary.improvements?.length > 0 ? summary.improvements : ['현재 수준을 유지하며 더욱 자연스러운 면접 연습 계속하기']).map((improvement, index) => (
                      <div key={index} className={styles.listItem}>
                        <Target size={16} />
                        <span>{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 점수 상세 및 전문가 피드백 */}
              <div className={styles.scoreDetails}>
                <h3>📊 점수 상세 및 전문가 피드백</h3>
                <div className={styles.progressListWithFeedback}>
                  
                  <ProgressBarWithFeedback 
                    score={scores.communication || 0} 
                    label="음성 표현력" 
                    icon={Mic}
                    feedback={detailed.audio?.feedback}
                  />
                  
                  <ProgressBarWithFeedback 
                    score={scores.appearance || 0} 
                    label="시각적 인상" 
                    icon={Eye}
                    feedback={detailed.video?.feedback}
                  />
                  
                  <ProgressBarWithFeedback 
                    score={scores.content || 0} 
                    label="답변 내용" 
                    icon={MessageSquare}
                    feedback={detailed.text?.feedback}
                  />
                  
                  <ProgressBar 
                    score={overallScore} 
                    label="종합 점수" 
                    icon={BarChart3} 
                  />
                  
                </div>
              </div>
            </div>
          )}

          {/* 🔍 세부 분석 탭 */}
          {activeTab === 'detailed' && (
            <div className={styles.detailedTab}>
              
              {/* 음성 분석 */}
              <AnalysisSection
                icon={Mic}
                title="음성 분석 상세"
                iconColor="#3b82f6"
                feedback={detailed.audio?.feedback || '음성 분석이 완료되었습니다.'}
                metrics={[
                  { label: '발음 명확도', value: detailed.audio?.speechClarity || 0, unit: '점' },
                  { label: '말하기 속도', value: detailed.audio?.paceAppropriate || 0, unit: '점' },
                  { label: '볼륨 일관성', value: detailed.audio?.volumeConsistency || 0, unit: '점' },
                  ...(detailed.audio?.averageVolume ? [{ label: '평균 볼륨', value: detailed.audio.averageVolume }] : []),
                  ...(detailed.audio?.wordsPerMinute ? [{ label: '말하기 속도', value: detailed.audio.wordsPerMinute, unit: ' WPM' }] : [])
                ]}
              />

              {/* 영상 분석 */}
              <AnalysisSection
                icon={Eye}
                title="영상 분석 상세"
                iconColor="#10b981"
                feedback={detailed.video?.feedback || '영상 분석이 완료되었습니다.'}
                metrics={[
                  { label: '아이컨택', value: detailed.video?.eyeContact || 0, unit: '점' },
                  { label: '표정', value: detailed.video?.facialExpression || 0, unit: '점' },
                  { label: '자세', value: detailed.video?.posture || 0, unit: '점' },
                  ...(detailed.video?.eyeContactPercentage !== undefined ? [{ label: '아이컨택 비율', value: detailed.video.eyeContactPercentage, unit: '%' }] : []),
                  ...(detailed.video?.smileFrequency !== undefined ? [{ label: '미소 빈도', value: detailed.video.smileFrequency, unit: '%' }] : [])
                ]}
              />

              {/* 텍스트 분석 */}
              <AnalysisSection
                icon={MessageSquare}
                title="답변 내용 분석 상세"
                iconColor="#f59e0b"
                feedback={detailed.text?.feedback || '답변 내용 분석이 완료되었습니다.'}
                metrics={[
                  { label: '내용 품질', value: detailed.text?.contentQuality || 0, unit: '점' },
                  { label: '논리 구조', value: detailed.text?.structureLogic || 0, unit: '점' },
                  { label: '관련성', value: detailed.text?.relevance || 0, unit: '점' },
                  ...(detailed.text?.completionRate !== undefined ? [{ label: '답변 완성도', value: detailed.text.completionRate, unit: '%' }] : []),
                  ...(detailed.text?.averageAnswerLength !== undefined ? [{ label: '평균 답변 길이', value: detailed.text.averageAnswerLength, unit: '자' }] : [])
                ]}
              />
              
            </div>
          )}

          {/* 🎥 면접 영상 탭 */}
          {activeTab === 'video' && recordedVideoURL && (
            <div className={styles.videoTab}>
              <div className={styles.videoSection}>
                <h3>📹 면접 영상 재생</h3>
                <div className={styles.videoContainer}>
                  <video 
                    controls 
                    width="100%" 
                    height="400px"
                    style={{ borderRadius: '12px' }}
                  >
                    <source src={recordedVideoURL} type="video/webm" />
                    <source src={recordedVideoURL} type="video/mp4" />
                    브라우저가 비디오를 지원하지 않습니다.
                  </video>
                  <p className={styles.videoNote}>
                    📹 녹화된 면접 영상을 통해 본인의 모습을 객관적으로 확인해보세요.
                  </p>
                </div>
              </div>
            </div>
          )}
          
        </div>

        {/* 🔬 분석 방법 안내 */}
        <div className={styles.analysisMethodInfo}>
          <h3>🔬 분석 방법</h3>
          <div className={styles.methodGrid}>
            <div className={styles.methodItem}>
              <Brain size={20} />
              <div>
                <h4>
                  🤖 {analysis.analysisMethod?.includes('Gemini') ? 'Gemini AI 전문가 분석' : 'AI 분석'}
                </h4>
                <p>
                  {analysis.analysisMethod?.includes('Gemini') 
                    ? 'Google Gemini AI가 15년 경력의 면접 전문가로서 종합적인 분석을 수행했습니다.'
                    : '실시간 AI 분석으로 면접 태도를 평가했습니다.'
                  }
                </p>
              </div>
            </div>
            <div className={styles.methodItem}>
              <Mic size={20} />
              <div>
                <h4>음성 분석</h4>
                <p>Web Speech API를 사용하여 실시간으로 볼륨, 말하기 속도, 습관어를 분석했습니다.</p>
              </div>
            </div>
            <div className={styles.methodItem}>
              <Eye size={20} />
              <div>
                <h4>영상 분석</h4>
                <p>MediaPipe를 사용하여 얼굴 감지, 아이컨택, 표정, 자세를 실시간으로 분석했습니다.</p>
              </div>
            </div>
            <div className={styles.methodItem}>
              <CheckCircle size={20} />
              <div>
                <h4>개인정보 보호</h4>
                <p>모든 분석은 브라우저에서 처리되어 외부로 전송되지 않습니다.</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AIAnalysisResult;