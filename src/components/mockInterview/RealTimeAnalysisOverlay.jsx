import React, { useState, useEffect, useRef } from 'react';
import { Eye, Mic, Volume2, Smile, Users, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import styles from '../../styles/mockInterview/MockInterview.module.css';

const RealTimeAnalysisOverlay = ({ analysisData }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTips, setCurrentTips] = useState([]);
  const [lastTipUpdate, setLastTipUpdate] = useState(0);
  
  // 이전 데이터를 저장해서 급격한 변화 방지
  const prevDataRef = useRef({
    faceDetected: false,
    eyeContactPercentage: 0,
    currentVolume: 0
  });
  
  if (!analysisData) return null;

  const { audio, video } = analysisData;

  // 전체 점수 계산 (실시간 예상 점수) - 안정화됨
  const calculateCurrentScore = () => {
    let score = 70; // 기본 점수
    
    // 오디오 점수 반영
    if (audio.currentVolume >= 20 && audio.currentVolume <= 80) score += 5;
    if (audio.currentVolume < 10 || audio.currentVolume > 90) score -= 5;
    
    // 비디오 점수 반영
    if (video.faceDetected) score += 10;
    if (video.eyeContactPercentage >= 60) score += 10;
    if (video.postureScore >= 70) score += 5;
    
    return Math.max(40, Math.min(95, score));
  };

  const currentScore = calculateCurrentScore();

  // 팁 생성 함수 (5초마다 업데이트)
  const generateTips = () => {
    const currentTime = Date.now();
    const shouldUpdateTips = currentTime - lastTipUpdate > 5000; // 5초마다 업데이트
    
    if (!shouldUpdateTips && currentTips.length > 0) {
      return currentTips;
    }
    
    const tips = [];
    
    // 얼굴 감지 관련
    if (!video.faceDetected) {
      tips.push({
        type: 'warning',
        icon: '👤',
        message: '카메라 앞에 얼굴을 위치시켜주세요'
      });
    }
    
    // 음성 볼륨 관련
    if (audio.currentVolume < 10) {
      tips.push({
        type: 'warning',
        icon: '🔊',
        message: '목소리를 더 크게 말해주세요'
      });
    } else if (audio.currentVolume > 90) {
      tips.push({
        type: 'warning',
        icon: '🔇',
        message: '목소리를 조금 더 부드럽게 해주세요'
      });
    }
    
    // 아이컨택 관련 (얼굴이 감지된 경우에만)
    if (video.faceDetected && video.eyeContactPercentage < 40) {
      tips.push({
        type: 'warning',
        icon: '👁️',
        message: '카메라를 더 자주 봐주세요'
      });
    }
    
    // 습관어 관련
    if (audio.fillerWordsCount > 5) {
      tips.push({
        type: 'warning',
        icon: '🗣️',
        message: '습관어 사용을 줄여보세요'
      });
    }
    
    // 좋은 상태일 때 격려 메시지
    if (currentScore >= 80) {
      tips.push({
        type: 'success',
        icon: '🎉',
        message: '훌륭합니다! 이 상태를 유지하세요'
      });
    } else if (video.faceDetected && video.eyeContactPercentage > 60) {
      tips.push({
        type: 'success',
        icon: '✨',
        message: '좋은 아이컨택을 유지하고 있습니다'
      });
    } else if (audio.currentVolume >= 20 && audio.currentVolume <= 80) {
      tips.push({
        type: 'success',
        icon: '🎤',
        message: '적절한 목소리 크기입니다'
      });
    }
    
    // 팁이 없으면 기본 메시지
    if (tips.length === 0) {
      tips.push({
        type: 'info',
        icon: '💡',
        message: '자연스럽게 면접을 진행해주세요'
      });
    }
    
    // 팁이 너무 많으면 최대 3개로 제한
    const limitedTips = tips.slice(0, 3);
    
    if (shouldUpdateTips) {
      setCurrentTips(limitedTips);
      setLastTipUpdate(currentTime);
    }
    
    return limitedTips;
  };

  // 안정화된 얼굴 감지 상태 (급격한 변화 방지)
  const getStabilizedFaceDetection = () => {
    const current = video.faceDetected;
    const previous = prevDataRef.current.faceDetected;
    
    // 이전 상태와 다르면 잠시 대기 후 업데이트
    if (current !== previous) {
      setTimeout(() => {
        prevDataRef.current.faceDetected = current;
      }, 200);
      return previous; // 이전 상태 유지
    }
    
    return current;
  };

  const stabilizedFaceDetected = getStabilizedFaceDetection();

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
              <TrendingUp size={14} /> 좋음
            </span>
          ) : currentScore >= 60 ? (
            <span className={styles.statusNormal}>
              <Users size={14} /> 보통
            </span>
          ) : (
            <span className={styles.statusNeedImprovement}>
              <TrendingDown size={14} /> 개선 필요
            </span>
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

        {/* 영상 분석 */}
        <div className={styles.metricSection}>
          <div className={styles.metricHeader}>
            <Eye size={14} />
            <span>영상</span>
          </div>
          
          <div className={styles.metricItems}>
            {/* 얼굴 감지 - 안정화됨 */}
            <div className={styles.metricItem}>
              <span className={styles.metricIcon}>👤</span>
              <span>얼굴 감지</span>
              <span className={`${styles.metricValue} ${stabilizedFaceDetected ? styles.success : styles.warning}`}>
                {stabilizedFaceDetected ? '✓' : '✗'}
              </span>
            </div>

            {/* 아이컨택 */}
            <div className={styles.metricItem}>
              <Eye size={12} />
              <span>아이컨택</span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${video.eyeContactPercentage}%`,
                    backgroundColor: video.eyeContactPercentage >= 60 ? '#10b981' : '#f59e0b'
                  }}
                />
              </div>
              <span className={styles.metricValue}>{video.eyeContactPercentage}%</span>
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

      {/* 실시간 팁 - 5초마다 업데이트 */}
      <div className={styles.realTimeTips}>
        {tipsToShow.map((tip, index) => (
          <div 
            key={`${tip.type}-${index}`}
            className={tip.type === 'success' ? styles.tipSuccess : styles.tip}
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