import React from "react";
import { useLocation } from "react-router-dom";

const ResultPage = () => {
    const location = useLocation();
    const winner = location.state?.winner;

    if (!winner) return <div>우승자가 없습니다.</div>;

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-10">
            <h1 className="text-4xl font-bold mb-6 text-green-600">🎉 우승 직업 🎉</h1>

            <div className="bg-gray-100 p-6 rounded-xl shadow-lg max-w-xl w-full">
                <h2 className="text-2xl font-bold mb-3 text-blue-700">{winner.jobName}</h2>

                <p className="mb-2"><strong>평균 연봉:</strong> {winner.jobSal || "정보 없음"}</p>
                <p className="mb-2"><strong>만족도:</strong> {winner.jobSatis || "정보 없음"}</p>
                <p className="mb-2"><strong>진입 경로:</strong> {winner.jobWay || "정보 없음"}</p>
                <p className="mb-2"><strong>관련 자격증:</strong> {winner.jobRelatedCert || "정보 없음"}</p>
                <p className="mb-2"><strong>주요 업무:</strong> {winner.jobMainDuty || "정보 없음"}</p>
                <p><strong>관련 직업:</strong></p>
                <ul className="list-disc list-inside pl-4 text-gray-800">
                    {Array.isArray(winner.jobsRel) && winner.jobsRel.length > 0 ? (
                        winner.jobsRel.map((relJob, index) => (
                            <li key={index}>{relJob}</li>
                        ))
                    ) : (
                        <li>정보 없음</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ResultPage;
