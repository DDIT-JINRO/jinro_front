import React, { useState } from 'react';
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
  Clock
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

  const { overallScore, grade, scores, detailed, summary } = analysisResult;

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

  // 진행 바 컴포넌트
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
    <div className={styles.aiAnalysisResult}>
      <div className={styles.aiAnalysisContainer}>
        
        {/* 헤더 */}
        <div className={styles.aiAnalysisHeader}>
          <button 
            onClick={onBack}
            className={`${commonStyles.btn} ${commonStyles.btnSecondary}`}
          >
            <ArrowLeft size={16} />
            면접 결과로 돌아가기
          </button>
          
          <div className={styles.aiAnalysisTitle}>
            <Brain size={32} className={styles.aiIcon} />
            <div>
              <h1>🎯 {isRealTimeAnalysis ? '실시간' : 'AI'} 면접 분석 결과</h1>
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
                {summary.recommendation}
              </div>
            </div>
          </div>

          <div className={styles.scoreBreakdown}>
            <div className={styles.scoreItem}>
              <Mic size={24} />
              <div>
                <div className={styles.scoreValue}>{scores.communication}</div>
                <div className={styles.scoreLabel}>음성 표현</div>
              </div>
            </div>
            <div className={styles.scoreItem}>
              <Eye size={24} />
              <div>
                <div className={styles.scoreValue}>{scores.appearance}</div>
                <div className={styles.scoreLabel}>시각적 인상</div>
              </div>
            </div>
            <div className={styles.scoreItem}>
              <Clock size={24} />
              <div>
                <div className={styles.scoreValue}>{Math.floor(analysisResult.duration / 60)}분</div>
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
              녹화 영상
            </button>
          )}
        </div>

        {/* 탭 컨텐츠 */}
        <div className={styles.analysisTabContent}>
          
          {/* 종합 분석 탭 */}
          {activeTab === 'overview' && (
            <div className={styles.overviewTab}>
              
              {/* 강점 분석 */}
              <div className={styles.analysisSection}>
                <h3 className={styles.sectionTitle}>
                  <TrendingUp size={20} className={styles.strengthIcon} />
                  강점 분석
                </h3>
                <div className={styles.strengthsList}>
                  {summary.strengths.map((strength, index) => (
                    <div key={index} className={styles.strengthItem}>
                      <Star size={16} />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 개선사항 */}
              <div className={styles.analysisSection}>
                <h3 className={styles.sectionTitle}>
                  <TrendingDown size={20} className={styles.improvementIcon} />
                  개선사항
                </h3>
                <div className={styles.improvementsList}>
                  {summary.improvements.map((improvement, index) => (
                    <div key={index} className={styles.improvementItem}>
                      <span>{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 점수별 세부 분석 */}
              <div className={styles.analysisSection}>
                <h3 className={styles.sectionTitle}>영역별 점수</h3>
                <div className={styles.progressList}>
                  <ProgressBar 
                    score={scores.communication} 
                    label="음성 표현력" 
                    icon={Mic} 
                  />
                  <ProgressBar 
                    score={scores.appearance} 
                    label="시각적 인상" 
                    icon={Eye} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* 세부 분석 탭 */}
          {activeTab === 'detailed' && (
            <div className={styles.detailedTab}>
              
              {/* 음성 분석 */}
              <div className={styles.analysisSection}>
                <h3 className={styles.sectionTitle}>
                  <Mic size={20} />
                  음성 분석 결과
                </h3>
                <div className={styles.detailedScores}>
                  <div className={styles.detailedScoreItem}>
                    <span>평균 볼륨</span>
                    <span>{detailed.audio.averageVolume}</span>
                  </div>
                  <div className={styles.detailedScoreItem}>
                    <span>말하기 시간</span>
                    <span>{detailed.audio.speakingTime}초</span>
                  </div>
                  <div className={styles.detailedScoreItem}>
                    <span>분당 단어수</span>
                    <span>{detailed.audio.wordsPerMinute} wpm</span>
                  </div>
                  <div className={styles.detailedScoreItem}>
                    <span>습관어 사용</span>
                    <span>{detailed.audio.fillerWords}회</span>
                  </div>
                  <div className={styles.detailedScoreItem}>
                    <span>음성 명확도</span>
                    <span>{detailed.audio.speechClarity}점</span>
                  </div>
                </div>

                {/* 음성 분석 시각화 */}
                <div className={styles.audioAnalysisVisual}>
                  <h4>음성 특성 분석</h4>
                  <div className={styles.audioMetrics}>
                    <div className={styles.audioMetric}>
                      <Volume2 size={16} />
                      <span>볼륨 레벨</span>
                      <div className={styles.metricBar}>
                        <div 
                          className={styles.metricBarFill}
                          style={{ 
                            width: `${Math.min(100, detailed.audio.averageVolume)}%`,
                            backgroundColor: '#3b82f6'
                          }}
                        />
                      </div>
                      <span>{detailed.audio.averageVolume}</span>
                    </div>
                    <div className={styles.audioMetric}>
                      <Clock size={16} />
                      <span>말하기 비율</span>
                      <div className={styles.metricBar}>
                        <div 
                          className={styles.metricBarFill}
                          style={{ 
                            width: `${(detailed.audio.speakingTime / analysisResult.duration) * 100}%`,
                            backgroundColor: '#10b981'
                          }}
                        />
                      </div>
                      <span>{Math.round((detailed.audio.speakingTime / analysisResult.duration) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 영상 분석 */}
              <div className={styles.analysisSection}>
                <h3 className={styles.sectionTitle}>
                  <Eye size={20} />
                  영상 분석 결과
                </h3>
                <div className={styles.detailedScores}>
                  <div className={styles.detailedScoreItem}>
                    <span>얼굴 감지율</span>
                    <span>{detailed.video.faceDetectionRate}%</span>
                  </div>
                  <div className={styles.detailedScoreItem}>
                    <span>아이컨택</span>
                    <span>{detailed.video.eyeContactPercentage}%</span>
                  </div>
                  <div className={styles.detailedScoreItem}>
                    <span>미소 빈도</span>
                    <span>{detailed.video.smileFrequency}%</span>
                  </div>
                  <div className={styles.detailedScoreItem}>
                    <span>자세 안정성</span>
                    <span>{detailed.video.postureScore}점</span>
                  </div>
                  <div className={styles.detailedScoreItem}>
                    <span>머리 자세</span>
                    <span>{detailed.video.headPoseStability}점</span>
                  </div>
                </div>

                {/* 영상 분석 시각화 */}
                <div className={styles.videoAnalysisVisual}>
                  <h4>시각적 인상 분석</h4>
                  <div className={styles.videoMetrics}>
                    <div className={styles.videoMetric}>
                      <Eye size={16} />
                      <span>아이컨택</span>
                      <div className={styles.metricBar}>
                        <div 
                          className={styles.metricBarFill}
                          style={{ 
                            width: `${detailed.video.eyeContactPercentage}%`,
                            backgroundColor: detailed.video.eyeContactPercentage >= 60 ? '#10b981' : '#f59e0b'
                          }}
                        />
                      </div>
                      <span>{detailed.video.eyeContactPercentage}%</span>
                    </div>
                    <div className={styles.videoMetric}>
                      <Smile size={16} />
                      <span>표정 밝기</span>
                      <div className={styles.metricBar}>
                        <div 
                          className={styles.metricBarFill}
                          style={{ 
                            width: `${detailed.video.smileFrequency}%`,
                            backgroundColor: '#3b82f6'
                          }}
                        />
                      </div>
                      <span>{detailed.video.smileFrequency}%</span>
                    </div>
                    <div className={styles.videoMetric}>
                      <Users size={16} />
                      <span>자세 안정성</span>
                      <div className={styles.metricBar}>
                        <div 
                          className={styles.metricBarFill}
                          style={{ 
                            width: `${detailed.video.postureScore}%`,
                            backgroundColor: detailed.video.postureScore >= 70 ? '#10b981' : '#f59e0b'
                          }}
                        />
                      </div>
                      <span>{detailed.video.postureScore}점</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 녹화 영상 탭 */}
          {activeTab === 'video' && recordedVideoURL && (
            <div className={styles.videoTab}>
              <div className={styles.analysisSection}>
                <h3 className={styles.sectionTitle}>
                  <Play size={20} />
                  면접 녹화 영상
                </h3>
                <div className={styles.videoContainer}>
                  <video 
                    controls 
                    className={styles.recordedVideo}
                    src={recordedVideoURL}
                  >
                    이 브라우저는 비디오를 지원하지 않습니다.
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
              <Brain size={20} />
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