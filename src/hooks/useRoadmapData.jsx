import { useState, useCallback, useEffect } from 'react';
import { selectMemberRoadmap, selectMissionList } from '../api/roadMapApi';

export const useRoadmapData = () => {
  // 전체 미션 리스트 상태 관리
  const [missionList, setMissionList] = useState([]);

  // 캐릭터 위치 상태 관리
  const [charPosition, setCharPosition] = useState(0);

  // 진행 중인 미션 리스트 상태 관리
  const [progressMissions, setProgressMissions] = useState([]);
  
  // 완료한 미션 리스트 상태 관리
  const [completedMissions, setCompletedMissions] = useState([]);
  
  // 로딩 여부 상태 관리
  const [isLoading, setIsLoading] = useState(true);

  // 로드맵 완성 여부 상태 관리
  const [isCompleted, setIsCompleted] = useState(false);

  // 초기 로드맵 데이터 로딩 함수 (기본값 로딩 중)
  const loadRoadmapData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      // 1. 전체 미션 리스트 조회
      const missions = await selectMissionList();
      setMissionList(missions);

      // 2. 사용자의 로드맵 정보 조회
      const roadmapData = await selectMemberRoadmap();
      setCharPosition(roadmapData.currentCharPosition > 0 ? roadmapData.currentCharPosition - 1 : 0);
      setCompletedMissions(roadmapData.completedMissions);
      setProgressMissions(roadmapData.progressMissions);
      setIsCompleted(roadmapData.completedMissions.some(m => m.rsId === 11));
    } catch (error) {
      console.error("로드맵 정보를 불러오는 중 오류가 발생하였습니다.", error);
      alert("로드맵 정보를 불러오는 중 오류가 발생하였습니다.");
    } finally {
      // 로딩 종료
      if (showLoading) setIsLoading(false);
    }
  }, []);

  // 미션 데이터 새로고침 함수
  const refreshMissionData = useCallback(async () => {
    try {
      // 사용자의 로드맵 정보 조회
      const roadmapData = await selectMemberRoadmap();
      setCompletedMissions(roadmapData.completedMissions);
      setProgressMissions(roadmapData.progressMissions);
      setIsCompleted(roadmapData.completedMissions.some(m => m.rsId === 11));
    } catch (error) {
      console.error("미션 데이터 새로고침 중 오류 발생", error);
    }
  }, []);

  // 페이지 로딩 시 로드맵 데이터 로딩
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
    refreshMissionData, // 새로운 함수 추가
    isCompleted
  };
};
