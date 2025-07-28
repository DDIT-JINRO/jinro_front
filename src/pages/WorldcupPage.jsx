import {useState} from "react";
import CategorySelector from "../components/CategorySelector";
import Tournament from "../components/Tournament";
import ResultPage from "../components/ResultPage";

export default function WorldcupPage() {
    const [step, setStep] = useState("select"); // "select" | "tournament" | "result"


    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
            {step === "select" && (
                <CategorySelector/>
            )}

            {step === "tournament" && (
                <Tournament/>
            )}

            {step === "result" && (
                <ResultPage/>  // 우승 직업 정보 전달
            )}
        </div>
    );
}
