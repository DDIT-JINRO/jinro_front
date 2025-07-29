import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
// CSS 파일 import
import "../../css/worldcup/ResultPage.css";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const winner = location.state?.winner;

  const restartWorldCup = () => {
    navigate("/worldcup");
  };

  const exitWorldCup = () => {
    window.close();
  };

  if (!winner) {
    return (
      <div className="result-container">
        <h1>우승자를 찾지 못했습니다.</h1>
        <button className="restart-button" onClick={restartWorldCup}>
          다시 시작하기
        </button>
      </div>
    );
  }

  return (
    <div className="result-container">
      <div className="winner-card">
        <div className="gif-container">
          <img src="/src/assets/worldcup/images/mococoResult.gif" alt="축하 GIF" className="celebration-gif" />
        </div>
        <header className="card-header">
          <h1 className="result-title">최종 우승 직업</h1>
          <h2 className="winner-job-name">{winner.jobName}</h2>
        </header>

        <main className="card-body">
          <div className="info-grid">
            <div className="salary-details">
              <strong>평균 연봉</strong>
              <div className="salary-tags-container">
                {winner.jobSal ? (
                  winner.jobSal.split(",").map((part, index) => (
                    <span key={index} className="salary-tag">
                      {part.trim()}
                    </span>
                  ))
                ) : (
                  <span className="salary-tag">정보 없음</span>
                )}
              </div>
            </div>
            <p>
              <strong>만족도:</strong> {winner.jobSatis || "정보 없음"}
            </p>
            <p>
              <strong>관련 자격증:</strong>{" "}
              {winner.jobRelatedCert
                  ? winner.jobRelatedCert.split(",").slice(0, 2).join(", ") || "정보 없음"
                  : "정보 없음"}
            </p>
            <p className="main-duty">
              <strong>주요 업무:</strong> {winner.jobMainDuty || "정보 없음"}
            </p>
          </div>

          <div className="related-jobs-section">
            <h3>관련 직업</h3>
            <div className="tags-container">
              {Array.isArray(winner.jobsRel) && winner.jobsRel.length > 0 ? (
                winner.jobsRel.slice(0,5).map((relJob, index) => (
                  <span key={index} className="job-tag">
                    {relJob}
                  </span>
                ))
              ) : (
                <span className="job-tag-info">정보 없음</span>
              )}
            </div>
          </div>
        </main>

        <footer className="card-footer">
          <button className="restart-button" onClick={restartWorldCup}>
            다시하기
          </button>
          <button className="exit-button" onClick={exitWorldCup}>
            나가기
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ResultPage;
