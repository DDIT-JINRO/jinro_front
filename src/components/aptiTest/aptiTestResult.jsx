import { useLocation } from "react-router-dom";
import '../../css/aptiTest/aptiTestPage.css';
import '../../css/aptiTest/aptiTestResult.css';
import resultGif from '../../assets/charactor_jump.gif';

function AptitestResult() {

    const location = useLocation();
    const resultData = location.state?.resultData;

    const resultBtn = () => {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        
        window.location.href = resultData;
        window.resizeTo(screenWidth, screenHeight);
    }

    return (
        <div className="apti-container">
            <h2>검사가 완료되었습니다!<br /> 당신에게 딱 맞는 결과를 확인해보세요.</h2>
            <div className="apti-result-img-wrapper">
                <img className="moveGif" src={resultGif} alt="" />
                <div className="block"></div>
            </div>
            <button className="result-btn" onClick={resultBtn}>커리어넷에서 결과 확인하기</button>
        </div>
    );
}

export default AptitestResult;