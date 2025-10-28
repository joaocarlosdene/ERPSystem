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
  const [repeat, setRepeat] = useState<"none" | "weekly" | "monthly" | "yearly">("none");
  const [repeatUntil, setRepeatUntil] = useState<Date | null>(null);
  const [repeatCount, setRepeatCount] = useState<number>(5);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || "");
      setPriority(editTask.priority);
      setColor(editTask.color);
      setDateTime(new Date(editTask.date));
      setRepeat("none"); // ao editar, por padrão não aplicamos repetição automática
      setRepeatUntil(null);
      setRepeatCount(5);
    } else {
      // Inicializa com a data selecionada e hora padrão 09:00
      setDateTime(new Date(`${date}T09:00`));
      setRepeat("none");
      setRepeatUntil(null);
      setRepeatCount(5);
    }
  }, [editTask, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Por favor, informe o título da tarefa.");
      return;
    }

    try {
      const baseTaskData = { title, description, priority, color };
      const createdTasks: Task[] = [];

      // Cria a tarefa principal (ou atualiza)
      if (editTask) {
        const updated = await updateTask(editTask.id, {
          ...baseTaskData,
          date: dateTime.toISOString(),
        });
        createdTasks.push(updated);
      } else {
        const mainTask = await createTask(calendarId, {
          ...baseTaskData,
          date: dateTime.toISOString(),
        });
        createdTasks.push(mainTask);
      }

      // Se for criação (não edição) e tiver repetição, gera as repetições
      if (!editTask && repeat !== "none") {
        let nextDate = dayjs(dateTime);

        // i começa em 1 porque já criamos a primeira ocorrência
        for (let i = 1; ; i++) {
          if (repeat === "weekly") nextDate = nextDate.add(1, "week");
          if (repeat === "monthly") nextDate = nextDate.add(1, "month");
          if (repeat === "yearly") nextDate = nextDate.add(1, "year");

          // se há data final e ultrapassou, pare
          if (repeatUntil && nextDate.isAfter(dayjs(repeatUntil), "day")) break;

          // se não há data final, pare quando exceder repeatCount
          if (!repeatUntil && i > repeatCount) break;

          const newTask = await createTask(calendarId, {
            ...baseTaskData,
            date: nextDate.toISOString(),
          });
          createdTasks.push(newTask);
        }
      }

      // Comunica o componente pai (por cada tarefa criada/atualizada)
      createdTasks.forEach((t) => onTaskAdded(t));

      // Feedback ao usuário
      if (editTask) {
        alert("Tarefa atualizada com sucesso!");
      } else if (repeat !== "none") {
        const info = repeatUntil
          ? `até ${dayjs(repeatUntil).format("DD/MM/YYYY")}`
          : `${repeatCount} vezes`;
        alert(`Tarefa criada e réplica configurada (${repeat} - ${info}).`);
      } else {
        alert("Tarefa criada com sucesso!");
      }

      // Reseta o formulário (após criação)
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setColor("#3b82f6");
      setDateTime(new Date(`${date}T09:00`));
      setRepeat("none");
      setRepeatUntil(null);
      setRepeatCount(5);

      if (editTask && onCancelEdit) onCancelEdit();
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

      {/* DateTime Picker + Priority + Color */}
      <div className="flex gap-2 items-center">
        <DatePicker
          selected={dateTime}
          onChange={(date: Date | null) => date && setDateTime(date)}
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
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>

      {/* Repetição (mantendo estilo simples e consistente) */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-gray-600">Repetir:</label>
        <select
          value={repeat}
          onChange={(e) =>
            setRepeat(e.target.value as "none" | "weekly" | "monthly" | "yearly")
          }
          className="border p-1 rounded"
        >
          <option value="none">Não repetir</option>
          <option value="weekly">Semanalmente</option>
          <option value="monthly">Mensalmente</option>
          <option value="yearly">Anualmente</option>
        </select>

        {repeat !== "none" && (
          <>
            <span className="text-sm text-gray-600">até</span>
            <DatePicker
              selected={repeatUntil}
              onChange={(d: Date | null) => setRepeatUntil(d)}
              placeholderText="Selecione uma data"
              className="border p-1 rounded"
              dateFormat="dd/MM/yyyy"
            />
            <span className="text-sm text-gray-600">ou repetir</span>
            <input
              type="number"
              value={repeatCount}
              onChange={(e) => setRepeatCount(parseInt(e.target.value) || 1)}
              className="border w-16 p-1 rounded text-center"
              min={1}
              max={200}
            />
            <span className="text-sm text-gray-600">vezes</span>
          </>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
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
