import {useState} from "react";
import CategorySelector from "../components/CategorySelector";
import Tournament from "../components/Tournament";
// import ResultPage from "../components/ResultPage"; ← 마지막 단계에

export default function WorldcupPage() {
    const [round, setRound] = useState(32); // 32강 or 64강
    const [categoryId, setCategoryId] = useState("");
    const [jobs, setJobs] = useState([]);
    const [step, setStep] = useState("select"); // "select" | "tournament" | "result"

    const goToTournament = () => setStep("tournament");
    const goToResult = () => setStep("result");

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
            {step === "select" && (
                <CategorySelector/>
            )}

            {step === "tournament"&& (
                <Tournament jobs={jobs} />
            )}
            {/* step === "result"일 때 결과 페이지 보여주기 */}
        </div>
    );
}
