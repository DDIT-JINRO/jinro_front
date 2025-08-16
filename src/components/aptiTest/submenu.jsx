import { use, useState } from "react";
import '../../css/aptiTest/aptiTestPage.css';

function Submenu({ num, setIsNext, setAgeGroup }) {

    const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);

    const handleSelect = (ageGroup) => {
        setSelectedAgeGroup(ageGroup);
        console.log("선택된 나이 그룹:", ageGroup);
    };

    const startTest = (num, ageGroup) => {
        console.log(num, ageGroup);
        setAgeGroup(ageGroup);
        setIsNext(true);
    }

    let target1 = "";
    let target2 = "";
    let type1 = "";
    let type2 = "";

    if (4 >= num && num >= 1) {
        target1 = "중학생"
        target2 = "고등학생"
        type1 = "100206"
        type2 = "100207"
    } else if (8 >= num && num >= 5) {
        target1 = "대학생"
        target2 = "일반"
        type1 = "100208"
        type2 = "100209"
    }

    return (
        <div className="apti-container">
            <h2>당신의 나이대를 선택하세요.</h2>
            <div className="age-button-group">
                <button
                    className={`age-btn ${selectedAgeGroup === type1 ? 'selected' : ''}`}
                    onClick={() => handleSelect(type1)}
                >
                    {target1}
                </button>
                <button
                    className={`age-btn ${selectedAgeGroup === type2 ? 'selected' : ''}`}
                    onClick={() => handleSelect(type2)}
                >
                    {target2}
                </button>
            </div>
            {selectedAgeGroup && (
                <div className="next-button-group">
                    <button className="next-btn" onClick={() => startTest(num, selectedAgeGroup)}>다음</button>
                </div>
            )}
            <h5 className="apti-source">[ 진로심리검사 문항 제공 : 한국직업능력연구원 국가진로교육연구센터 (커리어넷) ]</h5>
        </div>
    )
}

export default Submenu;