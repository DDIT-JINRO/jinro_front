// AIAnalysisResult.jsx - 각 영역별 피드백 표시 추가

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Eye, 
  Mic, 
  TrendingUp, 
  TrendingDown, 
  Star,
  BarChart3,
  Download,
  Play,
  ArrowLeft,
  Volume2,
  Smile,
  Users,
  Clock,
  MessageSquare,
  Target,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import commonStyles from '../../styles/mockInterview/Common.module.css';
import styles from '../../styles/mockInterview/AIAnalysisResult.module.css';

const AIAnalysisResult = ({ 
  analysisResult, 
  recordedVideoURL,
  onBack,
  onDownloadReport,
  isRealTimeAnalysis = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // 🎯 컴포넌트 마운트 시 데이터 구조 확인
  useEffect(() => {
    console.log('🔍 AIAnalysisResult에서 받은 analysisResult:', analysisResult);
    
    if (analysisResult) {
      console.log('📊 분석 결과 구조 확인:');
      console.log('  - overallScore:', analysisResult.overallScore);
      console.log('  - grade:', analysisResult.grade);
      console.log('  - scores:', analysisResult.scores);
      console.log('  - detailed:', analysisResult.detailed);
      console.log('  - summary:', analysisResult.summary);
      
      if (analysisResult.detailed) {
        console.log('  - detailed.audio.feedback:', analysisResult.detailed.audio?.feedback);
        console.log('  - detailed.video.feedback:', analysisResult.detailed.video?.feedback);
        console.log('  - detailed.text.feedback:', analysisResult.detailed.text?.feedback);
      }
      
      if (analysisResult.summary) {
        console.log('  - strengths count:', analysisResult.summary.strengths?.length);
        console.log('  - improvements count:', analysisResult.summary.improvements?.length);
        console.log('  - recommendation:', analysisResult.summary.recommendation?.substring(0, 50) + '...');
      }
    }
  }, [analysisResult]);

  if (!analysisResult) {
    return (
      <div className={styles.analysisError}>
        <Brain size={48} />
        <h2>분석 결과를 불러올 수 없습니다</h2>
        <button onClick={onBack} className={`${commonStyles.btn} ${styles.btnPrimary}`}>
          돌아가기
        </button>
      </div>
    );
  }

  // 🎯 안전한 데이터 추출
  const overallScore = analysisResult.overallScore || 0;
  const grade = analysisResult.grade || 'N/A';
  const scores = analysisResult.scores || { communication: 0, appearance: 0, content: 0 };
  const detailed = analysisResult.detailed || {};
  const summary = analysisResult.summary || { strengths: [], improvements: [], recommendation: '' };

  // 원형 점수 표시 컴포넌트
  const CircularScore = ({ score, label, color = '#3b82f6' }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className={styles.circularScore}>
        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className={styles.circularScoreText}>
          <div className={styles.circularScoreValue}>{score}</div>
          <div className={styles.circularScoreLabel}>{label}</div>
        </div>
      </div>
    );
  };

  // 🎯 피드백이 포함된 진행 바 컴포넌트
  const ProgressBarWithFeedback = ({ score, label, icon: Icon, feedback, maxValue = 100 }) => (
    <div className={styles.progressItemWithFeedback}>
      <div className={styles.progressItem}>
        <div className={styles.progressItemHeader}>
          <Icon size={20} />
          <span>{label}</span>
          <span className={styles.progressScore}>{score}{typeof score === 'number' && score <= 100 ? '점' : ''}</span>
        </div>
        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressBarFill}
            style={{ 
              width: `${Math.min(100, (score / maxValue) * 100)}%`,
              backgroundColor: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
            }}
          />
        </div>
      </div>
      
      {/* 🎯 Gemini AI 피드백 표시 */}
      {feedback && (
        <div className={styles.feedbackBox}>
          <div className={styles.feedbackHeader}>
            <Brain size={16} style={{ color: '#3b82f6' }} />
            <span>🤖 Gemini AI 전문가 피드백</span>
          </div>
          <div className={styles.feedbackContent}>
            <p>{feedback}</p>
          </div>
        </div>
      )}
    </div>
  );

  // 진행 바 컴포넌트 (기본형)
  const ProgressBar = ({ score, label, icon: Icon, maxValue = 100 }) => (
    <div className={styles.progressItem}>
      <div className={styles.progressItemHeader}>
        <Icon size={20} />
        <span>{label}</span>
        <span className={styles.progressScore}>{score}{typeof score === 'number' && score <= 100 ? '점' : ''}</span>
      </div>
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBarFill}
          style={{ 
            width: `${Math.min(100, (score / maxValue) * 100)}%`,
            backgroundColor: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
          }}
        />
      </div>
    </div>
  );

  return (
    <div className={`${commonStyles.mockInterviewContainer} ${styles.aiAnalysisResult}`}>
      <div className={styles.analysisContent}>
        {/* 헤더 */}
        <div className={styles.analysisHeader}>
          <button onClick={onBack} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <Brain size={32} style={{ color: '#3b82f6' }} />
            </div>
            <div className={styles.headerText}>
              <h1>🤖 {analysisResult.analysisMethod?.includes('Gemini') ? 'Gemini AI 전문가' : '실시간'} 면접 분석 결과</h1>
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

        {/* 전체 점수 요약 */}
        <div className={styles.aiScoreSummary}>
          <div className={styles.overallScoreCard}>
            <CircularScore score={overallScore} label="종합 점수" color="#3b82f6" />
            <div className={styles.gradeInfo}>
              <div className={styles.grade}>{grade}</div>
              <div className={styles.recommendation}>
                {summary.recommendation || '분석 완료'}
              </div>
            </div>
          </div>

          <div className={styles.scoreBreakdown}>
            <div className={styles.scoreItem}>
              <Mic size={24} />
              <div>
                <div className={styles.scoreValue}>{scores.communication || 0}</div>
                <div className={styles.scoreLabel}>음성 표현</div>
              </div>
            </div>
            <div className={styles.scoreItem}>
              <Eye size={24} />
              <div>
                <div className={styles.scoreValue}>{scores.appearance || 0}</div>
                <div className={styles.scoreLabel}>시각적 인상</div>
              </div>
            </div>
            <div className={styles.scoreItem}>
              <MessageSquare size={24} />
              <div>
                <div className={styles.scoreValue}>{scores.content || 0}</div>
                <div className={styles.scoreLabel}>답변 내용</div>
              </div>
            </div>
            <div className={styles.scoreItem}>
              <Clock size={24} />
              <div>
                <div className={styles.scoreValue}>{Math.floor((analysisResult.duration || 0) / 60)}분</div>
                <div className={styles.scoreLabel}>면접 시간</div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className={styles.analysisTabMenu}>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`${commonStyles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
          >
            <BarChart3 size={16} />
            종합 분석
          </button>
          <button 
            onClick={() => setActiveTab('detailed')}
            className={`${commonStyles.tabButton} ${activeTab === 'detailed' ? styles.active : ''}`}
          >
            <Brain size={16} />
            세부 분석
          </button>
          {recordedVideoURL && (
            <button 
              onClick={() => setActiveTab('video')}
              className={`${commonStyles.tabButton} ${activeTab === 'video' ? styles.active : ''}`}
            >
              <Play size={16} />
              면접 영상
            </button>
          )}
        </div>

        {/* 탭 내용 */}
        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewTab}>
              {/* 🎯 강점과 개선사항 - Gemini 분석 결과 표시 */}
              <div className={styles.summarySection}>
                <div className={styles.strengthsCard}>
                  <div className={styles.cardHeader}>
                    <TrendingUp size={24} style={{ color: '#10b981' }} />
                    <h3>강점</h3>
                  </div>
                  <div className={styles.itemList}>
                    {summary.strengths && summary.strengths.length > 0 ? (
                      summary.strengths.map((strength, index) => (
                        <div key={index} className={styles.listItem}>
                          <Star size={16} style={{ color: '#10b981' }} />
                          <span>{strength}</span>
                        </div>
                      ))
                    ) : (
                      <div className={styles.listItem}>
                        <Star size={16} style={{ color: '#10b981' }} />
                        <span>면접에 성실히 참여하는 적극적인 태도</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.improvementsCard}>
                  <div className={styles.cardHeader}>
                    <TrendingDown size={24} style={{ color: '#f59e0b' }} />
                    <h3>개선사항</h3>
                  </div>
                  <div className={styles.itemList}>
                    {summary.improvements && summary.improvements.length > 0 ? (
                      summary.improvements.map((improvement, index) => (
                        <div key={index} className={styles.listItem}>
                          <Target size={16} style={{ color: '#f59e0b' }} />
                          <span>{improvement}</span>
                        </div>
                      ))
                    ) : (
                      <div className={styles.listItem}>
                        <Target size={16} style={{ color: '#f59e0b' }} />
                        <span>현재 수준을 유지하며 더욱 자연스러운 면접 연습 계속하기</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🎯 점수 상세 - 피드백 포함 */}
              <div className={styles.scoreDetails}>
                <h3>📊 점수 상세 및 전문가 피드백</h3>
                <div className={styles.progressListWithFeedback}>
                  
                  {/* 🎤 음성 표현력 + Gemini 피드백 */}
                  <ProgressBarWithFeedback 
                    score={scores.communication || 0} 
                    label="음성 표현력" 
                    icon={Mic}
                    feedback={detailed.audio?.feedback}
                  />
                  
                  {/* 👁️ 시각적 인상 + Gemini 피드백 */}
                  <ProgressBarWithFeedback 
                    score={scores.appearance || 0} 
                    label="시각적 인상" 
                    icon={Eye}
                    feedback={detailed.video?.feedback}
                  />
                  
                  {/* 📝 답변 내용 + Gemini 피드백 */}
                  <ProgressBarWithFeedback 
                    score={scores.content || 0} 
                    label="답변 내용" 
                    icon={MessageSquare}
                    feedback={detailed.text?.feedback}
                  />
                  
                  {/* 종합 점수 (피드백 없음) */}
                  <ProgressBar 
                    score={overallScore} 
                    label="종합 점수" 
                    icon={BarChart3} 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className={styles.detailedTab}>
              {/* 🎯 음성 분석 상세 - Gemini 피드백 표시 */}
              <div className={styles.analysisSection}>
                <div className={styles.sectionHeader}>
                  <Mic size={24} style={{ color: '#3b82f6' }} />
                  <h3>음성 분석 상세</h3>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.feedbackBox}>
                    <h4>🎤 전문가 피드백</h4>
                    <p>{detailed.audio?.feedback || '음성 분석이 완료되었습니다.'}</p>
                  </div>
                  <div className={styles.metricsGrid}>
                    <div className={styles.metricItem}>
                      <div className={styles.metricLabel}>발음 명확도</div>
                      <div className={styles.metricValue}>{detailed.audio?.speechClarity || 0}점</div>
                    </div>
                    <div className={styles.metricItem}>
                      <div className={styles.metricLabel}>말하기 속도</div>
                      <div className={styles.metricValue}>{detailed.audio?.paceAppropriate || 0}점</div>
                    </div>
                    <div className={styles.metricItem}>
                      <div className={styles.metricLabel}>볼륨 일관성</div>
                      <div className={styles.metricValue}>{detailed.audio?.volumeConsistency || 0}점</div>
                    </div>
                    {detailed.audio?.averageVolume && (
                      <div className={styles.metricItem}>
                        <div className={styles.metricLabel}>평균 볼륨</div>
                        <div className={styles.metricValue}>{detailed.audio.averageVolume}</div>
                      </div>
                    )}
                    {detailed.audio?.wordsPerMinute && (
                      <div className={styles.metricItem}>
                        <div className={styles.metricLabel}>말하기 속도</div>
                        <div className={styles.metricValue}>{detailed.audio.wordsPerMinute} WPM</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🎯 영상 분석 상세 - Gemini 피드백 표시 */}
              <div className={styles.analysisSection}>
                <div className={styles.sectionHeader}>
                  <Eye size={24} style={{ color: '#10b981' }} />
                  <h3>영상 분석 상세</h3>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.feedbackBox}>
                    <h4>👁️ 전문가 피드백</h4>
                    <p>{detailed.video?.feedback || '영상 분석이 완료되었습니다.'}</p>
                  </div>
                  <div className={styles.metricsGrid}>
                    <div className={styles.metricItem}>
                      <div className={styles.metricLabel}>아이컨택</div>
                      <div className={styles.metricValue}>{detailed.video?.eyeContact || 0}점</div>
                    </div>
                    <div className={styles.metricItem}>
                      <div className={styles.metricLabel}>표정</div>
                      <div className={styles.metricValue}>{detailed.video?.facialExpression || 0}점</div>
                    </div>
                    <div className={styles.metricItem}>
                      <div className={styles.metricLabel}>자세</div>
                      <div className={styles.metricValue}>{detailed.video?.posture || 0}점</div>
                    </div>
                    {detailed.video?.eyeContactPercentage !== undefined && (
                      <div className={styles.metricItem}>
                        <div className={styles.metricLabel}>아이컨택 비율</div>
                        <div className={styles.metricValue}>{detailed.video.eyeContactPercentage}%</div>
                      </div>
                    )}
                    {detailed.video?.smileFrequency !== undefined && (
                      <div className={styles.metricItem}>
                        <div className={styles.metricLabel}>미소 빈도</div>
                        <div className={styles.metricValue}>{detailed.video.smileFrequency}%</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🎯 텍스트 분석 상세 - Gemini 피드백 표시 */}
              <div className={styles.analysisSection}>
                <div className={styles.sectionHeader}>
                  <MessageSquare size={24} style={{ color: '#f59e0b' }} />
                  <h3>답변 내용 분석 상세</h3>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.feedbackBox}>
                    <h4>📝 전문가 피드백</h4>
                    <p>{detailed.text?.feedback || '답변 내용 분석이 완료되었습니다.'}</p>
                  </div>
                  <div className={styles.metricsGrid}>
                    <div className={styles.metricItem}>
                      <div className={styles.metricLabel}>내용 품질</div>
                      <div className={styles.metricValue}>{detailed.text?.contentQuality || 0}점</div>
                    </div>
                    <div className={styles.metricItem}>
                      <div className={styles.metricLabel}>논리 구조</div>
                      <div className={styles.metricValue}>{detailed.text?.structureLogic || 0}점</div>
                    </div>
                    <div className={styles.metricItem}>
                      <div className={styles.metricLabel}>관련성</div>
                      <div className={styles.metricValue}>{detailed.text?.relevance || 0}점</div>
                    </div>
                    {detailed.text?.completionRate !== undefined && (
                      <div className={styles.metricItem}>
                        <div className={styles.metricLabel}>답변 완성도</div>
                        <div className={styles.metricValue}>{detailed.text.completionRate}%</div>
                      </div>
                    )}
                    {detailed.text?.averageAnswerLength !== undefined && (
                      <div className={styles.metricItem}>
                        <div className={styles.metricLabel}>평균 답변 길이</div>
                        <div className={styles.metricValue}>{detailed.text.averageAnswerLength}자</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video' && recordedVideoURL && (
            <div className={styles.videoTab}>
              <div className={styles.videoSection}>
                <h3>📹 면접 영상 재생</h3>
                <div className={styles.videoContainer}>
                  <video 
                    controls 
                    width="100%" 
                    height="400px"
                    style={{ borderRadius: '8px' }}
                  >
                    <source src={recordedVideoURL} type="video/webm" />
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

        {/* 분석 방법 안내 */}
        <div className={styles.analysisMethodInfo}>
          <h3>🔬 분석 방법</h3>
          <div className={styles.methodGrid}>
            <div className={styles.methodItem}>
              <Brain size={20} />
              <div>
                <h4>🤖 {analysisResult.analysisMethod?.includes('Gemini') ? 'Gemini AI 전문가 분석' : 'AI 분석'}</h4>
                <p>
                  {analysisResult.analysisMethod?.includes('Gemini') 
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