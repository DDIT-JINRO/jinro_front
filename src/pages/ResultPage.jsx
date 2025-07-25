import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { selectResultData } from '../api/roadMapApi';
import '../css/roadmap/resultPage.css'; // Import the new CSS file

function ResultPage() {
  const navigate = useNavigate();

  const [resultData, setResultData] = useState("");

  const fetchData = () => {
    selectResultData().then((res) => {
      setResultData(res);
    });
  }

  useEffect(() => {
    fetchData();
    window.resizeTo(900, 1080); 
  }, []);

  return (
    <div className="result-page-container">
      <div className="result-card">
        <div className="result-header">
          <h1>진로 로드맵 분석 보고서</h1>
          <h2><span>{resultData}</span>님</h2>
        </div>
        <div className="result-body">
          <p className="report-intro">
            진로 로드맵의 모든 미션을 성공적으로 완료하신 것을 축하드립니다.
            본 보고서는 귀하의 로드맵 활동을 기반으로 분석된 진로 방향을 제시합니다.
          </p>

          <div className="report-section">
            <h3>✅ 관심 분야 분석</h3>
            <p>
              로드맵 진행 과정에서 <span>{resultData}</span>님은 특히 [관심 분야 1], [관심 분야 2]와 같은 영역에서 뛰어난 집중력과 성과를 보여주셨습니다.
              이는 [관련 활동/미션]에서 두드러지게 나타났으며, 해당 분야에 대한 깊은 흥미와 잠재력을 시사합니다.
            </p>
          </div>

          <div className="report-section">
            <h3>✅ 추천 직업군</h3>
            <p>
              분석된 관심 분야와 역량을 바탕으로, <span>{resultData}</span>님께는 다음과 같은 직업군을 추천합니다:
            </p>
            <ul>
              <li><strong>[추천 직업 1]:</strong> [간단한 설명 및 관련 역량]</li>
              <li><strong>[추천 직업 2]:</strong> [간단한 설명 및 관련 역량]</li>
              <li><strong>[추천 직업 3]:</strong> [간단한 설명 및 관련 역량]</li>
            </ul>
            <p>
              이 외에도 [관련 산업 분야]에서 다양한 기회를 탐색해 보시는 것을 권장합니다.
            </p>
          </div>

          <div className="report-section">
            <h3>✅ 추가 제언</h3>
            <p>
              앞으로 [구체적인 학습 계획/경험]을 통해 관심 분야를 더욱 심화하고, 추천 직업군에 필요한 역량을 강화해 나간다면
              성공적인 진로를 개척할 수 있을 것입니다.
            </p>
          </div>
        </div>
        <div className="result-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>돌아가기</button>
          <button className="pdf-save-btn" onClick={() => alert("앙 저장띠")}>PDF로 저장</button>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;