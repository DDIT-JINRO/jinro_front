import { useState } from "react";
import '../css/aptiTestPage.css';
import Submenu from "../component/submenu";
import { useParams } from "react-router-dom";
import AptiTestList from "../component/aptiTestList";

function AptiTestPage() {

    const { qno } = useParams();

    const [isNext, setIsNext] = useState(false);

    const [ageGroup, setAgeGroup] = useState("");

    return (
        <>
            {isNext ? <AptiTestList ageGroup={ageGroup} qno={qno} /> : <Submenu num={qno} setIsNext={setIsNext} setAgeGroup={setAgeGroup} />}

        </>
    )
}

export default AptiTestPage;