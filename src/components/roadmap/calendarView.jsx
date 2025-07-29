import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // 기본 스타일
import "../../css/roadmap/customCalendar.css";
import { formatDate } from "../../data/roadmapUtils";

/**
 *  완료된 미션과 진행 중인 미션을 날짜별로 표시하는 캘린더 컴포넌트
 * @param {Array} completedMissions - 완료된 미션 목록
 * @param {Array} progressMissions - 진행 중인 미션 목록
 * @param {boolean} isCalendarOpen - 캘린더가 열려있는지 여부
 * @param {function} toggleCalendar - 캘린더를 열고 닫는 함수
 */
function CalendarView({ completedMissions, progressMissions, isCalendarOpen, toggleCalendar }) {
  // 날짜 상태 관리
  const [date, setDate] = useState(new Date());

  // 완료된 미션을 날짜별로 그룹화하는 함수
  const completedMissionsByDate = useMemo(() => {
    const missionsMap = new Map();

    completedMissions.forEach((mission) => {
      const dateKey = formatDate(new Date(mission.completeAt));

      if (!missionsMap.has(dateKey)) {
        missionsMap.set(dateKey, []);
      }

      missionsMap.get(dateKey).push(mission.rsId);
    });

    return missionsMap;
  }, [completedMissions]);

  // 진행 중 미션을 날짜별로 그룹화하는 함수
  const progressMissionsByDate = useMemo(() => {
    const missionsMap = new Map();

    progressMissions.forEach((mission) => {
      if (mission.dueDate) {
        const dateKey = formatDate(new Date(mission.dueDate));

        if (!missionsMap.has(dateKey)) {
          missionsMap.set(dateKey, []);
        }

        missionsMap.get(dateKey).push(mission.rsId);
      }
    });

    return missionsMap;
  }, [progressMissions]);

  // 일요일, 토요일 반환 함수
  const getTileClassName = ({ date, view }) => {
    if (view === "month") {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0) {
        return "sunday";
      }
      if (dayOfWeek === 6) {
        return "saturday";
      }
    }
  };

  // 각 날짜 타일에 콘텐츠를 추가하는 함수
  const addMarkers = ({ date, view }) => {
    if (view !== "month") return null;

    const dateKey = formatDate(date);
    const completedDay = completedMissionsByDate.get(dateKey);
    const progressDay = progressMissionsByDate.get(dateKey);

    const markers = [];

    // 완료일 출력 준비
    if (completedDay && completedDay.length > 0) {
      completedDay.forEach((rsId) => {
        markers.push(
          <div key={`completed-${rsId}`} className={`mission-marker-item completed stage-${rsId}`}>
            {rsId}
          </div>
        );
      });
    }

    // 진행일 출력 준비
    if (progressDay && progressDay.length > 0) {
      progressDay.forEach((rsId) => {
        markers.push(
          <div key={`progress-${rsId}`} className={"mission-marker-item progress"}>
            {rsId}
          </div>
        );
      });
    }

    // 마커 출력
    if (markers.length > 0) {
      return <div className="mission-markers-container">{markers}</div>;
    }
    return null;
  };

  return (
    <div className={`calendar-slider ${isCalendarOpen ? "open" : ""}`}>

      <div className="calendar-toggle-button" onClick={toggleCalendar}>
        {isCalendarOpen
          ? (<i className="fa-solid fa-chevron-up"></i>)
          : (<i className="fa-solid fa-chevron-down"></i>)}
      </div>

      <div className="calendar-content">
        <div className="calendar-container">
          <Calendar
            onChange={setDate}
            value={date}
            formatDay={(locale, date) => date.toLocaleString("en", { day: "numeric" }) }
            tileContent={addMarkers}
            tileClassName={getTileClassName}
            showFixedNumberOfWeeks
          />
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
