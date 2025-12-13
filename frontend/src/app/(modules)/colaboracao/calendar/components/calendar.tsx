"use client";

import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Task } from "../api/calendarApi";

type CalendarProps = {
  tasks: Task[];
  selectedDate: Dayjs;
  setSelectedDate: (date: Dayjs) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  currentUserId: string;
  fetchTasks: () => Promise<void>;
};

type ViewType = "month" | "week" | "day";

export default function Calendar({
  tasks,
  selectedDate,
  setSelectedDate,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [view, setView] = useState<ViewType>("month");
  const today = dayjs();

  // Gera dias para o mês ou semana
  const generateDays = () => {
    if (view === "month") {
      const startDay = currentDate.startOf("month").startOf("week");
      const endDay = currentDate.endOf("month").endOf("week");
      const days: Dayjs[] = [];
      let day = startDay;
      while (day.isBefore(endDay) || day.isSame(endDay)) {
        days.push(day);
        day = day.add(1, "day");
      }
      return days;
    } else if (view === "week") {
      const startDay = currentDate.startOf("week");
      const endDay = currentDate.endOf("week");
      const days: Dayjs[] = [];
      let day = startDay;
      while (day.isBefore(endDay) || day.isSame(endDay)) {
        days.push(day);
        day = day.add(1, "day");
      }
      return days;
    } else {
      return [currentDate]; // daily view
    }
  };

  const calendarDays = generateDays();

  const renderTasks = (date: Dayjs) => {
    const dayTasks = tasks.filter((task) =>
      dayjs(task.date).isSame(date, "day")
    );

    return dayTasks.map((task) => {
      const userCount = task.users?.length || 0;
      const isCollaborative = userCount > 1;
      return (
        <div
          key={task.id}
          className={`flex justify-between items-center px-2 py-1 mt-1 text-xs rounded ${
            isCollaborative
              ? "bg-purple-600 text-white font-semibold"
              : "bg-blue-500 text-white"
          }`}
          title={
            isCollaborative
              ? `Colaborativa: ${task.users?.map(u => u.user.name).join(", ")}`
              : task.title
          }
        >
          <span>{task.title}</span>
        </div>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setCurrentDate(currentDate.subtract(1, view === "month" ? "month" : "week"))
            }
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            {"<"}
          </button>
          <h2 className="text-xl font-bold capitalize">
            {currentDate.format(view === "month" ? "MMMM YYYY" : "DD MMM YYYY")}
          </h2>
          <button
            onClick={() =>
              setCurrentDate(currentDate.add(1, view === "month" ? "month" : "week"))
            }
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            {">"}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${
              view === "month" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("month")}
          >
            Month
          </button>
          <button
            className={`px-3 py-1 rounded ${
              view === "week" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("week")}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 rounded ${
              view === "day" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("day")}
          >
            Day
          </button>
        </div>
      </div>

      {/* Cabeçalho dias da semana */}
      {view !== "day" && (
        <div className="grid grid-cols-7 gap-2 text-center font-semibold mb-2 text-gray-700">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
      )}

      {/* Dias */}
      <div
        className={`grid gap-2 text-center ${
          view === "month" ? "grid-cols-7" : view === "week" ? "grid-cols-7" : "grid-cols-1"
        }`}
      >
        {calendarDays.map((dayItem, index) => {
          const isToday = dayItem.isSame(today, "day");
          const isSelected = dayItem.isSame(selectedDate, "day");
          const isCurrentMonth = dayItem.month() === currentDate.month();

          let dayClasses =
            "border p-2 rounded min-h-[80px] flex flex-col transition-colors duration-150 cursor-pointer";

          if (!isCurrentMonth && view === "month") dayClasses += " opacity-40";
          if (isToday) dayClasses += " bg-amber-100 border-amber-400 text-amber-700";
          if (isSelected) dayClasses += " bg-blue-100 border-blue-400 text-blue-700";

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(dayItem)}
              className={dayClasses}
            >
              <div className="font-bold mb-1">{dayItem.date()}</div>
              {renderTasks(dayItem)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
