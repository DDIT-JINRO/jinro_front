import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { insertWorldcupResult, selectJobById } from "../../api/worldcup/worldcupApi.js";
import '../../css/worldcup/Tournament.css';

const Tournament = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { jobs: initialJobs, categoryId, round, comCode } = location.state || {};

    // 1. 초기 상태를 직접 설정
    const [jobs, setJobs] = useState(() => {
        if (!initialJobs || !categoryId) return [];
        const shuffled = [...initialJobs].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, round);
    });

    const [currentPairIndex, setCurrentPairIndex] = useState(0);
    const [currentRound, setCurrentRound] = useState(round || 32);
    const [nextRoundJobs, setNextRoundJobs] = useState([]);

    useEffect(() => {
        // 2. useEffect는 초기 진입 유효성 검사만 담당
        if (!initialJobs || !categoryId) {
            alert("잘못된 접근입니다.");
            navigate("/worldcup");
        }
    }, [initialJobs, categoryId, navigate]);

    const handleSelect = async (selectedJob) => {
        const updatedNextRound = [...nextRoundJobs, selectedJob];

        if (currentPairIndex + 2 < jobs.length) {
            setNextRoundJobs(updatedNextRound);
            setCurrentPairIndex(currentPairIndex + 2);
            return;
        }

        if (updatedNextRound.length === 1) {
            const winner = updatedNextRound[0];

            try {
                const detailedJob = await selectJobById(winner.jobCode);
                await insertWorldcupResult(detailedJob.jobCode);
                navigate("/worldcup/result", { state: { winner: detailedJob } });
            } catch (err) {
                console.error("우승 처리 실패", err);
            }
        } else {
            const shuffledNextRoundJobs = updatedNextRound.sort(() => Math.random() - 0.5);
            setJobs(shuffledNextRoundJobs);
            setNextRoundJobs([]);
            setCurrentPairIndex(0);
            setCurrentRound(currentRound / 2);
        }
    };

    if (!jobs.length) return <div className="text-center py-10">로딩 중...</div>;

    const [jobA, jobB] = jobs.slice(currentPairIndex, currentPairIndex + 2);

    return (
        <div className="tournament-container">
            <h2 className="tournament-round">{currentRound}강</h2>
            <p className="tournament-progress">
                경기 {Math.floor(currentPairIndex / 2) + 1} / {jobs.length / 2}
            </p>

            {jobs.length >= 2 && (
                <div className="tournament-pair">
                    {[jobA, jobB].map((job, index) => (
                        <div className="tournament-card-wrapper" key={job.jobCode}>
                            <button
                                onClick={() => handleSelect(job)}
                                className="tournament-card"
                            >
                                <div className="tournament-card-content">
                                    <h3 className="tournament-title">{job.jobName}</h3>
                                    <p className="tournament-info"><strong>직무 분류:</strong> {comCode?.ccName}</p>
                                    <p className="tournament-info"><strong>주요 업무:</strong> {job.jobMainDuty}</p>
                                </div>
                            </button>

                            {/* 왼쪽 직업에만 왼쪽 캐릭터, 오른쪽 직업에만 오른쪽 캐릭터 */}
                            {index === 0 && (
                                <>
                                    <div className="card-icon-left"></div>
                                    <div className="character-left"></div>
                                </>
                            )}
                            {index === 1 && (
                                <>
                                    <div className="card-icon-right"></div>
                                    <div className="character-right"></div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tournament;
