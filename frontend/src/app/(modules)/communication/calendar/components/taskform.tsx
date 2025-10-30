"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Task, Priority, createTask, updateTask } from "../api/calendarApi";

// Configurar dayjs com timezone da Irlanda
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Dublin");

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
  const [color, setColor] = useState("#3b82f6");
  const [dateTime, setDateTime] = useState<Date>(new Date());

  useEffect(() => {
    if (editTask) {
      // Converte a data salva (UTC) para o fuso da Irlanda ao editar
      const taskDate = dayjs(editTask.date).tz("Europe/Dublin").toDate();
      setTitle(editTask.title);
      setDescription(editTask.description || "");
      setPriority(editTask.priority);
      setColor(editTask.color);
      setDateTime(taskDate);
    } else {
      // Inicializa com a data selecionada às 09:00 (hora da Irlanda)
      const defaultTime = dayjs(`${date}T09:00`).tz("Europe/Dublin").toDate();
      setDateTime(defaultTime);
    }
  }, [editTask, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let task: Task;

      // Converte a data escolhida (Irlanda) para UTC antes de salvar no banco
      const utcDate = dayjs(dateTime).tz("Europe/Dublin").utc().toISOString();

      if (editTask) {
        task = await updateTask(editTask.id, {
          title,
          description,
          priority,
          color,
          date: utcDate,
        });
        onCancelEdit && onCancelEdit();
      } else {
        task = await createTask(calendarId, {
          title,
          description,
          priority,
          color,
          date: utcDate,
        });
      }

      onTaskAdded(task);

      // Resetar formulário
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setColor("#3b82f6");
      setDateTime(dayjs(`${date}T09:00`).tz("Europe/Dublin").toDate());

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
          onChange={(date: Date | null) => date && setDateTime(date)}
          showTimeSelect
          timeIntervals={15}
          dateFormat="dd/MM/yyyy HH:mm"
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
