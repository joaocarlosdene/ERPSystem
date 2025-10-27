"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Task, Priority, createTask, updateTask } from "../api/calendarApi";

type TaskFormProps = {
  date: string; // YYYY-MM-DD
  calendarId: string;
  onTaskAdded: (task: Task) => void;
  editTask?: Task;
  onCancelEdit?: () => void;
};

export default function TaskForm({
  date,
  calendarId,
  onTaskAdded,
  editTask,
  onCancelEdit,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [color, setColor] = useState("#3b82f6"); // azul padrão
  const [dateTime, setDateTime] = useState<Date>(new Date());

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || "");
      setPriority(editTask.priority);
      setColor(editTask.color);
      setDateTime(new Date(editTask.date));
    } else {
      // Inicializa com a data selecionada e hora padrão 09:00
      setDateTime(new Date(`${date}T09:00`));
    }
  }, [editTask, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let task: Task;

      if (editTask) {
        task = await updateTask(editTask.id, {
          title,
          description,
          priority,
          color,
          date: dateTime.toISOString(),
        });
        onCancelEdit && onCancelEdit();
      } else {
        task = await createTask(calendarId, {
          title,
          description,
          priority,
          color,
          date: dateTime.toISOString(),
        });
      }

      onTaskAdded(task);

      // Resetar formulário
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setColor("#3b82f6");
      setDateTime(new Date(`${date}T09:00`));

    } catch (err) {
      console.error("Erro ao criar/editar tarefa:", err);
      alert("Erro ao salvar a tarefa. Veja o console para mais detalhes.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2 p-2 border rounded">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da tarefa"
        className="w-full border p-1 rounded"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição"
        className="w-full border p-1 rounded"
      />

      {/* DateTime Picker */}
      <div className="flex gap-2 items-center">
        <DatePicker
          selected={dateTime}
          onChange={(date: Date) => date && setDateTime(date)}
          showTimeSelect
          timeIntervals={15}
          dateFormat="Pp"
          className="border p-1 rounded flex-1"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="border p-1 rounded"
        >
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Crítica</option>
        </select>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          {editTask ? "Atualizar Tarefa" : "Adicionar Tarefa"}
        </button>
        {editTask && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="ml-2 bg-gray-300 px-2 py-1 rounded"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
