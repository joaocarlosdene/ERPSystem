"use client";

import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";

export type Task = {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
};

type CalendarProps = {
  tasks: Task[];
  selectedDate: Dayjs;
  setSelectedDate: (date: Dayjs) => void;
};

export default function Calendar({ tasks, selectedDate, setSelectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());

  const startDay = currentDate.startOf("month").startOf("week");
  const endDay = currentDate.endOf("month").endOf("week");

  const calendarDays: Dayjs[] = [];
  let day = startDay;

  while (day.isBefore(endDay, "day")) {
    calendarDays.push(day);
    day = day.add(1, "day");
  }

  const renderTasks = (date: string) => {
    const dayTasks = tasks.filter((task) => task.date === date);
    return dayTasks.map((task) => (
      <div
        key={task.id}
        className="bg-blue-500 text-white text-xs rounded px-1 mt-1 truncate"
        title={task.title}
      >
        {task.title}
      </div>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}>{"<"}</button>
        <h2 className="text-xl font-bold">{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={() => setCurrentDate(currentDate.add(1, "month"))}>{">"}</button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-2 text-center font-semibold mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {calendarDays.map((dayItem, index) => (
          <div
            key={index}
            onClick={() => setSelectedDate(dayItem)}
            className={`border p-2 cursor-pointer rounded min-h-[70px] flex flex-col ${
              dayItem.isSame(selectedDate, "day") ? "bg-blue-100" : ""
            }`}
          >
            <div className="font-bold mb-1">{dayItem.date()}</div>
            {renderTasks(dayItem.format("YYYY-MM-DD"))}
          </div>
        ))}
      </div>
    </div>
  );
}
