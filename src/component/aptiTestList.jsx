import { use, useState } from "react";
import '../css/aptiTestList.css';
import axios from "axios";
import { useTestList } from "../hooks/useTestList";

function AptiTestList({ qno, ageGroup }) {

    const { getValue } = useTestList();



    let testNo = getValue(qno, ageGroup);
    if (qno != 2) {
        axios.get("https://www.career.go.kr/inspct/openapi/test/questions?apikey=acf4d87308c1a831bb63f1273b6ecd6a&q=" + testNo)
            .then(res => {
                console.log(res);
            })
    } else if (qno == 2) {
        axios.get("https://www.career.go.kr/inspct/openapi/v2/test?apikey=acf4d87308c1a831bb63f1273b6ecd6a&q=" + testNo)
            .then(res => {
                console.log(res);
            })
    }



    return (
        <div className="apti-container">
            리스트
        </div>
    )
}

export default AptiTestList;