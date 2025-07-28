import {useState} from "react";
import CategorySelector from "../components/CategorySelector";
import Tournament from "../components/Tournament";
import ResultPage from "../components/ResultPage";

export default function WorldcupPage() {
    const [round, setRound] = useState(32); // 32강 or 64강
    const [categoryId, setCategoryId] = useState("");
    const [jobs, setJobs] = useState([]);
    const [winner, setWinner] = useState(null);  // 우승 직업 정보 상태 추가
    const [step, setStep] = useState("select"); // "select" | "tournament" | "result"

    const goToTournament = () => setStep("tournament");
    const goToResult = () => setStep("result");

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
            {step === "select" && (
                <CategorySelector
                    setCategoryId={setCategoryId}
                    setJobs={setJobs}
                    setStep={setStep}
                    setRound={setRound}
                />
            )}

            {step === "tournament" && (
                <Tournament
                    jobs={jobs}
                    setWinner={setWinner}  // 우승 직업을 선택하면 setWinner 호출
                    goToResult={goToResult} // 결과 페이지로 이동
                />
            )}

            {step === "result" && (
                <ResultPage winner={winner} />  // 우승 직업 정보 전달
            )}
        </div>
    );
}
