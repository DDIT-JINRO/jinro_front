import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { selectResultData } from '../api/roadMapApi';

function ResultPage() {
  const navigate = useNavigate();

  const [resultData, setResultData] = useState("");

  const fetchData = () => {
    selectResultData().then((res) => {
      setResultData(res);
    });
  }

  useEffect(() => {
    fetchData()
  }, []);

  return (
    <div>
      <h1>로드맵 결과 페이지</h1>
      {resultData}
      <p>여기에 로드맵 완료에 대한 결과와 추가 정보를 표시합니다.</p>
      <button onClick={() => navigate(-1)}>go back</button>
    </div>
  );
}

export default ResultPage;