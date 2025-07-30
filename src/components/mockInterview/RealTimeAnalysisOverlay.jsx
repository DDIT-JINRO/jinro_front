import React, { useState, useEffect, useRef } from 'react';
import { Eye, Mic, Volume2, Smile, Users, TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';
import styles from '../../styles/mockInterview/MockInterview.module.css';

const RealTimeAnalysisOverlay = ({ analysisData }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTips, setCurrentTips] = useState([]);
  const [lastTipUpdate, setLastTipUpdate] = useState(0);
  const [eyeContactTrend, setEyeContactTrend] = useState('stable'); // up, down, stable
  
  // 이전 데이터를 저장해서 트렌드 분석
  const prevDataRef = useRef({
    faceDetected: false,
    eyeContactPercentage: 0,
    currentVolume: 0,
    eyeContactHistory: [] // 최근 10개 값 저장
  });
  
  if (!analysisData) return null;

  const { audio, video } = analysisData;

  // 🎯 아이컨택 트렌드 분석
  useEffect(() => {
    if (video.eyeContactPercentage !== undefined) {
      const history = prevDataRef.current.eyeContactHistory;
      history.push(video.eyeContactPercentage);
      
      // 최근 10개 값만 유지
      if (history.length > 10) {
        history.shift();
      }
      
      // 트렌드 계산 (최근 5개 vs 이전 5개)
      if (history.length >= 6) {
        const recent = history.slice(-3); // 최근 3개
        const previous = history.slice(-6, -3); // 이전 3개
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
        
        const difference = recentAvg - previousAvg;
        
        if (difference > 5) {
          setEyeContactTrend('up');
        } else if (difference < -5) {
          setEyeContactTrend('down');
        } else {
          setEyeContactTrend('stable');
        }
      }
      
      prevDataRef.current.eyeContactHistory = history;
    }
  }, [video.eyeContactPercentage]);

  useEffect(() => {
    console.log('🔍 RealTimeAnalysisOverlay - analysisData 업데이트:', {
      analysisData: analysisData ? {
        audio: {
          currentVolume: analysisData.audio.currentVolume,
          speakingTime: analysisData.audio.speakingTime
        },
        video: {
          faceDetected: analysisData.video.faceDetected,
          eyeContactPercentage: analysisData.video.eyeContactPercentage,
          rawEyeContact: analysisData.video.rawEyeContact,
          smileDetection: analysisData.video.smileDetection,
          faceDetectionRate: analysisData.video.faceDetectionRate
        }
      } : null,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [analysisData]);

  // 전체 점수 계산 (실시간 예상 점수) - 아이컨택 가중치 증가
  const calculateCurrentScore = () => {
    let score = 65; // 기본 점수를 65로 상향
    
    // 오디오 점수 반영
    if (audio.currentVolume >= 20 && audio.currentVolume <= 80) score += 8;
    if (audio.currentVolume < 10 || audio.currentVolume > 90) score -= 8;
    
    // 비디오 점수 반영 (아이컨택 가중치 증가)
    if (video.faceDetected) score += 8;

    const eyeContactValue = video.eyeContactPercentage || 0;
    console.log('📊 점수 계산:', {
      eyeContactValue,
      faceDetected: video.faceDetected,
      currentScore: score
    });

    if (video.eyeContactPercentage >= 70) score += 15; // 기존 10에서 15로 증가
    else if (video.eyeContactPercentage >= 50) score += 10; // 새로 추가
    else if (video.eyeContactPercentage >= 30) score += 5; // 새로 추가
    else if (video.eyeContactPercentage < 20) score -= 10; // 페널티 추가
    
    if (video.postureScore >= 70) score += 4;

    const finalScore = Math.max(35, Math.min(95, score));

    console.log('📊 최종 점수:', {
      baseScore: 65,
      eyeContactBonus: eyeContactValue >= 70 ? 15 : eyeContactValue >= 50 ? 10 : eyeContactValue >= 30 ? 5 : eyeContactValue < 20 ? -10 : 0,
      finalScore
    });

    return finalScore;
  };

  const currentScore = calculateCurrentScore();

  // 🎯 아이컨택 품질 등급 계산
  const getEyeContactGrade = () => {
    const percentage = video.eyeContactPercentage;
    if (percentage >= 70) return { grade: 'A', color: '#10b981', label: '우수' };
    if (percentage >= 50) return { grade: 'B', color: '#3b82f6', label: '양호' };
    if (percentage >= 30) return { grade: 'C', color: '#f59e0b', label: '보통' };
    if (percentage >= 15) return { grade: 'D', color: '#ef4444', label: '미흡' };
    return { grade: 'F', color: '#dc2626', label: '부족' };
  };

  const eyeContactGrade = getEyeContactGrade();

  // 팁 생성 함수 (3초마다 업데이트로 단축)
  const generateTips = () => {
    const currentTime = Date.now();
    const shouldUpdateTips = currentTime - lastTipUpdate > 3000; // 3초로 단축
    
    if (!shouldUpdateTips && currentTips.length > 0) {
      return currentTips;
    }
    
    const tips = [];
    
    // 🎯 아이컨택 관련 팁 우선순위 최상위
    if (video.eyeContactPercentage < 20) {
      tips.push({
        type: 'warning',
        icon: '👁️',
        message: '카메라 렌즈를 직접 보는 연습을 해보세요',
        priority: 1
      });
    } else if (video.eyeContactPercentage < 40) {
      tips.push({
        type: 'warning',
        icon: '🎯',
        message: '아이컨택을 조금 더 자주 해주세요',
        priority: 2
      });
    } else if (video.eyeContactPercentage >= 70) {
      tips.push({
        type: 'success',
        icon: '👌',
        message: '완벽한 아이컨택을 유지하고 있습니다!',
        priority: 1
      });
    } else if (video.eyeContactPercentage >= 50) {
      tips.push({
        type: 'success',
        icon: '👍',
        message: '좋은 아이컨택입니다. 이 상태를 유지하세요',
        priority: 2
      });
    }
    
    // 아이컨택 트렌드 기반 팁
    if (eyeContactTrend === 'up' && video.eyeContactPercentage >= 40) {
      tips.push({
        type: 'success',
        icon: '📈',
        message: '아이컨택이 개선되고 있습니다!',
        priority: 2
      });
    } else if (eyeContactTrend === 'down' && video.eyeContactPercentage < 50) {
      tips.push({
        type: 'warning',
        icon: '📉',
        message: '아이컨택이 줄어들고 있습니다. 집중해주세요',
        priority: 1
      });
    }
    
    // 얼굴 감지 관련
    if (!video.faceDetected) {
      tips.push({
        type: 'warning',
        icon: '👤',
        message: '카메라 앞에 얼굴을 위치시켜주세요',
        priority: 1
      });
    }
    
    // 음성 볼륨 관련
    if (audio.currentVolume < 10) {
      tips.push({
        type: 'warning',
        icon: '🔊',
        message: '목소리를 더 크게 말해주세요',
        priority: 3
      });
    } else if (audio.currentVolume > 90) {
      tips.push({
        type: 'warning',
        icon: '🔇',
        message: '목소리를 조금 더 부드럽게 해주세요',
        priority: 3
      });
    } else if (audio.currentVolume >= 20 && audio.currentVolume <= 80) {
      tips.push({
        type: 'info',
        icon: '🎤',
        message: '적절한 목소리 크기입니다',
        priority: 4
      });
    }
    
    // 습관어 관련
    if (audio.fillerWordsCount > 5) {
      tips.push({
        type: 'warning',
        icon: '🗣️',
        message: '습관어 사용을 줄여보세요',
        priority: 3
      });
    }
    
    // 전체적으로 좋은 상태일 때
    if (currentScore >= 85) {
      tips.push({
        type: 'success',
        icon: '🎉',
        message: '모든 것이 완벽합니다! 계속 유지하세요',
        priority: 1
      });
    }
    
    // 기본 격려 메시지
    if (tips.length === 0) {
      tips.push({
        type: 'info',
        icon: '💡',
        message: '자연스럽게 면접을 진행해주세요',
        priority: 5
      });
    }
    
    // 우선순위로 정렬하고 최대 3개로 제한
    const sortedTips = tips.sort((a, b) => a.priority - b.priority);
    const limitedTips = sortedTips.slice(0, 3);
    
    if (shouldUpdateTips) {
      setCurrentTips(limitedTips);
      setLastTipUpdate(currentTime);
    }
    
    return limitedTips;
  };

  // 현재 팁들 생성
  const tipsToShow = generateTips();

  // 축소된 버전 (면접 중 방해되지 않도록)
  if (isMinimized) {
    return (
      <div className={styles.realTimeOverlayMinimized}>
        <button 
          onClick={() => setIsMinimized(false)}
          className={styles.expandButton}
          title="분석 정보 펼치기"
        >
          <BarChart3 size={16} />
          <span className={styles.currentScoreText}>{currentScore}</span>
          {/* 🎯 아이컨택 등급 미니 표시 */}
          <span 
            className={styles.eyeContactMiniGrade}
            style={{ 
              backgroundColor: eyeContactGrade.color,
              marginLeft: '4px',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '10px',
              color: 'white'
            }}
          >
            {eyeContactGrade.grade}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.realTimeOverlay}>
      {/* 헤더 */}
      <div className={styles.overlayHeader}>
        <div className={styles.overlayTitle}>
          <BarChart3 size={16} />
          <span>실시간 분석</span>
        </div>
        <button 
          onClick={() => setIsMinimized(true)}
          className={styles.minimizeButton}
          title="최소화"
        >
          ×
        </button>
      </div>

      {/* 현재 점수 */}
      <div className={styles.currentScoreContainer}>
        <div className={styles.scoreCircle}>
          <span className={styles.scoreNumber}>{currentScore}</span>
          <span className={styles.scoreLabel}>점</span>
        </div>
        <div className={styles.scoreStatus}>
          {currentScore >= 80 ? (
            <span className={styles.statusGood}>
              <TrendingUp size={14} /> 우수
            </span>
          ) : currentScore >= 65 ? (
            <span className={styles.statusNormal}>
              <Users size={14} /> 양호
            </span>
          ) : currentScore >= 50 ? (
            <span className={styles.statusNormal}>
              <Target size={14} /> 보통
            </span>
          ) : (
            <span className={styles.statusNeedImprovement}>
              <TrendingDown size={14} /> 개선 필요
            </span>
          )}
        </div>
      </div>

      {/* 🎯 아이컨택 특별 섹션 추가 */}
      <div className={styles.eyeContactSpecialSection}>
        <div className={styles.eyeContactHeader}>
          <Eye size={14} />
          <span>아이컨택 분석</span>
          <span 
            className={styles.eyeContactGrade}
            style={{ backgroundColor: eyeContactGrade.color }}
          >
            {eyeContactGrade.grade}
          </span>
        </div>
        
        <div className={styles.eyeContactDetails}>
          <div className={styles.eyeContactMainMetric}>
            <div className={styles.eyeContactPercentage}>
              {video.eyeContactPercentage}%
              {process.env.NODE_ENV === 'development' && (
                <span style={{ fontSize: '10px', color: '#999', marginLeft: '4px' }}>
                  (원시: {video.rawEyeContact || 0})
                </span>
              )}
            </div>
            <div className={styles.eyeContactLabel}>
              {eyeContactGrade.label}
              {eyeContactTrend === 'up' && <span className={styles.trendUp}> ↗️</span>}
              {eyeContactTrend === 'down' && <span className={styles.trendDown}> ↘️</span>}
            </div>
          </div>
          
          <div className={styles.eyeContactProgressBar}>
            <div 
              className={styles.eyeContactProgressFill}
              style={{ 
                width: `${video.eyeContactPercentage}%`,
                backgroundColor: eyeContactGrade.color,
                transition: 'width 0.5s ease, background-color 0.3s ease'
              }}
            />
          </div>
          
          {/* 디버깅 정보 (개발 환경에서만) */}
          {process.env.NODE_ENV === 'development' && video.rawEyeContact !== undefined && (
            <div className={styles.eyeContactDebug}>
              <span>원시값: {video.rawEyeContact}%</span>
              <span>프레임: {video.eyeContactFramesCount}/{video.totalFramesCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* 실시간 메트릭들 */}
      <div className={styles.metricsContainer}>
        
        {/* 음성 분석 */}
        <div className={styles.metricSection}>
          <div className={styles.metricHeader}>
            <Mic size={14} />
            <span>음성</span>
          </div>
          
          <div className={styles.metricItems}>
            {/* 볼륨 레벨 */}
            <div className={styles.metricItem}>
              <Volume2 size={12} />
              <span>볼륨</span>
              <div className={styles.volumeBar}>
                <div 
                  className={styles.volumeFill}
                  style={{ 
                    width: `${Math.min(100, audio.currentVolume)}%`,
                    backgroundColor: audio.currentVolume >= 20 && audio.currentVolume <= 80 
                      ? '#10b981' 
                      : audio.currentVolume < 10 ? '#6b7280' : '#f59e0b'
                  }}
                />
              </div>
              <span className={styles.metricValue}>{audio.currentVolume}</span>
            </div>

            {/* 말하기 시간 */}
            <div className={styles.metricItem}>
              <span className={styles.metricIcon}>⏱️</span>
              <span>말하기</span>
              <span className={styles.metricValue}>{audio.speakingTime}초</span>
            </div>

            {/* 분당 단어수 */}
            <div className={styles.metricItem}>
              <span className={styles.metricIcon}>💬</span>
              <span>속도</span>
              <span className={styles.metricValue}>{audio.wordsPerMinute} wpm</span>
            </div>

            {/* 습관어 */}
            <div className={styles.metricItem}>
              <span className={styles.metricIcon}>🚫</span>
              <span>습관어</span>
              <span className={`${styles.metricValue} ${audio.fillerWordsCount > 3 ? styles.warning : ''}`}>
                {audio.fillerWordsCount}회
              </span>
            </div>
          </div>
        </div>

        {/* 영상 분석 (아이컨택 제외) */}
        <div className={styles.metricSection}>
          <div className={styles.metricHeader}>
            <Eye size={14} />
            <span>기타 영상</span>
          </div>
          
          <div className={styles.metricItems}>
            {/* 얼굴 감지 */}
            <div className={styles.metricItem}>
              <span className={styles.metricIcon}>👤</span>
              <span>얼굴 감지</span>
              <span className={`${styles.metricValue} ${video.faceDetected ? styles.success : styles.warning}`}>
                {video.faceDetected ? '✓' : '✗'}
              </span>
            </div>

            {/* 미소 */}
            <div className={styles.metricItem}>
              <Smile size={12} />
              <span>표정</span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${video.smileDetection}%`,
                    backgroundColor: video.smileDetection >= 30 ? '#10b981' : '#6b7280'
                  }}
                />
              </div>
              <span className={styles.metricValue}>{video.smileDetection}%</span>
            </div>

            {/* 자세 */}
            <div className={styles.metricItem}>
              <span className={styles.metricIcon}>🧍</span>
              <span>자세</span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${video.postureScore}%`,
                    backgroundColor: video.postureScore >= 70 ? '#10b981' : '#f59e0b'
                  }}
                />
              </div>
              <span className={styles.metricValue}>{video.postureScore}점</span>
            </div>
          </div>
        </div>
      </div>

      {/* 실시간 팁 - 3초마다 업데이트 */}
      <div className={styles.realTimeTips}>
        {tipsToShow.map((tip, index) => (
          <div 
            key={`${tip.type}-${index}-${lastTipUpdate}`} // 업데이트 시간 포함으로 키 변경
            className={tip.type === 'success' ? styles.tipSuccess : 
                      tip.type === 'info' ? styles.tipInfo : styles.tip}
          >
            <span className={styles.tipIcon}>{tip.icon}</span>
            <span>{tip.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeAnalysisOverlay;