"use client";

import { useState } from "react";

type TaskFormProps = {
  date: string;
  onAddTask: (title: string) => void;
};

export default function TaskForm({ date, onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onAddTask(title);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`Nova tarefa para ${date}`}
        className="border rounded px-2 py-1 flex-1"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
      >
        Adicionar
      </button>
    </form>
  );
}
