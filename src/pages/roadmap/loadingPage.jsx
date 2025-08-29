import React, { useState, useEffect } from 'react';

function LoadingPage({ isApiCompleted = false, onProgressComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      title: "데이터 수집 중...",
      description: "로드맵 정보를 분석하고 있습니다",
      icon: "📊"
    },
    {
      title: "AI 분석 진행 중...",
      description: "각 단계별 데이터를 처리하고 있습니다",
      icon: "🧠"
    },
    {
      title: "맞춤형 결과 생성 중...",
      description: "개인화된 분석 결과를 준비하고 있습니다",
      icon: "⚡"
    },
    {
      title: "최종 검토 중...",
      description: "분석 결과를 최적화하고 있습니다",
      icon: "✨"
    }
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000); // 2초마다 단계 변경

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // API가 완료되지 않았으면 90%까지만 채우기
        const maxProgress = isApiCompleted ? 100 : 90;
        if (prev < maxProgress) {
          return Math.min(prev + 1.125, maxProgress); // 8초 동안 90%까지 (90/80 = 1.125)
        }
        return prev;
      });
    }, 100); // 0.1초마다 체크

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isApiCompleted]);

  // API 완료 시 마지막 10% 채우기
  useEffect(() => {
    if (isApiCompleted && progress >= 90) {
      const finalProgressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 100) {
            return Math.min(prev + 2, 100); // 빠르게 100%까지 채우기
          } else {
            // 100% 완료되면 부모 컴포넌트에 알림
            if (onProgressComplete) {
              onProgressComplete();
            }
            return prev;
          }
        });
      }, 50); // 0.05초마다 2%씩 증가

      return () => clearInterval(finalProgressInterval);
    }
  }, [isApiCompleted, progress, onProgressComplete]);

  return (
    <div className="loading-overlay">
      <style>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .loading-container {
          text-align: center;
          max-width: 400px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .step-icon {
          font-size: 3rem;
          margin-bottom: 20px;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 10px;
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards;
        }

        .step-description {
          font-size: 1rem;
          opacity: 0.8;
          margin-bottom: 30px;
          opacity: 0;
          animation: fadeInUp 0.5s ease-out 0.2s forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .progress-container {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
          border-radius: 4px;
          transition: width 0.1s ease;
          position: relative;
        }

        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .progress-text {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 20px;
        }

        .steps-indicator {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .step-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .step-dot.active {
          background: #4facfe;
          transform: scale(1.2);
        }

        .step-dot.completed {
          background: #00f2fe;
        }

        .loading-tips {
          margin-top: 30px;
          font-size: 0.85rem;
          opacity: 0.7;
          font-style: italic;
        }

        .pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>

      <div className="loading-container">
        <div className="step-icon pulse">
          {steps[currentStep].icon}
        </div>
        
        <h2 className="step-title" key={`title-${currentStep}`}>
          {steps[currentStep].title}
        </h2>
        
        <p className="step-description" key={`desc-${currentStep}`}>
          {steps[currentStep].description}
        </p>

        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="progress-text">
          {Math.floor(progress)}% 완료
        </div>

        <div className="steps-indicator">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`step-dot ${
                index === currentStep ? 'active' : 
                index < currentStep ? 'completed' : ''
              }`}
            ></div>
          ))}
        </div>

        <div className="loading-tips">
          💡 AI가 당신만의 맞춤형 로드맵 결과를 준비하고 있어요!
        </div>
      </div>
    </div>
  );
}

export default LoadingPage;