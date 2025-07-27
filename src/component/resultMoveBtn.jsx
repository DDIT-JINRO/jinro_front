import { useNavigate } from "react-router-dom";
import "../css/roadmap/resultBtn.css";

// 로드맵 완료 후 결과 페이지로 이동하는 버튼 컴포넌트
function ResultBtn() {

  // 화면 이동을 위한 navigate훅
  const navigate = useNavigate();

  // 결과 페이지로 이동
  const moveResultPage = () => {
    navigate("/roadmap/results");
  };

  return (
    <button className="move-result-btn" onClick={moveResultPage}>
      <i className="fa-solid fa-flag-checkered"></i>
      <p>결과 다시보기</p>
    </button>
  );
}

export default ResultBtn;
