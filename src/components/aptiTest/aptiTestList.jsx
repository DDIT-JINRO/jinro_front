import { useEffect, useState } from "react";
import '../../css/aptiTest/aptiTestList.css';
import axios from "axios";
import { useTestList } from "../../hooks/aptiTest/useTestList";
import parse from 'html-react-parser';

function AptiTestList({ qno, ageGroup, answers, setAnswers }) {
    const { getValue, getTitle } = useTestList();
    const testNo = getValue(qno, ageGroup);
    const title = getTitle(qno);

    const [testList, setTestList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    console.log(answers);

    const isSubmitEnabled = Object.keys(answers).length === testList.length;
    const itemsPerPage = 5;

    useEffect(() => {

        const fetchData = async () => {
            try {
                let url = "";
                if (qno === "2") {
                    url = `https://www.career.go.kr/inspct/openapi/v2/test?apikey=acf4d87308c1a831bb63f1273b6ecd6a&q=${testNo}`;
                    const res = await axios.get(url);
                    setTestList(res.data.result.questions);
                    console.log(testList);

                } else {
                    url = `https://www.career.go.kr/inspct/openapi/test/questions?apikey=acf4d87308c1a831bb63f1273b6ecd6a&q=${testNo}`;
                    const res = await axios.get(url);
                    setTestList(res.data.RESULT);

                }
                setCurrentPage(1);
                // setAnswers({});
            } catch (error) {
                console.error("문항 가져오기 실패", error);
            }
        };

        fetchData();
    }, [qno, testNo]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentQuestions = testList.slice(startIndex, startIndex + itemsPerPage);

    const progress = testList.length > 0
        ? Math.round(((startIndex + currentQuestions.length) / testList.length) * 100)
        : 0;

    const handleSelect = (questionId, value) => {
        console.log("select : ", answers);

        setAnswers(prev => ({
            ...prev,
            [questionId.toString()]: value.toString()
        }));
    };

    const isCurrentPageCompleted = currentQuestions.every((q, idx) => {
        const id = qno === "5" ? q.qitemNo.toString() : qno === "2" ? q.no.toString() : (startIndex + idx + 1).toString();
        return answers[id] !== undefined;
    });

    const handleNextPage = () => {
        if (!isCurrentPageCompleted) {
            alert("모든 문항에 답변해주세요.");
            return;
        }
        if ((currentPage * itemsPerPage) < testList.length) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const saveButton = () => {
        let data = {
            ageGroup: ageGroup,
            testNo: testNo,
            answers: answers
        }

        axios.post("http://localhost:8080/pse/cat/aptiTestSave.do", data, { withCredentials: true }).then(res => {
            if (res.data === "success") {
                alert("임시저장이 완료되었습니다.");
                window.close();
            } else {
                alert("임시저장중 에러발생");
                window.close();
            }
        })
    }

    const handleSubmit = (qno) => {
        if (qno !== '2') {
            let data = {
                ageGroup: ageGroup,
                testNo: testNo,
                answers: answers
            };

            axios.post("http://localhost:8080/pse/cat/aptiTestSubmit.do", data, { withCredentials: true }).then(res => {

            })
        } else {
            let data = {
                ageGroup: ageGroup,
                testNo: testNo,
                answers: answers
            }

            axios.post("http://localhost:8080/pse/cat/aptiTestSubmit.do", data, { withCredentials: true }).then(res => {

            })
        }
    };

    return (
        <div className="apti-container">
            <h2>{title}</h2>

            <div className="progress-box">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                <span className="progress-text">{progress}%</span>
            </div>

            <ul className="question-list">
                {currentQuestions.map((question, index) => {
                    const globalIndex = startIndex + index;
                    const questionId = qno === "5" ? question.qitemNo : qno === "2" ? question.no : (globalIndex + 1);
                    const selectedValue = answers[questionId];

                    if (qno === "2") {
                        return (
                            <li key={index} className="question-item">
                                <strong>Q{question.no}. </strong> {question.text}
                                <div className="choice-button-group">
                                    {question.choices.map((choice, idx) => (
                                        <button
                                            key={idx}
                                            className={`choice-btn${selectedValue === choice.val.toString() ? " selected" : ""}`}
                                            onClick={() => handleSelect(question.no.toString(), choice.val.toString())}
                                        >
                                            {choice.text}
                                        </button>
                                    ))}
                                </div>
                            </li>
                        );
                    }

                    if (qno === "5") {
                        return (
                            <li key={index} className="question-item">
                                <strong>Q{question.qitemNo}. </strong> {question.question}
                                <div className="choice-button-group-q2">
                                    <button
                                        className={`choice-btn-q2 ${selectedValue === "1" ? "selected" : ""}`}
                                        onClick={() => handleSelect(questionId, "1")}
                                    >
                                        <div><strong>{question.answer01}</strong></div>
                                        <div style={{ fontSize: "13px" }}>{question.answer03}</div>
                                    </button>
                                    <button
                                        className={`choice-btn-q2 ${selectedValue === "2" ? "selected" : ""}`}
                                        onClick={() => handleSelect(questionId, "2")}
                                    >
                                        <div><strong>{question.answer02}</strong></div>
                                        <div style={{ fontSize: "13px" }}>{question.answer04}</div>
                                    </button>
                                </div>
                            </li>
                        );
                    }

                    return (
                        <li key={index} className="question-item">
                            <strong>Q{questionId}. </strong> {parse(question.question)}
                            <div className="choice-button-group">
                                {Array.from({ length: 10 }, (_, i) => {
                                    const num = String(i + 1).padStart(2, '0');
                                    const text = question[`answer${num}`];
                                    const score = question[`answerScore${num}`];
                                    if (!text || !score) return null;
                                    return (
                                        <button
                                            key={num}
                                            className={`choice-btn ${selectedValue === score ? "selected" : ""}`}
                                            onClick={() => handleSelect(questionId, score)}
                                        >
                                            {text}
                                        </button>
                                    );
                                })}
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div className="aptiTestGap">
                {currentPage > 1 && (
                    <button className="page-btn prev" onClick={handlePrevPage}>이전</button>
                )}
                {(currentPage * itemsPerPage) < testList.length && (
                    <button className="page-btn next" onClick={handleNextPage}>다음</button>
                )}
            </div>
            <div className="submit-button-wrap">
                <button className="temp-btn" onClick={() => saveButton()}>임시 저장</button>
                {/* {isSubmitEnabled && ( */}
                <button
                    className="submit-btn"
                    onClick={() => handleSubmit(qno)}
                >
                    결과 제출
                </button>
                {/* )} */}
            </div>
        </div>
    );
}

export default AptiTestList;
