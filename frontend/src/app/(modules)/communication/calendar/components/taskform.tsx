"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Task, Priority, createTask, updateTask } from "../api/calendarApi";
import { getUsers } from "./api";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Dublin");

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
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [color, setColor] = useState<string>("#3b82f6");
  const [dateTime, setDateTime] = useState<Date>(new Date());
  const [users, setUsers] = useState<User[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const res: User[] = await getUsers();
      setUsers(res);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (editTask) {
      const taskDate = dayjs(editTask.date).tz("Europe/Dublin").toDate();
      setTitle(editTask.title);
      setDescription(editTask.description || "");
      setPriority(editTask.priority);
      setColor(editTask.color);
      setDateTime(taskDate);
      setAssignedUserIds(editTask.users?.map(u => u.user.id) || []);
    } else {
      setDateTime(dayjs(`${date}T09:00`).tz("Europe/Dublin").toDate());
      setAssignedUserIds([]);
    }
  }, [editTask, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da tarefa" className="w-full border p-1 rounded" required />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição" className="w-full border p-1 rounded" />
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Atribuir usuários:</label>
        <select multiple value={assignedUserIds} onChange={e => setAssignedUserIds(Array.from(e.target.selectedOptions, o => o.value))} className="border p-1 rounded">
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div className="flex gap-2 items-center">
        <DatePicker selected={dateTime} onChange={date => date && setDateTime(date)} showTimeSelect timeIntervals={15} dateFormat="dd/MM/yyyy HH:mm" className="border p-1 rounded flex-1" />
        <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="border p-1 rounded">
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Crítica</option>
        </select>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">{editTask ? "Atualizar Tarefa" : "Adicionar Tarefa"}</button>
        {editTask && onCancelEdit && <button type="button" onClick={onCancelEdit} className="ml-2 bg-gray-300 px-2 py-1 rounded">Cancelar</button>}
      </div>
    </form>
  );
}
