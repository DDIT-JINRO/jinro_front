// 🤖 AIAnalysisResult.jsx - PDF 다운로드 수정 버전

import React, { useState, useEffect, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Brain, Eye, Mic, TrendingUp, TrendingDown, Star, BarChart3, BarChart2,
  Download, Play, ArrowLeft, MessageSquare, Clock, Target,
  CheckCircle, AlertCircle, Users, Smile
} from 'lucide-react';
import commonStyles from '../../styles/mockInterview/Common.module.css';
import styles from '../../styles/mockInterview/AIAnalysisResult.module.css';
import geminiIcon from '../../assets/gemini-icon.png';

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
import { useModal } from "../../context/ModalContext.jsx";
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
  const { showAlert } = useModal();

  // 🎯 PDF 생성 함수 (오류 완전 해결 버전)
  const generatePDF = async () => {
    if (!reportRef.current) {
      showAlert(
          "보고서 참조를 찾을 수 없습니다.",
          "",
          () => {return;} // 확인 버튼 클릭 시 실행할 동작 (없으면 빈 함수)
      );
    }

    setIsGeneratingPDF(true);
    
    // 현재 탭 저장 (함수 시작 부분에서)
    const currentTab = activeTab;
    
    try {      
      // PDF 문서 설정
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // PDF 다운로드 버튼 숨기기 (직접적인 방법)
      const downloadButton = document.querySelector('button[disabled]') || 
                           document.querySelector('button:has([class*="Download"])') ||
                           Array.from(document.querySelectorAll('button')).find(btn => 
                             btn.textContent.includes('PDF') || btn.textContent.includes('다운로드')
                           );
      
      const originalButtonDisplay = downloadButton ? downloadButton.style.display : '';
      if (downloadButton) {
        downloadButton.style.display = 'none';
      }

      // 색상 복원 함수 (강화된 버전)
      const restoreFeedbackColors = (colorData) => {
        if (colorData && colorData.elements) {
          colorData.elements.forEach((el, index) => {
            if (el && el.style) {
              el.style.color = colorData.colors[index] || '';
              el.style.removeProperty('color');
            }
          });
        }
      };

      // 첫 번째 페이지: 종합 분석 (분석 방법 제외)
      setActiveTab('overview');
      await new Promise(resolve => setTimeout(resolve, 800));

      // 분석 방법 섹션만 숨기기 (첫 번째 페이지에서만)
      const analysisMethodSection = document.querySelector(`.${styles.analysisMethodInfo}`);
      const originalMethodDisplay = analysisMethodSection ? analysisMethodSection.style.display : '';
      if (analysisMethodSection) {
        analysisMethodSection.style.display = 'none';
      }

      // html2canvas에 더 강력한 옵션 적용
      const overviewCanvas = await html2canvas(reportRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        foreignObjectRendering: false,
        removeContainer: true,
        async: true,
      });

      // 분석 방법 섹션 복원
      if (analysisMethodSection) {
        analysisMethodSection.style.display = originalMethodDisplay;
      }

      // 첫 번째 페이지 추가
      await addCanvasToPDF(pdf, overviewCanvas, contentWidth, pageHeight, margin, true);

      // 두 번째 페이지: 세부 분석 + 분석 방법
      setActiveTab('detailed');
      await new Promise(resolve => setTimeout(resolve, 800));

      // 헤더와 종합 점수 섹션만 숨기기
      const analysisHeader = document.querySelector(`.${styles.analysisHeader}`);
      const aiScoreSummary = document.querySelector(`.${styles.aiScoreSummary}`);
      
      const originalHeaderDisplay = analysisHeader ? analysisHeader.style.display : '';
      const originalSummaryDisplay = aiScoreSummary ? aiScoreSummary.style.display : '';

      if (analysisHeader) analysisHeader.style.display = 'none';
      if (aiScoreSummary) aiScoreSummary.style.display = 'none';

      // html2canvas에 더 강력한 옵션 적용 (두 번째 페이지)
      const detailedCanvas = await html2canvas(reportRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        foreignObjectRendering: false,
        removeContainer: true,
        async: true,
      });

      // 숨긴 요소들 복원
      if (analysisHeader) analysisHeader.style.display = originalHeaderDisplay;
      if (aiScoreSummary) aiScoreSummary.style.display = originalSummaryDisplay;

      // 두 번째 페이지 추가
      await addCanvasToPDF(pdf, detailedCanvas, contentWidth, pageHeight, margin, false);

      // 질문별 답변 분석 페이지 추가
      if (interviewQuestions.length > 0) {
        await addQuestionsPageAsImage(pdf, interviewQuestions, interviewAnswers, margin, contentWidth, pageHeight);
      }

      // PDF 다운로드 버튼 복원
      if (downloadButton) {
        downloadButton.style.display = originalButtonDisplay;
      }

      // 파일명 생성 및 다운로드
      const fileName = `면접분석보고서_${new Date().toISOString().slice(0, 10)}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      showAlert(
          "✅ PDF 보고서가 다운로드되었습니다!",
          "",
          () => {setActiveTab(currentTab);} // 확인 버튼 클릭 시 실행할 동작 (없으면 빈 함수)
      );

      
    } catch (error) {
      console.error('❌ PDF 생성 중 오류:', error);
      showAlert(
          "PDF 생성 중 오류가 발생했습니다: ${error.message}",
          "다시 시도해주세요.",
          () => {} // 확인 버튼 클릭 시 실행할 동작 (없으면 빈 함수)
      );

      // 에러 발생 시 모든 요소 복원
      try {
        const analysisMethodSection = document.querySelector(`.${styles.analysisMethodInfo}`);
        const analysisHeader = document.querySelector(`.${styles.analysisHeader}`);
        const aiScoreSummary = document.querySelector(`.${styles.aiScoreSummary}`);
        const downloadButton = document.querySelector('button[disabled]') || 
                             Array.from(document.querySelectorAll('button')).find(btn => 
                               btn.textContent.includes('PDF') || btn.textContent.includes('다운로드')
                             );
        
        if (analysisMethodSection) analysisMethodSection.style.display = '';
        if (analysisHeader) analysisHeader.style.display = '';
        if (aiScoreSummary) aiScoreSummary.style.display = '';
        if (downloadButton) downloadButton.style.display = '';
        
        // 전문가 피드백 색상도 복원 (모든 구조 포함)
        const progressFeedbackHeaders = document.querySelectorAll(`.${styles.feedbackHeader} span`);
        const progressFeedbackContents = document.querySelectorAll(`.${styles.feedbackContent} p`);
        const analysisFeedbackHeaders = document.querySelectorAll(`.${styles.analysisSection} .${styles.feedbackBox} h4`);
        const analysisFeedbackContents = document.querySelectorAll(`.${styles.analysisSection} .${styles.feedbackBox} p`);
        
        const allFeedbackElements = [
          ...progressFeedbackHeaders, 
          ...progressFeedbackContents,
          ...analysisFeedbackHeaders,
          ...analysisFeedbackContents
        ];
        
        allFeedbackElements.forEach(el => {
          if (el && el.style) {
            el.style.color = '';
            el.style.removeProperty('color');
          }
        });
        
        // 추가된 스타일 요소들 제거
        const tempStyleElement1 = document.getElementById('pdf-feedback-style');
        const tempStyleElement2 = document.getElementById('pdf-feedback-style-2');
        if (tempStyleElement1) tempStyleElement1.remove();
        if (tempStyleElement2) tempStyleElement2.remove();
        
        // 원래 탭으로 복원
        setActiveTab(currentTab);
      } catch (restoreError) {
        console.error('복원 중 오류:', restoreError);
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 🎯 캔버스를 PDF에 추가하는 공통 함수
  const addCanvasToPDF = async (pdf, canvas, contentWidth, pageHeight, margin, isFirstPage) => {
    const imgData = canvas.toDataURL('image/png', 0.8);
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // 페이지 분할 처리
    let remainingHeight = imgHeight;
    let currentY = 0;
    const maxHeightPerPage = pageHeight - margin;
    let pageCount = 0;

    while (remainingHeight > 0) {
      if (pageCount > 0 || !isFirstPage) {
        pdf.addPage();
      }

      const heightToAdd = Math.min(remainingHeight, maxHeightPerPage);
      const sy = currentY * (canvas.height / imgHeight);
      const sh = heightToAdd * (canvas.height / imgHeight);

      // 해당 영역만 임시 캔버스에 그리기
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = sh;

      tempCtx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);
      const tempImgData = tempCanvas.toDataURL('image/png', 0.8);

      pdf.addImage(
        tempImgData, 
        'PNG', 
        margin, 
        margin, 
        imgWidth, 
        heightToAdd
      );

      remainingHeight -= heightToAdd;
      currentY += heightToAdd;
      pageCount++;
    }
  };

  const handleDownloadReport = async () => {
    await generatePDF();
  };

  // 🎯 안전한 분석 데이터 추출
  const analysis = useMemo(() => ({
    ...DEFAULT_ANALYSIS,
    ...analysisResult
  }), [analysisResult]);

  const { overallScore, grade, scores, detailed, summary } = analysis;

  // 🎯 원형 점수 표시 컴포넌트
  const CircularScore = ({ score, label, color, size = 180 }) => {
    const validScore = isValidScore(score) ? score : 0;
    const scoreColor = color || getScoreColor(validScore);
    
    const radius = 72;
    const circumference = 2 * Math.PI * radius;
    const progress = (validScore / 100) * circumference;
    const dashOffset = circumference - progress;
    
    const center = size / 2;

    return (
      <div className={styles.scoreSection}>
        <div className={styles.circularScore} style={{ position: 'relative', width: size, height: size }}>
          <svg 
            width={size} 
            height={size} 
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle
              cx={center} 
              cy={center} 
              r={radius}
              stroke="#e5e7eb" 
              strokeWidth="12" 
              fill="transparent"
            />
            
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

  // 🎯 피드백이 포함된 진행 바 컴포넌트 (검정색 텍스트)
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
            <img src={geminiIcon} style={{width : 20, height : 20}}/>
            <span>AI 전문가 피드백</span>
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

  // 🎯 분석 섹션 컴포넌트 (검정색 텍스트)
  const AnalysisSection = ({ icon: Icon, title, feedback, metrics, iconColor }) => (
    <div className={styles.analysisSection}>
      <div className={styles.sectionHeader}>
        <Icon size={24} style={{ color: iconColor }} />
        <h3>{title}</h3>
      </div>
      <div className={styles.sectionContent}>
        {feedback && (
          <div className={styles.feedbackBox}>
            <h4>전문가 피드백</h4>
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
    { id: 'overview', label: '종합 분석', icon: BarChart2 },
    { id: 'detailed', label: '세부 분석', icon: BarChart3 },
    ...(recordedVideoURL ? [{ id: 'video', label: '면접 영상', icon: Play }] : [])
  ];

  // 🎯 에러 상태 처리
  if (!analysisResult) {
    return (
      <div className={`${commonStyles.mockInterviewContainer} ${styles.aiAnalysisResult}`}>
        <div className={styles.analysisError}>
          <img src={geminiIcon} style={{width : 64, height : 64}}/>
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
    <div className={`${commonStyles.mockInterviewContainer} ${styles.aiAnalysisResult}`} ref={reportRef}>
      <div className={styles.analysisContent}>
        
        {/* 🎯 헤더 */}
        <div className={styles.analysisHeader}>
          <button onClick={onBack} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          
          <div className={styles.headerContent}>
            <img src={geminiIcon} style={{width : 48, height : 48}}/>
            <div className={styles.headerText}>
              <h1>
                {analysis.analysisMethod?.includes('Gemini') ? 'AI 전문가' : '실시간'} 면접 분석 결과
              </h1>
              <p>음성과 영상을 종합적으로 분석했습니다 [Powered by Gemini]</p>
            </div>
          </div>

          <button 
            onClick={handleDownloadReport}
            disabled={isGeneratingPDF}
            className={`${commonStyles.btn} ${commonStyles.btnPrimary}`}
            style={{ opacity: isGeneratingPDF ? 0.6 : 1 }}
          >
            <Download size={16} />
            {isGeneratingPDF ? 'PDF 생성 중...' : '분석 보고서 PDF 다운로드'}
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
              <img src={geminiIcon} style={{width : 24, height : 24}}/>
              <div>
                <h4>
                  {analysis.analysisMethod?.includes('Gemini') ? 'AI 전문가 분석' : 'AI 분석'}
                </h4>
                <p>
                  {analysis.analysisMethod?.includes('Gemini') 
                    ? 'AI가 15년 경력의 면접 전문가로서 종합적인 분석을 수행했습니다.'
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