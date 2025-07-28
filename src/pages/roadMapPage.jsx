import { useRoadmap } from "../hooks/useRoadmap";
import RoadmapView from "../components/roadmapView";
import RoadmapOverlays from "../components/roadmapOverlays";
import "../css/roadmap/roadmapPage.css";

// 로드맵 페이지 컴포넌트
function RoadmapPage() {
  // 로드맵 페이지에 필요한 함수를 사용하기 위한 커스텀 훅
  const roadmap = useRoadmap();
  
  // 로딩 시 출력 할 페이지
  if (roadmap.isLoading) {
    return <div>로딩 중...</div>;
  }

  // 로드맵 렌더링
  return (
    <>
      {/* 로드맵 전체 렌더링 */}
      <RoadmapView roadmap={roadmap}/>
      
      {/* 로드맵 오버레이 렌더링 */}
      <RoadmapOverlays roadmap={roadmap} />
    </>
  );
}

export default RoadmapPage;