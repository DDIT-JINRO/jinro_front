import { useLocation } from "react-router-dom";
import '../../css/aptiTest/aptiTestPage.css';
import '../../css/aptiTest/aptiTestResult.css';
import resultGif from '../../assets/charactor_jump.gif';

function AptitestResult() {

    const location = useLocation();
    const resultData = location.state?.resultData;

    const resultBtn = () => {

        window.location.href = resultData;

    }

    return (
        <div className="apti-container">
            <div className="block"></div>
            <h2>검사가 완료되었습니다!<br /> 당신에게 딱 맞는 결과를 확인해보세요.</h2>
            <img className="moveGif" src={resultGif} alt="" />
            <button className="result-btn" onClick={resultBtn}>결과보기</button>
        </div>
    );
}

export default AptitestResult;