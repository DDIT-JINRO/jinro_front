import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {insertWorldcupResult, selectJobById} from "../api/worldcupApi.js";

const Tournament = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { jobs: initialJobs, categoryId, round } = location.state || {};

    const [jobs, setJobs] = useState([]);
    const [currentPairIndex, setCurrentPairIndex] = useState(0);
    const [currentRound, setCurrentRound] = useState(round || 32);
    const [nextRoundJobs, setNextRoundJobs] = useState([]);

    useEffect(() => {
        if (!initialJobs || !categoryId) {
            alert("잘못된 접근입니다.");
            navigate("/worldcup");
            return;
        }

        // 이미 셔플되어 넘어왔다는 가정, 그래도 안정성을 위해 다시 셔플 가능
        const shuffled = [...initialJobs].sort(() => Math.random() - 0.5);
        setJobs(shuffled.slice(0, currentRound));
    }, [initialJobs, categoryId, currentRound, navigate]);

    const handleSelect = async (selectedJob) => {
        // 다음 라운드를 위한 배열 업데이트
        const updatedNextRound = [...nextRoundJobs, selectedJob];

        // 아직 다음 라운드 진행 중이면
        if (currentPairIndex + 2 < jobs.length) {
            setNextRoundJobs(updatedNextRound);
            setCurrentPairIndex(currentPairIndex + 2);
            return;
        }

        // 다음 라운드로 진출 또는 우승자 확정
        if (updatedNextRound.length === 1) {
            const winner = updatedNextRound[0];

            try {
                // 🥇 우승자 상세 조회 (selectJobById)
                const detailedJob = await selectJobById(winner.jobCode);
                console.log(detailedJob);

                 await insertWorldcupResult(detailedJob.jobCode,);

                // ✅ 결과 페이지로 이동
                navigate("/worldcup/result", { state: { winner: detailedJob } });

            } catch (err) {
                console.error("우승 처리 실패", err);
            }

        } else {
            // 다음 라운드로 세팅
            setJobs(updatedNextRound);
            setNextRoundJobs([]);
            setCurrentPairIndex(0);
            setCurrentRound(currentRound / 2);
        }
    };

    if (!jobs.length) return <div className="text-center py-10">로딩 중...</div>;

    const [jobA, jobB] = jobs.slice(currentPairIndex, currentPairIndex + 2);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">

            <h2 className="text-3xl font-bold mb-2">{currentRound}강</h2>
            <p className="text-lg text-gray-600 mb-6">
                경기 {Math.floor(currentPairIndex / 2) + 1} / {jobs.length / 2}
            </p>

            {jobs.length >= 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
                    {[jobA, jobB].map((job) => (
                        <button
                            key={job.jobCode}
                            onClick={() => handleSelect(job)}
                            className="p-6 border rounded-2xl shadow hover:scale-105 transition text-left bg-white hover:bg-gray-50"
                        >
                            <h3 className="text-xl font-bold text-blue-600 mb-2">{job.jobName}</h3>
                            <p className="text-gray-700 mb-1"><strong>직무 분류:</strong> {job.jobLcl}</p>
                            <p className="text-gray-700 mb-1"><strong>관련 자격증:</strong> {job.jobRelatedCert}</p>
                            <p className="text-gray-700"><strong>주요 업무:</strong> {job.jobMainDuty}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tournament;
