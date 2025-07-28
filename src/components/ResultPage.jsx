import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../css/ResultPage.css';

const ResultPage = () => {
    const location = useLocation();
    const winner = location.state?.winner;

    const navigate = useNavigate();
    const restartWorldCup = () => {
        navigate("/worldcup");
    }

    if (!winner) return <div>우승자가 없습니다.</div>;

    return (
        <div className="result-container">
            {/* 결과 카드 */}
            <div className="result-card">
                {/* 우승 직업 제목 */}
                <h1 className="result-title">🎉 우승 직업 🎉</h1>
                <h2 className="text-2xl font-bold mb-3 text-blue-700">{winner.jobName}</h2>
            </div>

            {/* 직업 정보와 버튼 */}
            <div className="result-info-container">
                <div className="result-info">
                    <p><strong>평균 연봉:</strong> {winner.jobSal || "정보 없음"}</p>
                    <p><strong>만족도:</strong> {winner.jobSatis || "정보 없음"}</p>
                    <p><strong>진입 경로:</strong> {winner.jobWay || "정보 없음"}</p>
                    <p><strong>관련 자격증:</strong> {winner.jobRelatedCert || "정보 없음"}</p>
                    <p><strong>주요 업무:</strong> {winner.jobMainDuty || "정보 없음"}</p>
                    <p><strong>관련 직업:</strong></p>

                    <ul>
                        {Array.isArray(winner.jobsRel) && winner.jobsRel.length > 0 ? (
                            winner.jobsRel.map((relJob, index) => (
                                <li key={index}>{relJob}</li>
                            ))
                        ) : (
                            <li>정보 없음</li>
                        )}
                    </ul>
                </div>

                {/* 버튼 그룹 */}
                <div className="button-group">
                    <button className="restart-button" onClick={restartWorldCup}>다시 시작하기</button>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
