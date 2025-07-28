import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { insertWorldcupResult, selectJobById } from "../api/worldcupApi.js";
import '../css/Tournament.css';

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

        const shuffled = [...initialJobs].sort(() => Math.random() - 0.5);
        setJobs(shuffled.slice(0, currentRound));
    }, [initialJobs, categoryId, currentRound, navigate]);

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
            setJobs(updatedNextRound);
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
                    {[jobA, jobB].map((job) => (
                        <button
                            key={job.jobCode}
                            onClick={() => handleSelect(job)}
                            className="tournament-card"
                        >
                            <h3 className="tournament-title">{job.jobName}</h3>
                            <p className="tournament-info"><strong>직무 분류:</strong> {job.jobLcl}</p>
                            <p className="tournament-info"><strong>주요 업무:</strong> {job.jobMainDuty}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tournament;
