"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Task, Priority, createTask, updateTask } from "../api/calendarApi";
import { getUsers } from "./api";
import { useAuth } from "@/context/AuthContext";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Dublin");

// Tipagem de usuário
type User = { id: string; name: string };

type TaskFormProps = {
  date: string;
  calendarId: string;
  onTaskAdded: (task: Task) => void;
  editTask?: Task & { users?: { user: User }[] };
  onCancelEdit?: () => void;
};

export default function TaskForm({
  date,
  calendarId,
  onTaskAdded,
  editTask,
  onCancelEdit,
}: TaskFormProps) {
  const { user: currentUser } = useAuth(); // ✅ pega usuário logado do contexto

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [color, setColor] = useState<string>("#3b82f6");
  const [dateTime, setDateTime] = useState<Date>(new Date());
  const [users, setUsers] = useState<User[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);

  // Busca usuários e filtra o usuário logado
  useEffect(() => {
    async function fetchUsers() {
      if (!currentUser) return;

      const res: User[] = await getUsers();

      // Remove o usuário logado da lista
      const filtered = res.filter(u => u.id !== currentUser.id);
      setUsers(filtered);
    }
    fetchUsers();
  }, [currentUser]);

  // Inicializa campos ao criar ou editar
  useEffect(() => {
    if (!currentUser) return;

    if (editTask) {
      const taskDate = dayjs(editTask.date).tz("Europe/Dublin").toDate();
      setTitle(editTask.title);
      setDescription(editTask.description || "");
      setPriority(editTask.priority);
      setColor(editTask.color);
      setDateTime(taskDate);

      // Remove o usuário logado da lista de atribuídos
      setAssignedUserIds(
        editTask.users?.map(u => u.user.id).filter(id => id !== currentUser.id) || []
      );
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setColor("#3b82f6");
      setDateTime(dayjs(`${date}T09:00`).tz("Europe/Dublin").toDate());
      setAssignedUserIds([]);
    }
  }, [editTask, date, currentUser]);

  // Salvar tarefa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const utcDate = dayjs(dateTime).tz("Europe/Dublin").utc().toISOString();
      const taskPayload = { title, description, priority, color, date: utcDate, assignedUserIds };

      let task: Task;
      if (editTask) {
        task = await updateTask(editTask.id, taskPayload);
        onCancelEdit?.();
      } else {
        task = await createTask(calendarId, taskPayload);
      }

      onTaskAdded(task);

      // Resetar formulário
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setColor("#3b82f6");
      setDateTime(dayjs(`${date}T09:00`).tz("Europe/Dublin").toDate());
      setAssignedUserIds([]);
    } catch (err) {
      console.error("Erro ao salvar a tarefa:", err);
      alert("Erro ao salvar a tarefa. Veja o console.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2 p-2 border rounded">
      {/* Título */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Título da tarefa"
        className="w-full border p-1 rounded"
        required
      />

      {/* Descrição */}
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Descrição"
        className="w-full border p-1 rounded"
      />

      {/* Seleção de usuários */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Atribuir usuários:</label>
        <select
          multiple
          value={assignedUserIds}
          onChange={e => setAssignedUserIds(Array.from(e.target.selectedOptions, o => o.value))}
          className="border p-1 rounded"
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Data, prioridade e cor */}
      <div className="flex gap-2 items-center">
        <DatePicker
          selected={dateTime}
          onChange={date => date && setDateTime(date)}
          showTimeSelect
          timeIntervals={15}
          dateFormat="dd/MM/yyyy HH:mm"
          className="border p-1 rounded flex-1"
        />
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as Priority)}
          className="border p-1 rounded"
        >
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Crítica</option>
        </select>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
      </div>

      {/* Botões */}
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
