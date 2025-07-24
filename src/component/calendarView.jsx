import React, { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // 기본 스타일
import "../css/roadmap/customCalendar.css";
import { formatDate } from "../data/roadmapUtils";

function CalendarView({ completedMissions, progressMissions, isCalendarOpen, toggleCalendar }) {
  const [date, setDate] = useState(new Date());

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

    if (completedDay && completedDay.length > 0) {
      completedDay.forEach((rsId) => {
        markers.push(
          <div key={`completed-${rsId}`} className={`mission-marker-item completed stage-${rsId}`}>
            {rsId}
          </div>
        );
      });
    }

    if (progressDay && progressDay.length > 0) {
      progressDay.forEach((rsId) => {
        markers.push(
          <div key={`progress-${rsId}`} className={"mission-marker-item progress"}>
            {rsId}
          </div>
        );
      });
    }

    if (markers.length > 0) {
      return <div className="mission-markers-container">{markers}</div>;
    }
    return null;
  };

  return (
    <div className={`calendar-slider ${isCalendarOpen ? "open" : ""}`}>
      <div className="calendar-toggle-button" onClick={toggleCalendar}>
        {isCalendarOpen ? (
          <i className="fa-solid fa-chevron-up"></i>
        ) : (
          <i className="fa-solid fa-chevron-down"></i>
        )}
      </div>
      <div className="calendar-content">
        <div className="calendar-container">
          <Calendar
            onChange={setDate}
            value={date}
            formatDay={(locale, date) =>
              date.toLocaleString("en", { day: "numeric" })
            }
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
