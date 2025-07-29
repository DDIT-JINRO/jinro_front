import { useEffect, useState } from "react";
import AptiTestList from "../../components/aptiTest/aptiTestList"
import Submenu from "../../components/aptiTest/submenu";
import { useParams } from "react-router-dom";
import axios from "axios";

function AptiTestPage() {

    const { qno } = useParams();

    const [isNext, setIsNext] = useState(false);

    const [ageGroup, setAgeGroup] = useState("");

    const [answers, setAnswers] = useState({});

    useEffect(() => {

        console.log(qno);

        axios.post("http://localhost:8080/pse/cat/getSavingTest.do", qno, { withCredentials: true }).then(res => {
            if (res.data.msg === "success") {
                if (confirm("임시저장된 기록이 있습니다. 불러오시겠습니까?")) {
                    setAgeGroup(res.data.ageGroup);
                    setAnswers(res.data.answers);
                    setIsNext(true);
                    axios.post("http://localhost:8080/pse/cat/delTempSaveTest.do", qno, { withCredentials: true })
                } else {
                    axios.post("http://localhost:8080/pse/cat/delTempSaveTest.do", qno, { withCredentials: true })
                }
            }

        })

    }, [])

    return (
        <>
            {isNext ? <AptiTestList ageGroup={ageGroup} qno={qno} answers={answers} setAnswers={setAnswers} /> : <Submenu num={qno} setIsNext={setIsNext} setAgeGroup={setAgeGroup} />}

        </>
    )
}

export default AptiTestPage;