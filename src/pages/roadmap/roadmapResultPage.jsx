import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { selectResultData } from '../../api/roadmap/roadMapApi';
import '../../css/roadmap/roadmapResultPage.css'; // Import the new CSS file
import LoadingPage from "../../pages/aptiTest/LoadingPage";

// 로드맵 결과 페이지 컴포넌트
function RoadmapResultPage() {
  // 화면 이동을 위한 navigate훅
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  // 결과 데이터 상태
  const [resultData, setResultData] = useState(null);



  // 페이지 로딩 시 API 호출 및 창 크기 조절
  useEffect(() => {
    // 결과 데이터 조회 API 호출 함수
    const fetchData = async () => {
      try {
        const res = await selectResultData();

        setIsLoading(false);
        setResultData(res);
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
  }, []);

  if (isLoading || !resultData) {
    return <LoadingPage/>;
  }

  return (
    // 페이지 시작
    <div className="result-page-container">
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
          {/* <button className="pdf-save-btn" onClick={() => alert("PDF 저장 미구현")}>PDF로 저장</button> */}
        </div>
        {/* 버튼 종료 */}
      </div>
    </div>
    // 페이지 종료
  );
}

export default RoadmapResultPage;