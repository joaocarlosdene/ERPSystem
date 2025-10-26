"use client";

import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import Calendar, { Task } from "./components/calendar";
import TaskForm from "./components/taskform";
import Layout from "@/components/Layout";

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const addTask = (title: string) => {
    const newTask: Task = {
      id: tasks.length + 1,
      title,
      date: selectedDate.format("YYYY-MM-DD"),
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <Layout>
      <div className="p-4">
        <Calendar tasks={tasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        <TaskForm date={selectedDate.format("YYYY-MM-DD")} onAddTask={addTask} />
      </div>
    </Layout>
  );
}
