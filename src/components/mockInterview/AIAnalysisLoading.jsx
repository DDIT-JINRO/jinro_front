import React, { useEffect, useState } from 'react';
import { Brain, Eye, Mic, MessageSquare } from 'lucide-react';
import commonStyles from '../../styles/mockInterview/Common.module.css';
import styles from '../../styles/mockInterview/AIAnalysisLoading.module.css';

const AIAnalysisLoading = ({ progress = 0, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    { 
      icon: Eye, 
      title: '영상 분석 중...', 
      description: '표정, 시선, 자세를 분석하고 있습니다',
      minProgress: 0,
      maxProgress: 30
    },
    { 
      icon: Mic, 
      title: '음성 분석 중...', 
      description: '목소리 톤, 발음, 말하기 속도를 분석하고 있습니다',
      minProgress: 30,
      maxProgress: 60
    },
    { 
      icon: MessageSquare, 
      title: '답변 내용 분석 중...', 
      description: '답변의 적절성과 논리성을 평가하고 있습니다',
      minProgress: 60,
      maxProgress: 85
    },
    { 
      icon: Brain, 
      title: '종합 분석 중...', 
      description: '모든 요소를 종합하여 최종 결과를 생성하고 있습니다',
      minProgress: 85,
      maxProgress: 100
    }
  ];

  // 진행률에 따라 현재 단계 업데이트
  useEffect(() => {
    const step = analysisSteps.findIndex(
      step => progress >= step.minProgress && progress < step.maxProgress
    );
    setCurrentStep(step >= 0 ? step : analysisSteps.length - 1);
  }, [progress]);

  const currentStepData = analysisSteps[currentStep];
  const StepIcon = currentStepData?.icon || Brain;

  return (
    <div className={styles.aiAnalysisLoading}>
      <div className={styles.aiLoadingContainer}>
        
        {/* 로딩 아이콘 */}
        <div className={styles.aiLoadingIcon}>
          <div className={styles.brainContainer}>
            <Brain size={64} className={styles.brainIcon} />
            <div className={styles.loadingOrbit}>
              <div className={styles.orbitItem}></div>
              <div className={styles.orbitItem}></div>
              <div className={styles.orbitItem}></div>
            </div>
          </div>
        </div>

        {/* 로딩 텍스트 */}
        <div className={styles.aiLoadingContent}>
          <h2 className={styles.aiLoadingTitle}>
            AI가 면접을 분석하고 있습니다
          </h2>
          <p className={styles.aiLoadingSubtitle}>
            잠시만 기다려주세요. 곧 상세한 분석 결과를 제공해드립니다.
          </p>
        </div>

        {/* 진행률 바 */}
        <div className={styles.aiProgressContainer}>
          <div className={styles.aiProgressBar}>
            <div 
              className={styles.aiProgressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.aiProgressText}>
            {progress}% 완료
          </div>
        </div>

        {/* 현재 분석 단계 */}
        <div className={styles.aiCurrentStep}>
          <div className={styles.stepIcon}>
            <StepIcon size={24} />
          </div>
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>
              {currentStepData?.title || '분석 준비 중...'}
            </h3>
            <p className={styles.stepDescription}>
              {currentStepData?.description || '분석을 시작합니다...'}
            </p>
          </div>
        </div>

        {/* 분석 단계 인디케이터 */}
        <div className={styles.stepsIndicator}>
          {analysisSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = progress > step.maxProgress;
            const isCurrent = index === currentStep;
            
            return (
              <div 
                key={index}
                className={`
                  ${styles.stepIndicator} 
                  ${isCompleted ? styles.completed : ''} 
                  ${isCurrent ? styles.current : ''}
                `}
              >
                <div className={styles.stepIndicatorIcon}>
                  <StepIcon size={16} />
                </div>
                <span className={styles.stepIndicatorLabel}>
                  {step.title.replace(' 중...', '')}
                </span>
              </div>
            );
          })}
        </div>

        {/* 분석 정보 */}
        <div className={styles.aiAnalysisInfo}>
          <div className={styles.analysisInfoGrid}>
            <div className={styles.analysisInfoItem}>
              <Eye size={20} />
              <div>
                <div className={styles.infoLabel}>영상 분석</div>
                <div className={styles.infoDescription}>표정, 시선, 자세</div>
              </div>
            </div>
            <div className={styles.analysisInfoItem}>
              <Mic size={20} />
              <div>
                <div className={styles.infoLabel}>음성 분석</div>
                <div className={styles.infoDescription}>톤, 속도, 명확성</div>
              </div>
            </div>
            <div className={styles.analysisInfoItem}>
              <MessageSquare size={20} />
              <div>
                <div className={styles.infoLabel}>내용 분석</div>
                <div className={styles.infoDescription}>답변 품질, 논리성</div>
              </div>
            </div>
            <div className={styles.analysisInfoItem}>
              <Brain size={20} />
              <div>
                <div className={styles.infoLabel}>종합 평가</div>
                <div className={styles.infoDescription}>개인별 맞춤 피드백</div>
              </div>
            </div>
          </div>
        </div>

        {/* 취소 버튼 */}
        {onCancel && (
          <button 
            onClick={onCancel}
            className={`${commonStyles.btn} ${commonStyles.btnSecondary} ${commonStyles.cancelButton}`}
          >
            분석 취소
          </button>
        )}

        {/* 분석 팁 */}
        <div className={styles.analysisTips}>
          <h4>💡 분석 결과 활용 팁</h4>
          <ul>
            <li>🎯 개인별 맞춤 피드백으로 약점을 파악하세요</li>
            <li>📊 점수별 세부 분석으로 구체적인 개선 방향을 확인하세요</li>
            <li>🎥 녹화 영상을 통해 객관적인 자기 모습을 확인하세요</li>
            <li>📋 분석 보고서를 저장하여 지속적인 발전에 활용하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisLoading;