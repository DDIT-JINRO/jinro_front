import { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { selectResultData } from '../../api/roadmap/roadMapApi';
import '../../css/roadmap/roadmapResultPage.css';
import LoadingPage from "./loadingPage";
import { useModal } from "../../context/ModalContext.jsx";
// 로드맵 결과 페이지 컴포넌트
function RoadmapResultPage() {
  // 화면 이동을 위한 navigate훅
  const navigate = useNavigate();

  const [isDataLoaded, setIsDataLoaded] = useState(false);  // API 데이터 로딩 완료 여부
  const [isProgressComplete, setIsProgressComplete] = useState(false);  // 프로그레스 100% 완료 여부
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { showAlert } = useModal();

  // 결과 데이터 상태
  const [resultData, setResultData] = useState(null);
  
  // PDF 생성을 위한 ref
  const reportRef = useRef(null);

  // 실제 로딩 상태는 데이터 로딩과 프로그레스 완료 둘 다 완료되어야 함
  const isLoading = !isDataLoaded || !isProgressComplete;

  // 프로그레스 완료 콜백
  const handleProgressComplete = () => {
    setIsProgressComplete(true);
  };

  // PDF 생성 함수
  const generatePDF = async () => {
    if (!reportRef.current || !resultData) {
      showAlert(
          "보고서 데이터를 찾을 수 없습니다.",
          "",
          () => {} // 확인 버튼 클릭 시 실행할 동작 (없으면 빈 함수)
      );
      return;
    }

    setIsGeneratingPDF(true);

    try {
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

      // PDF 다운로드 버튼 숨기기
      const downloadButton = document.querySelector('.pdf-save-btn');
      const backButton = document.querySelector('.back-btn');
      
      const originalDownloadDisplay = downloadButton ? downloadButton.style.display : '';
      const originalBackDisplay = backButton ? backButton.style.display : '';
      
      if (downloadButton) downloadButton.style.display = 'none';
      if (backButton) backButton.style.display = 'none';

      // PDF를 위한 스타일 강제 적용
      const tempStyle = document.createElement('style');
      tempStyle.id = 'pdf-temp-style';
      tempStyle.innerHTML = `
        .result-page-container,
        .result-card,
        .result-header,
        .result-body,
        .report-section {
          background-color: #ffffff !important;
          color: #000000 !important;
          opacity: 1 !important;
          filter: none !important;
          box-shadow: none !important;
        }
        
        .result-page-container * {
          color: #000000 !important;
          background-color: transparent !important;
          opacity: 1 !important;
          filter: none !important;
          text-shadow: none !important;
        }
        
        .result-header h1,
        .result-header h2,
        .report-section h3 {
          color: #000000 !important;
          font-weight: bold !important;
        }
        
        .result-header span,
        .report-section strong {
          color: #000000 !important;
          font-weight: bold !important;
        }
        
        .result-actions {
          display: none !important;
        }
      `;
      document.head.appendChild(tempStyle);

      // 페이지 렌더링 대기
      await new Promise(resolve => setTimeout(resolve, 500));

      // html2canvas로 페이지 캡처 (최적화된 옵션)
      const canvas = await html2canvas(reportRef.current, {
        scale: 3, // 높은 해상도로 설정
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff', // 명시적 흰색 배경
        width: reportRef.current.offsetWidth,
        height: reportRef.current.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        foreignObjectRendering: true,
        removeContainer: false,
        async: true,
        onclone: (clonedDoc) => {
          // 클론된 문서에서 추가 스타일 적용
          const clonedStyle = clonedDoc.createElement('style');
          clonedStyle.innerHTML = `
            * {
              color: #000000 !important;
              background-color: transparent !important;
              opacity: 1 !important;
              filter: none !important;
              box-shadow: none !important;
            }
            .result-page-container {
              background-color: #ffffff !important;
            }
          `;
          clonedDoc.head.appendChild(clonedStyle);
        }
      });

      // 임시 스타일 제거
      const tempStyleElement = document.getElementById('pdf-temp-style');
      if (tempStyleElement) tempStyleElement.remove();

      // 버튼들 복원
      if (downloadButton) downloadButton.style.display = originalDownloadDisplay;
      if (backButton) backButton.style.display = originalBackDisplay;

      // 캔버스가 제대로 생성되었는지 확인
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('캔버스 생성에 실패했습니다.');
      }

      // 이미지를 PDF에 추가 (고품질 설정)
      const imgData = canvas.toDataURL('image/jpeg', 0.95); // JPEG로 변경하고 품질 향상
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      // 페이지 분할 처리 (긴 내용을 여러 페이지로 나누기)
      let remainingHeight = imgHeight;
      let currentY = 0;
      const maxHeightPerPage = pageHeight - (margin * 2);
      let pageCount = 0;

      while (remainingHeight > 0) {
        if (pageCount > 0) {
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
        const tempImgData = tempCanvas.toDataURL('image/jpeg', 0.95);

        pdf.addImage(
          tempImgData,
          'JPEG',
          margin,
          margin,
          imgWidth,
          heightToAdd,
          undefined,
          'FAST'
        );

        remainingHeight -= heightToAdd;
        currentY += heightToAdd;
        pageCount++;
      }

      // 파일명 생성 및 다운로드
      const fileName = `진로로드맵분석보고서_${resultData.memName}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);


      showAlert(
          "✅ 진로 로드맵 분석 보고서가 다운로드되었습니다!",
          "",
          () => {} // 확인 버튼 클릭 시 실행할 동작 (없으면 빈 함수)
      );

    } catch (error) {
      console.error('❌ PDF 생성 중 오류:', error);

      showAlert(
          "PDF 생성 중 오류가 발생했습니다: ${error.message}",
          "다시 시도해주세요.",
          () => {} // 확인 버튼 클릭 시 실행할 동작 (없으면 빈 함수)
      );

      // 에러 발생 시 스타일과 버튼들 복원
      const tempStyleElement = document.getElementById('pdf-temp-style');
      if (tempStyleElement) tempStyleElement.remove();
      
      const downloadButton = document.querySelector('.pdf-save-btn');
      const backButton = document.querySelector('.back-btn');
      if (downloadButton) downloadButton.style.display = '';
      if (backButton) backButton.style.display = '';
      
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // PDF 다운로드 핸들러
  const handleDownloadPDF = async () => {
    await generatePDF();
  };

  // 페이지 로딩 시 API 호출 및 창 크기 조절
  useEffect(() => {
    // 결과 데이터 조회 API 호출 함수
    const fetchData = async () => {
      try {
        const res = await selectResultData();
        setResultData(res);
        setIsDataLoaded(true); // 데이터 로딩 완료 -> 프로그레스바가 마지막 10% 채우기 시작
      } catch (error) {
        navigate("/roadmap/error", {
          state: {
            message: error.message,
          },
        });
      }
    }

    fetchData();
    window.resizeTo(900, 1080); 
  }, [navigate]);

  // 로딩 조건: 데이터가 없거나, 프로그레스가 100% 완료되지 않았을 때
  if (isLoading || !resultData) {
    return (
      <LoadingPage 
        isApiCompleted={isDataLoaded}
        onProgressComplete={handleProgressComplete}
      />
    );
  }

  return (
    // 페이지 시작
    <div className="result-page-container" ref={reportRef}>
      <div className="result-card">
        {/* 결과 헤더 시작 */}
        <div className="result-header">
          <h1>진로 로드맵 분석 보고서</h1>
          <h2><span>{resultData.memName}</span>님</h2>
        </div>
        {/* 결과 헤더 종료 */}

        {/* 결과 본문 시작 */}
        <div className="result-body">
          
          {/* 결과 개요 시작 */}
          <p className="report-intro">
            진로 로드맵의 모든 미션을 성공적으로 완료하신 것을 축하드립니다.<br/>
            본 보고서는 귀하의 로드맵 활동을 기반으로 분석된 진로 방향을 제시합니다.
          </p>
          {/* 결과 개요 종료 */}

          {/* 본문 1 시작 */}
          <div className="report-section">
            <h3>✅ 관심 분야 분석</h3>
            <p>
              로드맵 진행 과정에서 <span>{resultData.memName}</span>님은 특히 <strong>[{resultData.interest.interestKeyword.join('] [')}]</strong>와 같은 영역에서 뛰어난 집중력과 성과를 보여주셨습니다.
              이는 해당 분야에 대한 깊은 흥미와 잠재력을 시사합니다.
            </p>
          </div>
          {/* 본문 1 종료 */}

          {/* 본문 2 시작 */}
          <div className="report-section">
            <h3>✅ 추천 직업군</h3>
            <p>
              분석된 관심 분야와 역량을 바탕으로, <span>{resultData.memName}</span>님께는 다음과 같은 직업군을 추천합니다:
            </p>
            <ul>
              {resultData.recommendJob.map((job) => (
                <li key={job.jobName}>
                  <strong>{job.jobName}:</strong> {job.jobDetail}
                </li>
              ))}
            </ul>
            <p>
              이 외에도 <strong>{resultData.related.join(', ')}</strong>분야에서 다양한 기회를 탐색해 보시는 것을 권장합니다.
            </p>
          </div>
          {/* 본문 2 종료 */}

          {/* 본문 3 시작 */}
          <div className="report-section">
            <h3>✅ 추가 제언</h3>
            <p><strong>[학습 계획] : </strong> {resultData.suggest.planner}</p>
            <p><strong>[경험 확장] : </strong> {resultData.suggest.experience}</p>
            <p><strong>[역량 강화] : </strong> {resultData.suggest.enhance}</p>
          </div>
          {/* 본문 3 종료 */}

        </div>
        {/* 결과 본문 종료 */}

        {/* 버튼 시작 */}
        <div className="result-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>돌아가기</button>
          <button 
            className="pdf-save-btn" 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            style={{ 
              opacity: isGeneratingPDF ? 0.6 : 1,
              cursor: isGeneratingPDF ? 'not-allowed' : 'pointer'
            }}
          >
            {isGeneratingPDF ? 'PDF 생성 중...' : '📄 PDF로 저장'}
          </button>
        </div>
        {/* 버튼 종료 */}
      </div>
    </div>
    // 페이지 종료
  );
}

export default RoadmapResultPage;