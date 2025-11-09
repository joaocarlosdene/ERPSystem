"use client";

import { useState, useEffect, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import Layout from "@/components/Layout";
import CalendarComponent from "./components/calendar";
import TaskForm from "./components/taskform";
import {
  Task,
  Calendar,
  getUserCalendars,
  createCalendar,
  deleteTask,
  getUserTasks
} from "./api/calendarApi";

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = "USER_LOGADO_ID_AQUI"; // ⚠️ Substituir pelo ID do usuário logado

  // 🔹 Função para buscar tarefas (do usuário logado)
  const fetchTasks = useCallback(async (calendarId?: string) => {
    try {
      if (!calendarId) return;
      const data = await getUserTasks(currentUserId);
      setTasks(data);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
    }
  }, [currentUserId]);

  // =====================
  // CARREGAMENTO INICIAL
  // =====================
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const cals = await getUserCalendars();

        let activeCalendar: Calendar | null = null;
        if (cals.length > 0) {
          activeCalendar = cals[cals.length - 1];
        } else {
          activeCalendar = await createCalendar(`Calendário ${dayjs().format("MMMM YYYY")}`);
        }

        setCalendars([...cals, activeCalendar]);
        setSelectedCalendarId(activeCalendar.id);

        // Buscar tarefas do usuário logado no calendário selecionado
        await fetchTasks(activeCalendar.id);
      } catch (err) {
        console.error("Erro ao carregar calendários:", err);
        setError("Não foi possível carregar o calendário.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fetchTasks]);

  // =====================
  // HANDLERS DE TAREFAS
  // =====================
  const handleAddTask = (task: Task) => {
    // Atualiza tarefas do usuário logado
    fetchTasks(selectedCalendarId);
    setEditTask(null);
  };

  const handleEditTask = (task: Task) => setEditTask(task);

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Deseja realmente deletar esta tarefa?")) {
      await deleteTask(taskId);
      fetchTasks(selectedCalendarId);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-[80vh]">Carregando calendário...</div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="text-center text-red-600 mt-10">{error}</div>
    </Layout>
  );

  if (!selectedCalendarId) return (
    <Layout>
      <div className="text-center text-gray-500 mt-10">Nenhum calendário encontrado.</div>
    </Layout>
  );

  // =====================
  // FILTRAR TAREFAS DO DIA
  // =====================
  const dayTasks = tasks
    .filter((t) => dayjs(t.date).isSame(selectedDate, "day"))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-2">Calendário de Tarefas</h1>

        {/* CALENDÁRIO */}
        <CalendarComponent
          tasks={tasks}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          currentUserId={currentUserId}
          fetchTasks={() => fetchTasks(selectedCalendarId)}
        />

        {/* FORMULÁRIO */}
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-2">{editTask ? "Editar Tarefa" : "Adicionar Nova Tarefa"}</h2>
          <TaskForm
            date={selectedDate.format("YYYY-MM-DD")}
            calendarId={selectedCalendarId}
            onTaskAdded={handleAddTask}
            editTask={editTask || undefined}
            onCancelEdit={() => setEditTask(null)}
          />
        </div>

        {/* LISTA DE TAREFAS DO DIA */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-blue-500 mb-4">
            Tarefas de {selectedDate.format("DD/MM/YYYY")}
          </h2>

          {dayTasks.length === 0 ? (
            <p className="text-gray-400">Nenhuma tarefa cadastrada neste dia.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-800 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 text-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left">Horário</th>
                    <th className="px-4 py-3 text-left">Título</th>
                    <th className="px-4 py-3 text-left">Descrição</th>
                    <th className="px-4 py-3 text-left">Prioridade</th>
                    <th className="px-4 py-3 text-left">Participantes</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dayTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-800 transition-colors border-t border-gray-800">
                      <td className="px-4 py-3 text-gray-300">{dayjs(task.date).format("HH:mm")}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: task.color }}>{task.title}</td>
                      <td className="px-4 py-3 text-gray-300">{task.description || "—"}</td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{task.priority.toLowerCase()}</td>
                      <td className="px-4 py-3 text-gray-300">
                        {task.users?.map(u => u.user.name).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-3">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-2 text-yellow-400 hover:text-yellow-300"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-red-500 hover:text-red-400"
                          title="Deletar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
