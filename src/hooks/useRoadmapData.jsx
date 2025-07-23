import { useState, useCallback, useEffect } from 'react';
import { selectMemberRoadmap, selectMissionList } from '../api/roadMapApi';

export const useRoadmapData = () => {
  // 전체 미션 리스트
  const [missionList, setMissionList] = useState([]);
  // 캐릭터 위치
  const [charPosition, setCharPosition] = useState(0);
  // 진행 중인 미션 리스트
  const [progressMissions, setProgressMissions] = useState([]);
  // 완료한 미션 리스트
  const [completedMissions, setCompletedMissions] = useState([]);
  // 로딩 중인지
  const [isLoading, setIsLoading] = useState(true);

  // 로드맵 데이터 로딩 함수
  const loadRoadmapData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [missions, roadmapData] = await Promise.all([
        selectMissionList(),
        selectMemberRoadmap(),
      ]);
      setMissionList(missions);
      setCharPosition(roadmapData.currentCharPosition > 0 ? roadmapData.currentCharPosition - 1 : 0);
      setCompletedMissions(roadmapData.completedMissions);
      setProgressMissions(roadmapData.progressMissions);
    } catch (error) {
      console.error("로드맵 데이터 로딩 중 오류 발생", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // onload 로드맵 데이터 로딩
  useEffect(() => {
    loadRoadmapData();
  }, [loadRoadmapData]);

  return {
    missionList,
    charPosition,
    setCharPosition,
    progressMissions,
    completedMissions,
    isLoading,
    reloadRoadmapData: loadRoadmapData,
  };
};
