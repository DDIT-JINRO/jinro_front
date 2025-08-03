// 🤖 AIAnalysisResult.jsx - 최적화된 면접 분석 결과 컴포넌트

import React, { useState, useEffect, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Brain, Eye, Mic, TrendingUp, TrendingDown, Star, BarChart3,
  Download, Play, ArrowLeft, MessageSquare, Clock, Target,
  CheckCircle, AlertCircle, Users, Smile
} from 'lucide-react';
import commonStyles from '../../styles/mockInterview/Common.module.css';
import styles from '../../styles/mockInterview/AIAnalysisResult.module.css';

import { 
  getScoreColor, 
  getScoreGrade, 
  getScoreStatus,
  getScoreIcon,
  DEFAULT_ANALYSIS,
  SCORE_THRESHOLDS,
  calculateCircularProgress,
  isValidScore
} from '../../utils/mockInterview/scoreUtils';

const AIAnalysisResult = ({ 
  analysisResult, 
  recordedVideoURL,
  onBack,
  isRealTimeAnalysis = false,
  interviewQuestions = [],
  interviewAnswers = [],
  realTimeData = {}
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef(null);

  // 🎯 PDF 생성 함수
  const generatePDF = async () => {
    console.log('🎯 PDF 생성 시작...');
    setIsGeneratingPDF(true);
    
    try {
      // 1. PDF 내용 HTML 생성
      const htmlContent = generatePDFContent();
      console.log('📄 HTML 내용 생성 완료');

      // 2. 임시 컨테이너 생성
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm';
      tempContainer.style.background = 'white';
      tempContainer.style.padding = '20mm';
      tempContainer.style.fontFamily = "'Malgun Gothic', '맑은 고딕', Arial, sans-serif";
      
      document.body.appendChild(tempContainer);
      tempContainer.innerHTML = htmlContent;

      console.log('📦 임시 컨테이너 생성 완료');

      // 3. html2canvas로 캡처
      console.log('📸 캔버스 캡처 시작...');
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false, // 로그 비활성화
        width: tempContainer.offsetWidth,
        height: tempContainer.offsetHeight,
        onclone: (clonedDoc) => {
          // 복제된 문서에서 폰트 적용 확인
          const clonedContainer = clonedDoc.querySelector('div');
          if (clonedContainer) {
            clonedContainer.style.fontFamily = "'Malgun Gothic', '맑은 고딕', Arial, sans-serif";
          }
        }
      });

      console.log('✅ 캔버스 캡처 완료');

      // 4. PDF 생성
      const imgData = canvas.toDataURL('image/png', 0.95); // 품질 조정
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width
      const pageHeight = 295; // A4 height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // 첫 페이지 추가
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 필요시 추가 페이지
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 5. 파일 다운로드
      const fileName = `면접분석보고서_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      console.log('✅ PDF 다운로드 완료:', fileName);

      // 6. 정리
      document.body.removeChild(tempContainer);
      
    } catch (error) {
      console.error('❌ PDF 생성 중 오류:', error);
      
      // 상세 오류 메시지
      let errorMessage = 'PDF 생성 중 오류가 발생했습니다.';
      if (error.message.includes('html2canvas')) {
        errorMessage += '\n화면 캡처 중 문제가 발생했습니다.';
      } else if (error.message.includes('jsPDF')) {
        errorMessage += '\nPDF 파일 생성 중 문제가 발생했습니다.';
      }
      
      alert(errorMessage);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 🎯 PDF 내용 HTML 생성
  const generatePDFContent = () => {
    const analysis = { ...DEFAULT_ANALYSIS, ...analysisResult };
    const { overallScore, grade, scores, detailed, summary } = analysis;
    const reportDate = new Date().toLocaleString('ko-KR');

    const generateScoreCard = (title, score) => `
      <div style="text-align: center; padding: 20px; background: white; border-radius: 10px; border: 1px solid #e2e8f0;">
        <div style="font-size: 14px; color: #64748b; margin-bottom: 8px;">${title}</div>
        <div style="font-size: 24px; font-weight: bold; color: ${getScoreColor(score)};">${score}</div>
        <div style="font-size: 12px; color: #94a3b8;">점</div>
      </div>
    `;

    const generateMetricItem = (label, value, unit) => `
      <div style="padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center;">
        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">${label}</div>
        <div style="font-size: 16px; font-weight: bold; color: #1e293b;">${value}${unit}</div>
      </div>
    `;

    return `
      <div style="max-width: 170mm; margin: 0 auto; line-height: 1.6; font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif;">
        <!-- 헤더 -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border-radius: 15px;">
          <h1 style="margin: 0 0 10px 0; font-size: 28px;">🤖 AI 모의면접 분석 보고서</h1>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">음성과 영상을 종합적으로 분석했습니다</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">📅 ${reportDate}</p>
        </div>

        <!-- 종합 점수 -->
        <div style="margin-bottom: 30px; padding: 25px; background: #f8fafc; border-radius: 15px; border: 2px solid #e2e8f0;">
          <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">📊 종합 분석 결과</h2>
          
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 25px;">
            <div style="width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(${getScoreColor(overallScore)} ${overallScore * 3.6}deg, #e2e8f0 0deg); display: flex; align-items: center; justify-content: center; position: relative;">
              <div style="width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <div style="font-size: 24px; font-weight: bold; color: ${getScoreColor(overallScore)};">${overallScore}</div>
                <div style="font-size: 12px; color: #64748b;">점</div>
              </div>
            </div>
            <div style="margin-left: 30px;">
              <div style="font-size: 32px; font-weight: bold; color: #1e293b; margin-bottom: 5px;">${grade}</div>
              <div style="font-size: 16px; color: #64748b; max-width: 200px;">${summary.recommendation || '분석이 완료되었습니다'}</div>
            </div>
          </div>

          <!-- 세부 점수 -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
            ${generateScoreCard('🎤 음성 표현력', scores.communication || 0)}
            ${generateScoreCard('👁️ 시각적 인상', scores.appearance || 0)}
            ${generateScoreCard('📝 답변 내용', scores.content || 0)}
          </div>
        </div>

        <!-- 강점과 개선사항 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 30px;">
          <div style="padding: 25px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 15px; border: 2px solid #22c55e;">
            <h3 style="margin: 0 0 15px 0; color: #15803d; font-size: 18px;">💪 강점 분석</h3>
            ${(summary.strengths || ['성실한 면접 참여 태도']).map(strength => 
              `<div style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 8px;">
                <span style="color: #22c55e;">✓</span>
                <span style="font-size: 14px; color: #166534;">${strength}</span>
              </div>`
            ).join('')}
          </div>
          
          <div style="padding: 25px; background: linear-gradient(135deg, #fffbeb, #fef3c7); border-radius: 15px; border: 2px solid #f59e0b;">
            <h3 style="margin: 0 0 15px 0; color: #d97706; font-size: 18px;">🔧 개선사항</h3>
            ${(summary.improvements || ['지속적인 면접 연습으로 자신감 향상']).map(improvement => 
              `<div style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 8px;">
                <span style="color: #f59e0b;">🎯</span>
                <span style="font-size: 14px; color: #92400e;">${improvement}</span>
              </div>`
            ).join('')}
          </div>
        </div>

        <!-- 세부 분석 -->
        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">🔍 세부 분석</h2>
          
          <!-- 음성 분석 -->
          <div style="margin-bottom: 25px; padding: 25px; background: white; border-radius: 15px; border: 2px solid #3b82f6;">
            <h3 style="margin: 0 0 15px 0; color: #3b82f6; font-size: 18px;">🎤 음성 분석</h3>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
              <p style="margin: 0; font-size: 14px; color: #334155;">${detailed.audio?.feedback || '음성 분석이 완료되었습니다.'}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              ${generateMetricItem('발음 명확도', detailed.audio?.speechClarity || 0, '점')}
              ${generateMetricItem('말하기 속도', detailed.audio?.paceAppropriate || 0, '점')}
            </div>
          </div>

          <!-- 영상 분석 -->
          <div style="margin-bottom: 25px; padding: 25px; background: white; border-radius: 15px; border: 2px solid #10b981;">
            <h3 style="margin: 0 0 15px 0; color: #10b981; font-size: 18px;">👁️ 영상 분석</h3>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
              <p style="margin: 0; font-size: 14px; color: #166534;">${detailed.video?.feedback || '영상 분석이 완료되었습니다.'}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              ${generateMetricItem('아이컨택', detailed.video?.eyeContact || 0, '점')}
              ${generateMetricItem('표정 관리', detailed.video?.facialExpression || 0, '점')}
            </div>
          </div>
        </div>

        <!-- 질문별 답변 분석 -->
        ${interviewQuestions.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px;">📝 질문별 답변 분석</h2>
            ${interviewQuestions.map((question, index) => {
              const answer = interviewAnswers[index] || '답변 없음';
              const wordCount = answer !== '답변 없음' ? answer.split(/\s+/).filter(word => word.length > 0).length : 0;
              
              return `
                <div style="margin-bottom: 20px; padding: 20px; background: white; border-radius: 10px; border: 1px solid #e2e8f0;">
                  <h4 style="margin: 0 0 10px 0; color: #3b82f6; font-size: 16px;">질문 ${index + 1}</h4>
                  <p style="margin: 0 0 15px 0; font-size: 14px; color: #1e293b; font-weight: 500;">${question}</p>
                  <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                    <p style="margin: 0; font-size: 14px; color: #334155;">${answer}</p>
                  </div>
                  <div style="display: flex; gap: 20px; font-size: 12px; color: #64748b;">
                    <span>답변 길이: ${answer.length}자</span>
                    <span>단어 수: ${wordCount}개</span>
                    <span>완성도: ${answer !== '답변 없음' ? '완료' : '미완료'}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        <!-- 푸터 -->
        <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 10px; margin-top: 40px;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">
            🔒 본 분석은 모두 브라우저에서 처리되었으며, 어떠한 개인정보도 외부 서버로 전송되지 않았습니다.
          </p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">
            보고서 생성 시간: ${reportDate}
          </p>
        </div>
      </div>
    `;
  };

  // 🎯 점수 카드 생성 함수
  const generateScoreCard = (title, score) => `
    <div style="text-align: center; padding: 20px; background: white; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="font-size: 14px; color: #64748b; margin-bottom: 8px;">${title}</div>
      <div style="font-size: 24px; font-weight: bold; color: ${getScoreColor(score)};">${score}</div>
      <div style="font-size: 12px; color: #94a3b8;">점</div>
    </div>
  `;

  // 🎯 메트릭 아이템 생성 함수
  const generateMetricItem = (label, value, unit) => `
    <div style="padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center;">
      <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">${label}</div>
      <div style="font-size: 16px; font-weight: bold; color: #1e293b;">${value}${unit}</div>
    </div>
  `;

  const handleDownloadReport = async () => {
    await generatePDF(); // PDF 생성 추가
  };

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

  // 🎯 원형 점수 표시 컴포넌트
  const CircularScore = ({ score, label, color, size = 180 }) => {
  const validScore = isValidScore(score) ? score : 0;
  const scoreColor = color || getScoreColor(validScore);
  
  // 원형 진행바 계산
  const radius = 72; // 고정 반지름 (size의 40% 정도)
  const circumference = 2 * Math.PI * radius; // 원둘레 계산
  const progress = (validScore / 100) * circumference; // 점수에 따른 진행 길이
  const dashOffset = circumference - progress; // 진행되지 않은 부분
  
  const center = size / 2; // 중심점 (90)

  return (
    <div className={styles.scoreSection}>
      <div className={styles.circularScore} style={{ position: 'relative', width: size, height: size }}>
        <svg 
          width={size} 
          height={size} 
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* 배경 원 */}
          <circle
            cx={center} 
            cy={center} 
            r={radius}
            stroke="#e5e7eb" 
            strokeWidth="12" 
            fill="transparent"
          />
          
          {/* 진행 원 */}
          <circle
            cx={center} 
            cy={center} 
            r={radius}
            stroke={scoreColor} 
            strokeWidth="12" 
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ 
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.3))'
            }}
          />
        </svg>
        
        {/* 중앙 텍스트 */}
        <div 
          className={styles.circularScoreText}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          <div 
            className={styles.circularScoreValue}
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: scoreColor,
              lineHeight: '1'
            }}
          >
            {validScore}
          </div>
          <div 
            style={{
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '4px'
            }}
          >
            점
          </div>
        </div>
      </div>
      
      <div 
        className={styles.circularScoreLabel}
        style={{
          marginTop: '12px',
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          textAlign: 'center'
        }}
      >
        {label}
      </div>
    </div>
  );
};

  // 🎯 진행 바 컴포넌트 (기본형)
  const ProgressBar = ({ score, label, icon: Icon, maxValue = 100 }) => {
    const validScore = isValidScore(score) ? score : 0;
    const scoreColor = getScoreColor(validScore);
    const scoreIcon = getScoreIcon(validScore);
    
    return (
      <div className={styles.progressItem}>
        <div className={styles.progressHeader}>
          <div className={styles.progressLabel}>
            {Icon && <Icon size={20} />}
            <span>{label}</span>
            <span className={styles.scoreIcon}>{scoreIcon}</span>
          </div>
          <span className={styles.progressValue} style={{ color: scoreColor }}>
            {validScore}{validScore < maxValue ? '점' : ''}
          </span>
        </div>
        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressBarFill}
            style={{ 
              width: `${Math.min(100, (validScore / maxValue) * 100)}%`,
              backgroundColor: scoreColor
            }}
          />
        </div>
      </div>
    );
  };

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
                {analysis.analysisMethod?.includes('Gemini') ? 'Gemini AI 전문가' : '실시간'} 면접 분석 결과
              </h1>
              <p>음성과 영상을 종합적으로 분석했습니다</p>
            </div>
          </div>

          <button 
            onClick={handleDownloadReport}
            disabled={isGeneratingPDF}
            className={`${commonStyles.btn} ${commonStyles.btnPrimary}`}
          >
            <Download size={16} />
            {isGeneratingPDF ? 'PDF 생성 중...' : '분석 보고서 다운로드'}
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