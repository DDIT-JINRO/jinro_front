import React, { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // 기본 스타일
import "../css/roadmap/customCalendar.css";
import { formatDate } from "../data/roadmapUtils";

function CalendarView({ completedMissions, isCalendarOpen, toggleCalendar }) {
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

    // 해당 날짜에 완료된 미션이 있으면
    if (completedDay && completedDay.length > 0) {
      return (
        <div className="mission-markers-container">
          {completedDay.map((rsId, index) => (
            <div key={index} className={`mission-marker-item stage-${rsId}`}>
              {rsId}
            </div>
          ))}
        </div>
      );
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
