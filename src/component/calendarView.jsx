import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // 기본 스타일
import "../customCalendar.css";

function CalendarView() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="calendar-container">
      <Calendar onChange={setDate}  value={date} formatDay={(locale, date) => date.toLocaleString("en", {day: "numeric"})}/>
    </div>
  );
}

export default CalendarView;