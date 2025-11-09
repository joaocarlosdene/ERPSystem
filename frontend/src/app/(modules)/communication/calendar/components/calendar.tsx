"use client";

import { useState, useEffect } from "react";
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

export default function Calendar({
  tasks,
  selectedDate,
  setSelectedDate,
  onEditTask,
  onDeleteTask,
  currentUserId,
  fetchTasks,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const today = dayjs();

  const startDay = currentDate.startOf("month").startOf("week");
  const endDay = currentDate.endOf("month").endOf("week");

  const calendarDays: Dayjs[] = [];
  let day = startDay;
  while (day.isBefore(endDay, "day") || day.isSame(endDay, "day")) {
    calendarDays.push(day);
    day = day.add(1, "day");
  }

  const renderTasks = (date: string) => {
    const dayTasks = tasks.filter((task) =>
      dayjs(task.date).isSame(dayjs(date), "day")
    );

    return dayTasks.map((task) => {
      const isCollaborative = task.users?.some(u => u.user.id !== currentUserId);
      return (
        <div
          key={task.id}
          className={`flex justify-between items-center px-1 mt-1 text-xs rounded ${
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}>
          {"<"}
        </button>
        <h2 className="text-xl font-bold capitalize">{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={() => setCurrentDate(currentDate.add(1, "month"))}>{">"}</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center font-semibold mb-2 text-gray-700">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {calendarDays.map((dayItem, index) => {
          const isToday = dayItem.isSame(today, "day");
          const isSelected = dayItem.isSame(selectedDate, "day");
          const isCurrentMonth = dayItem.month() === currentDate.month();

          let dayClasses =
            "border p-2 rounded min-h-[80px] flex flex-col transition-colors duration-150 cursor-pointer";

          if (!isCurrentMonth) dayClasses += " opacity-0 pointer-events-none";
          else if (isToday) dayClasses += " bg-amber-100 border-amber-400 text-amber-700";
          else if (isSelected) dayClasses += " bg-blue-100 border-blue-400 text-blue-700";
          else dayClasses += " hover:bg-gray-100";

          return (
            <div
              key={index}
              onClick={() => isCurrentMonth && setSelectedDate(dayItem)}
              className={dayClasses}
            >
              <div className="font-bold mb-1">{dayItem.date()}</div>
              {renderTasks(dayItem.format("YYYY-MM-DD"))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
