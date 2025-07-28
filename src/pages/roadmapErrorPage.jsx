import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/roadmap/roadmapErrorPage.css';

const RoadmapErrorPage = () => {
	const location = useLocation();

	const error = location.state?.message;

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>오류가 발생했습니다.</h1>
        <p>{error ? error : "예상치 못한 오류가 발생했습니다."}</p>
				<p>잠시 후 다시 시도해주세요.</p>
        <Link to="/roadmap" className="home-link">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default RoadmapErrorPage;
