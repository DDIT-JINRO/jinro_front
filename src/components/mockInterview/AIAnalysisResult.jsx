// 🤖 AIAnalysisResult.jsx - PDF 다운로드 수정 버전

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

  // 🎯 PDF 생성 함수 (오류 완전 해결 버전)
  const generatePDF = async () => {
    if (!reportRef.current) {
      alert('보고서 참조를 찾을 수 없습니다.');
      return;
    }

    setIsGeneratingPDF(true);
    
    // 현재 탭 저장 (함수 시작 부분에서)
    const currentTab = activeTab;
    
    try {
      console.log('📄 PDF 생성 시작...');
      
      // PDF 문서 설정
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10;
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

      // 전문가 피드백 색상을 검정색으로 변경 (강력한 디버깅 버전)
      const changeFeedbackColorsToBlack = () => {
        console.log('=== 피드백 색상 변경 시작 ===');
        
        // 모든 요소를 실제 클래스 이름으로 찾기
        console.log('1. 실제 DOM 구조 분석...');
        
        // 모든 피드백 관련 텍스트를 포함하는 p 태그들을 찾기
        const allParagraphs = Array.from(document.querySelectorAll('p'));
        const feedbackParagraphs = allParagraphs.filter(p => {
          const text = p.textContent || '';
          return text.includes('말투') || 
                 text.includes('목소리') || 
                 text.includes('습관어') ||
                 text.includes('자신감') ||
                 text.includes('명확') ||
                 text.includes('발음') ||
                 text.includes('아이컨택') ||
                 text.includes('표정') ||
                 text.includes('답변') ||
                 text.includes('내용') ||
                 text.includes('논리') ||
                 text.includes('구조') ||
                 text.length > 20; // 긴 텍스트는 피드백일 가능성이 높음
        });
        
        console.log('텍스트 내용으로 찾은 피드백 p 태그:', feedbackParagraphs.length);
        
        // 모든 피드백 관련 헤더 찾기
        const allHeaders = Array.from(document.querySelectorAll('h4, span'));
        const feedbackHeaders = allHeaders.filter(h => {
          const text = h.textContent || '';
          return text.includes('전문가') || text.includes('피드백') || text.includes('Gemini');
        });
        
        console.log('텍스트 내용으로 찾은 피드백 헤더:', feedbackHeaders.length);
        
        // 실제 클래스 이름으로도 찾기 (CSS 모듈이 해시화되었을 수 있음)
        const allDivs = Array.from(document.querySelectorAll('div'));
        const feedbackBoxes = allDivs.filter(div => {
          const className = div.className || '';
          return className.includes('feedback') || className.includes('Feedback');
        });
        
        console.log('클래스 이름으로 찾은 feedbackBox들:', feedbackBoxes.length);
        feedbackBoxes.forEach((box, index) => {
          console.log(`feedbackBox ${index + 1} 클래스:`, box.className);
        });
        
        // feedbackBox 안의 모든 p 태그들
        const feedbackBoxParagraphs = [];
        feedbackBoxes.forEach(box => {
          const paragraphs = box.querySelectorAll('p');
          feedbackBoxParagraphs.push(...paragraphs);
        });
        
        console.log('feedbackBox 안의 p 태그들:', feedbackBoxParagraphs.length);
        
        // 모든 피드백 요소들 합치기
        const allFeedbackElements = [
          ...feedbackParagraphs,
          ...feedbackHeaders,
          ...feedbackBoxParagraphs
        ];
        
        // 중복 제거
        const uniqueElements = [...new Set(allFeedbackElements)];
        console.log('중복 제거 후 총 피드백 요소:', uniqueElements.length);
        
        const originalColors = [];
        
        // 각 요소의 색상 변경 및 검증
        uniqueElements.forEach((el, index) => {
          if (el && el.style !== undefined) {
            const originalColor = window.getComputedStyle(el).color;
            originalColors[index] = el.style.color || originalColor;
            
            console.log(`요소 ${index + 1}:`);
            console.log(`  텍스트: "${el.textContent?.substring(0, 30)}..."`);
            console.log(`  원래 색상: ${originalColor}`);
            console.log(`  태그: ${el.tagName}`);
            console.log(`  클래스: ${el.className}`);
            
            // 여러 방법으로 색상 강제 적용
            el.style.color = '#000000';
            el.style.setProperty('color', '#000000', 'important');
            el.setAttribute('style', (el.getAttribute('style') || '') + '; color: #000000 !important;');
            
            // 변경 후 색상 확인
            const newColor = window.getComputedStyle(el).color;
            console.log(`  변경 후 색상: ${newColor}`);
            console.log(`  색상 변경 성공: ${newColor === 'rgb(0, 0, 0)' ? '✅' : '❌'}`);
            console.log('---');
          }
        });
        
        return { elements: uniqueElements, colors: originalColors };
      };

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
      console.log('📸 종합 분석 페이지 캡처 중...');
      setActiveTab('overview');
      await new Promise(resolve => setTimeout(resolve, 800));

      // 분석 방법 섹션만 숨기기 (첫 번째 페이지에서만)
      const analysisMethodSection = document.querySelector(`.${styles.analysisMethodInfo}`);
      const originalMethodDisplay = analysisMethodSection ? analysisMethodSection.style.display : '';
      if (analysisMethodSection) {
        analysisMethodSection.style.display = 'none';
      }

      // 전문가 피드백 색상 변경 (첫 번째 페이지)
      const colorData1 = changeFeedbackColorsToBlack();
      
      // 추가적인 강제 스타일 적용 (모든 가능한 선택자)
      const styleElement = document.createElement('style');
      styleElement.id = 'pdf-feedback-style';
      styleElement.innerHTML = `
        /* 모든 피드백 관련 텍스트를 강제로 검정색으로 */
        p:contains("말투"),
        p:contains("목소리"),
        p:contains("습관어"),
        p:contains("자신감"),
        p:contains("발음"),
        p:contains("아이컨택"),
        p:contains("표정"),
        div[class*="feedback"] *,
        div[class*="Feedback"] *,
        [class*="feedbackBox"] *,
        [class*="feedbackContent"] *,
        [class*="feedbackHeader"] *,
        [class*="progressItemWithFeedback"] p,
        [class*="analysisSection"] p {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }
        
        /* 백업 선택자 - 모든 긴 텍스트 */
        p {
          color: #000000 !important;
        }
      `;
      document.head.appendChild(styleElement);
      
      console.log('강제 CSS 스타일 추가됨');

      // 색상 변경 후 더 긴 대기 시간 및 강제 리플로우
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초로 증가
      
      // 강제 리플로우 트리거
      document.body.style.display = 'none';
      document.body.offsetHeight; // 강제 리플로우
      document.body.style.display = '';
      
      // 추가 대기
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 실제로 색상이 변경되었는지 최종 확인
      const finalCheck = document.querySelectorAll('p');
      let blackTextCount = 0;
      finalCheck.forEach(p => {
        const computedColor = window.getComputedStyle(p).color;
        if (computedColor === 'rgb(0, 0, 0)') {
          blackTextCount++;
        }
      });
      console.log(`최종 확인: ${blackTextCount}개의 p 태그가 검정색으로 변경됨`);

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
        allowTaint: true,
        useCORS: true,
        onclone: (clonedDoc) => {
          // 클론된 문서에서도 강제로 색상 적용
          console.log('클론된 문서에서 색상 재적용...');
          
          const clonedParagraphs = clonedDoc.querySelectorAll('p');
          clonedParagraphs.forEach(p => {
            const text = p.textContent || '';
            if (text.includes('말투') || text.includes('목소리') || text.includes('습관어') ||
                text.includes('자신감') || text.includes('발음') || text.includes('아이컨택') ||
                text.includes('표정') || text.includes('답변') || text.includes('내용') ||
                text.includes('논리') || text.includes('구조') || text.length > 20) {
              p.style.color = '#000000';
              p.style.setProperty('color', '#000000', 'important');
              p.setAttribute('style', (p.getAttribute('style') || '') + '; color: #000000 !important;');
            }
          });
          
          // 클론된 문서의 헤더들도 처리
          const clonedHeaders = clonedDoc.querySelectorAll('h4, span');
          clonedHeaders.forEach(h => {
            const text = h.textContent || '';
            if (text.includes('전문가') || text.includes('피드백') || text.includes('Gemini')) {
              h.style.color = '#000000';
              h.style.setProperty('color', '#000000', 'important');
              h.setAttribute('style', (h.getAttribute('style') || '') + '; color: #000000 !important;');
            }
          });
          
          // 클론된 문서에 강제 스타일 추가
          const clonedStyleElement = clonedDoc.createElement('style');
          clonedStyleElement.innerHTML = `
            p, h4, span {
              color: #000000 !important;
              -webkit-text-fill-color: #000000 !important;
            }
          `;
          clonedDoc.head.appendChild(clonedStyleElement);
          
          console.log('클론된 문서 색상 재적용 완료');
        }
      });

      // 스타일 요소 제거
      const tempStyleElement = document.getElementById('pdf-feedback-style');
      if (tempStyleElement) {
        tempStyleElement.remove();
      }

      // 색상 복원
      restoreFeedbackColors(colorData1);

      // 분석 방법 섹션 복원
      if (analysisMethodSection) {
        analysisMethodSection.style.display = originalMethodDisplay;
      }

      // 첫 번째 페이지 추가
      await addCanvasToPDF(pdf, overviewCanvas, contentWidth, pageHeight, margin, true);

      // 두 번째 페이지: 세부 분석 + 분석 방법
      console.log('📸 세부 분석 페이지 캡처 중...');
      setActiveTab('detailed');
      await new Promise(resolve => setTimeout(resolve, 800));

      // 헤더와 종합 점수 섹션만 숨기기
      const analysisHeader = document.querySelector(`.${styles.analysisHeader}`);
      const aiScoreSummary = document.querySelector(`.${styles.aiScoreSummary}`);
      
      const originalHeaderDisplay = analysisHeader ? analysisHeader.style.display : '';
      const originalSummaryDisplay = aiScoreSummary ? aiScoreSummary.style.display : '';

      if (analysisHeader) analysisHeader.style.display = 'none';
      if (aiScoreSummary) aiScoreSummary.style.display = 'none';

      // 전문가 피드백 색상 변경 (두 번째 페이지)
      const colorData2 = changeFeedbackColorsToBlack();
      
      // 추가적인 강제 스타일 적용 (두 번째 페이지)
      const styleElement2 = document.createElement('style');
      styleElement2.id = 'pdf-feedback-style-2';
      styleElement2.innerHTML = `
        /* 모든 피드백 관련 텍스트를 강제로 검정색으로 */
        p:contains("말투"),
        p:contains("목소리"),
        p:contains("습관어"),
        p:contains("자신감"),
        p:contains("발음"),
        p:contains("아이컨택"),
        p:contains("표정"),
        div[class*="feedback"] *,
        div[class*="Feedback"] *,
        [class*="feedbackBox"] *,
        [class*="feedbackContent"] *,
        [class*="feedbackHeader"] *,
        [class*="progressItemWithFeedback"] p,
        [class*="analysisSection"] p {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }
        
        /* 백업 선택자 - 모든 긴 텍스트 */
        p {
          color: #000000 !important;
        }
      `;
      document.head.appendChild(styleElement2);
      
      console.log('두 번째 페이지 강제 CSS 스타일 추가됨');

      // 색상 변경 후 더 긴 대기 시간 및 강제 리플로우 (두 번째 페이지)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초로 증가
      
      // 강제 리플로우 트리거
      document.body.style.display = 'none';
      document.body.offsetHeight; // 강제 리플로우
      document.body.style.display = '';
      
      // 추가 대기
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 실제로 색상이 변경되었는지 최종 확인
      const finalCheck2 = document.querySelectorAll('p');
      let blackTextCount2 = 0;
      finalCheck2.forEach(p => {
        const computedColor = window.getComputedStyle(p).color;
        if (computedColor === 'rgb(0, 0, 0)') {
          blackTextCount2++;
        }
      });
      console.log(`두 번째 페이지 최종 확인: ${blackTextCount2}개의 p 태그가 검정색으로 변경됨`);

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
        allowTaint: true,
        useCORS: true,
        onclone: (clonedDoc) => {
          // 클론된 문서에서도 강제로 색상 적용
          console.log('두 번째 페이지 클론된 문서에서 색상 재적용...');
          
          const clonedParagraphs = clonedDoc.querySelectorAll('p');
          clonedParagraphs.forEach(p => {
            const text = p.textContent || '';
            if (text.includes('말투') || text.includes('목소리') || text.includes('습관어') ||
                text.includes('자신감') || text.includes('발음') || text.includes('아이컨택') ||
                text.includes('표정') || text.includes('답변') || text.includes('내용') ||
                text.includes('논리') || text.includes('구조') || text.length > 20) {
              p.style.color = '#000000';
              p.style.setProperty('color', '#000000', 'important');
              p.setAttribute('style', (p.getAttribute('style') || '') + '; color: #000000 !important;');
            }
          });
          
          // 클론된 문서의 헤더들도 처리
          const clonedHeaders = clonedDoc.querySelectorAll('h4, span');
          clonedHeaders.forEach(h => {
            const text = h.textContent || '';
            if (text.includes('전문가') || text.includes('피드백') || text.includes('Gemini')) {
              h.style.color = '#000000';
              h.style.setProperty('color', '#000000', 'important');
              h.setAttribute('style', (h.getAttribute('style') || '') + '; color: #000000 !important;');
            }
          });
          
          // 클론된 문서에 강제 스타일 추가
          const clonedStyleElement = clonedDoc.createElement('style');
          clonedStyleElement.innerHTML = `
            p, h4, span {
              color: #000000 !important;
              -webkit-text-fill-color: #000000 !important;
            }
          `;
          clonedDoc.head.appendChild(clonedStyleElement);
          
          console.log('두 번째 페이지 클론된 문서 색상 재적용 완료');
        }
      });

      // 스타일 요소 제거 (두 번째 페이지)
      const tempStyleElement2 = document.getElementById('pdf-feedback-style-2');
      if (tempStyleElement2) {
        tempStyleElement2.remove();
      }

      // 색상 복원
      restoreFeedbackColors(colorData2);

      // 숨긴 요소들 복원
      if (analysisHeader) analysisHeader.style.display = originalHeaderDisplay;
      if (aiScoreSummary) aiScoreSummary.style.display = originalSummaryDisplay;

      // 두 번째 페이지 추가
      await addCanvasToPDF(pdf, detailedCanvas, contentWidth, pageHeight, margin, false);

      // 질문별 답변 분석 페이지 추가
      if (interviewQuestions.length > 0) {
        console.log('📝 질문별 답변 분석 페이지 생성 중...');
        await addQuestionsPageAsImage(pdf, interviewQuestions, interviewAnswers, margin, contentWidth, pageHeight);
      }

      // PDF 다운로드 버튼 복원
      if (downloadButton) {
        downloadButton.style.display = originalButtonDisplay;
      }

      // 파일명 생성 및 다운로드
      const fileName = `면접분석보고서_${new Date().toISOString().slice(0, 10)}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      console.log('✅ PDF 다운로드 완료!');
      alert('✅ PDF 보고서가 다운로드되었습니다!');

      // 원래 탭으로 복원
      setActiveTab(currentTab);
      
    } catch (error) {
      console.error('❌ PDF 생성 중 오류:', error);
      alert(`PDF 생성 중 오류가 발생했습니다: ${error.message}\n\n다시 시도해주세요.`);
      
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
    const maxHeightPerPage = pageHeight - margin * 2;
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
            <Brain size={16} />
            <span>Gemini AI 전문가 피드백</span>
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
    <div className={`${commonStyles.mockInterviewContainer} ${styles.aiAnalysisResult}`} ref={reportRef}>
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