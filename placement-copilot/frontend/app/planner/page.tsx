"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlannerFolder {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  taskCount: number;
  doneCount: number;
}

interface PlannerTask {
  id: string;
  folderId: string | null;
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done";
  dueDate: string;
  createdAt: string;
}

interface Stats {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["DSA", "System Design", "Resume", "Mock Interview", "SQL", "Java", "Communication", "General"];

const FOLDER_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4",
];

const FOLDER_ICONS = ["📁", "📚", "🔢", "🏗️", "🎤", "📄", "🗄️", "☕", "🗣️", "🏆", "🎯", "💡", "🔬", "⚡", "🚀"];

const PRIORITY_STYLE: Record<string, string> = {
  high: "bg-red-100 text-red-700 border border-red-200",
  medium: "bg-amber-50 text-amber-700 border border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const STATUS_STYLE: Record<string, string> = {
  done: "bg-emerald-50 text-emerald-700",
  in_progress: "bg-amber-50 text-amber-700",
  todo: "bg-gray-100 text-gray-500",
};

const STATUS_LABEL: Record<string, string> = {
  done: "Done",
  in_progress: "In Progress",
  todo: "To Do",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Planner() {
  // ── Data state
  const [folders, setFolders] = useState<PlannerFolder[]>([]);
  const [inboxCount, setInboxCount] = useState(0);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, done: 0, inProgress: 0, todo: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── View state: null = "all tasks", "inbox" = no folder, or a folderId
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // ── Folder modal
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editFolder, setEditFolder] = useState<PlannerFolder | null>(null);
  const [folderForm, setFolderForm] = useState({ name: "", description: "", icon: "📁", color: "#6366f1" });
  const [savingFolder, setSavingFolder] = useState(false);

  // ── Task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState<PlannerTask | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "", description: "", category: "DSA", priority: "medium", dueDate: "", folderId: "",
  });
  const [savingTask, setSavingTask] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // ─── Fetch folders ───────────────────────────────────────────────────────────
  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/planner/folders");
      if (!res.ok) return;
      const data = await res.json();
      setFolders(data.folders || []);
      setInboxCount(data.inboxCount || 0);
    } catch {}
  }, []);

  // ─── Fetch tasks ─────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async (folderId: string | null) => {
    setLoading(true);
    setError("");
    try {
      const query = folderId ? `?folderId=${folderId}` : "";
      const res = await fetch(`/api/planner/tasks${query}`);
      if (!res.ok) {
        setError(res.status === 401 ? "Please log in to view your planner." : "Failed to load tasks.");
        return;
      }
      const data = await res.json();
      setTasks(data.tasks || []);
      setStats(data.stats || { total: 0, done: 0, inProgress: 0, todo: 0 });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
    fetchTasks(null);
  }, [fetchFolders, fetchTasks]);

  // ─── Folder CRUD ─────────────────────────────────────────────────────────────
  const openAddFolder = () => {
    setEditFolder(null);
    setFolderForm({ name: "", description: "", icon: "📁", color: "#6366f1" });
    setShowFolderModal(true);
  };

  const openEditFolder = (f: PlannerFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditFolder(f);
    setFolderForm({ name: f.name, description: f.description, icon: f.icon, color: f.color });
    setShowFolderModal(true);
  };

  const saveFolder = async () => {
    if (!folderForm.name.trim()) return;
    setSavingFolder(true);
    try {
      const method = editFolder ? "PATCH" : "POST";
      const url = editFolder ? `/api/planner/folders/${editFolder.id}` : "/api/planner/folders";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(folderForm),
      });
      if (res.ok) {
        setShowFolderModal(false);
        await fetchFolders();
      }
    } finally {
      setSavingFolder(false);
    }
  };

  const deleteFolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this folder and ALL its tasks? This cannot be undone.")) return;
    await fetch(`/api/planner/folders/${folderId}`, { method: "DELETE" });
    if (selectedFolder === folderId) {
      setSelectedFolder(null);
      fetchTasks(null);
    }
    fetchFolders();
  };

  // ─── Task CRUD ───────────────────────────────────────────────────────────────
  const openAddTask = (prefillFolderId?: string) => {
    setEditTask(null);
    setTaskForm({
      title: "", description: "", category: "DSA", priority: "medium", dueDate: "",
      folderId: prefillFolderId || selectedFolder || "",
    });
    setShowTaskModal(true);
  };

  const openEditTask = (t: PlannerTask) => {
    setEditTask(t);
    setTaskForm({
      title: t.title, description: t.description, category: t.category,
      priority: t.priority, dueDate: t.dueDate, folderId: t.folderId || "",
    });
    setShowTaskModal(true);
  };

  const saveTask = async () => {
    if (!taskForm.title.trim()) return;
    setSavingTask(true);
    try {
      const method = editTask ? "PATCH" : "POST";
      const url = editTask ? `/api/planner/tasks/${editTask.id}` : "/api/planner/tasks";
      const body: Record<string, string> = {
        title: taskForm.title,
        description: taskForm.description,
        category: taskForm.category,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate,
      };
      if (taskForm.folderId) body.folderId = taskForm.folderId;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowTaskModal(false);
        fetchTasks(selectedFolder);
        fetchFolders();
      }
    } finally {
      setSavingTask(false);
    }
  };

  const cycleStatus = async (task: PlannerTask) => {
    const next = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next as PlannerTask["status"] } : t)));
    await fetch(`/api/planner/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    fetchFolders();
    fetchTasks(selectedFolder);
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/planner/tasks/${taskId}`, { method: "DELETE" });
    fetchTasks(selectedFolder);
    fetchFolders();
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const selectFolder = (folderId: string | null) => {
    setSelectedFolder(folderId);
    fetchTasks(folderId);
  };

  const toggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(folderId) ? next.delete(folderId) : next.add(folderId);
      return next;
    });
  };

  const totalTasks = stats.total;
  const progressPct = totalTasks > 0 ? Math.round((stats.done / totalTasks) * 100) : 0;
  const overdue = tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== "done");

  const selectedFolderObj = selectedFolder
    ? folders.find((f) => f.id === selectedFolder)
    : null;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <Sidebar>
      <div className="flex gap-6 h-full min-h-[80vh]">

        {/* ── Left Sidebar: Folder Navigator ──────────────────────────── */}
        <aside className="w-64 flex-shrink-0 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-extrabold text-base text-on-surface tracking-tight">📋 Modules</h2>
            <button
              onClick={openAddFolder}
              title="New Folder"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
            </button>
          </div>

          {/* All Tasks */}
          <button
            onClick={() => selectFolder(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedFolder === null
                ? "bg-primary text-white shadow"
                : "hover:bg-[#eaedff] text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-base">checklist</span>
            <span className="flex-1 text-left">All Tasks</span>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${selectedFolder === null ? "bg-white/20" : "bg-[#eaedff] text-primary"}`}>
              {stats.total}
            </span>
          </button>

          {/* Inbox */}
          <button
            onClick={() => selectFolder("inbox")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedFolder === "inbox"
                ? "bg-primary text-white shadow"
                : "hover:bg-[#eaedff] text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-base">inbox</span>
            <span className="flex-1 text-left">Inbox</span>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${selectedFolder === "inbox" ? "bg-white/20" : "bg-[#eaedff] text-primary"}`}>
              {inboxCount}
            </span>
          </button>

          {/* Divider */}
          {folders.length > 0 && (
            <div className="flex items-center gap-2 mt-1 mb-0.5">
              <div className="flex-1 border-t border-dashed border-outline-variant" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Folders</span>
              <div className="flex-1 border-t border-dashed border-outline-variant" />
            </div>
          )}

          {/* Folder list */}
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[55vh] pr-1">
            {folders.map((folder) => (
              <div key={folder.id}>
                <button
                  onClick={() => { selectFolder(folder.id); toggleExpand(folder.id); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                    selectedFolder === folder.id
                      ? "shadow text-white"
                      : "hover:bg-[#eaedff] text-on-surface"
                  }`}
                  style={selectedFolder === folder.id ? { backgroundColor: folder.color } : {}}
                >
                  <span className="text-base flex-shrink-0">{folder.icon}</span>
                  <span className="flex-1 text-left truncate">{folder.name}</span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                    selectedFolder === folder.id ? "bg-white/25" : "bg-[#eaedff] text-primary"
                  }`}>
                    {folder.taskCount}
                  </span>
                  {/* Edit / Delete (visible on hover) */}
                  <span
                    onClick={(e) => openEditFolder(folder, e)}
                    className={`material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity ${
                      selectedFolder === folder.id ? "text-white" : "text-on-surface-variant"
                    }`}
                  >
                    edit
                  </span>
                  <span
                    onClick={(e) => deleteFolder(folder.id, e)}
                    className={`material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity ${
                      selectedFolder === folder.id ? "text-white/80 hover:text-white" : "text-red-400"
                    }`}
                  >
                    delete
                  </span>
                </button>

                {/* Progress bar under folder */}
                {folder.taskCount > 0 && (
                  <div className="px-3 pb-1">
                    <div className="w-full h-1 bg-[#eaedff] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round((folder.doneCount / folder.taskCount) * 100)}%`,
                          backgroundColor: folder.color,
                        }}
                      />
                    </div>
                    <p className="text-[9px] text-on-surface-variant mt-0.5 text-right">
                      {folder.doneCount}/{folder.taskCount} done
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {folders.length === 0 && (
            <div className="text-center py-4 px-2">
              <p className="text-xs text-on-surface-variant">No modules yet. Click + to create one!</p>
            </div>
          )}

          {/* Add folder shortcut */}
          <button
            onClick={openAddFolder}
            className="w-full mt-auto flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant text-sm hover:border-primary hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-base">create_new_folder</span>
            New Module
          </button>
        </aside>

        {/* ── Main Content Area ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-on-surface flex items-center gap-2">
                {selectedFolderObj
                  ? <><span>{selectedFolderObj.icon}</span> {selectedFolderObj.name}</>
                  : selectedFolder === "inbox"
                  ? "📥 Inbox"
                  : "📋 All Tasks"}
              </h1>
              {selectedFolderObj?.description && (
                <p className="text-xs text-on-surface-variant mt-0.5">{selectedFolderObj.description}</p>
              )}
            </div>
            <button
              onClick={() => openAddTask()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm shadow hover:bg-primary/90 transition-all"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Task
            </button>
          </div>

          {/* Overdue alert */}
          {overdue.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500">warning</span>
              <p className="text-sm font-bold text-red-700">
                {overdue.length} overdue task{overdue.length > 1 ? "s" : ""}: {overdue.map((t) => t.title).join(", ")}
              </p>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total", val: stats.total, icon: "checklist", color: "text-primary" },
              { label: "To Do", val: stats.todo, icon: "radio_button_unchecked", color: "text-gray-500" },
              { label: "In Progress", val: stats.inProgress, icon: "autorenew", color: "text-amber-500" },
              { label: "Done", val: stats.done, icon: "check_circle", color: "text-emerald-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-outline-variant rounded-xl p-3 flex items-center gap-3 shadow-sm">
                <span className={`material-symbols-outlined text-xl ${s.color}`}>{s.icon}</span>
                <div>
                  <p className="font-extrabold text-lg text-on-surface leading-none">{s.val}</p>
                  <p className="text-[11px] text-on-surface-variant">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {totalTasks > 0 && (
            <div className="bg-white border border-outline-variant rounded-xl px-4 py-3 mb-5 shadow-sm flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-[#eaedff] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: selectedFolderObj?.color || "#6366f1",
                    }}
                  />
                </div>
              </div>
              <span className="font-extrabold text-sm text-primary whitespace-nowrap">{progressPct}% done</span>
            </div>
          )}

          {/* Task list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-on-surface-variant">Loading tasks...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="material-symbols-outlined text-5xl text-red-400">error</span>
              <p className="font-bold text-on-surface">{error}</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <span className="text-5xl">{selectedFolderObj?.icon || "📋"}</span>
              <p className="font-bold text-lg text-on-surface">No tasks yet</p>
              <p className="text-sm text-on-surface-variant max-w-xs">
                {selectedFolderObj
                  ? `Add tasks to the "${selectedFolderObj.name}" module to get started.`
                  : "Add your first task to begin planning!"}
              </p>
              <button
                onClick={() => openAddTask()}
                className="mt-1 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow"
              >
                + Add Task
              </button>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white border rounded-xl px-4 py-3 shadow-sm transition-all hover:shadow-md flex items-start gap-3 ${
                    task.status === "done"
                      ? "border-emerald-200 opacity-75"
                      : task.dueDate && task.dueDate < today
                      ? "border-red-200"
                      : "border-outline-variant"
                  }`}
                >
                  {/* Status button */}
                  <button
                    onClick={() => cycleStatus(task)}
                    title="Click to cycle status"
                    className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      task.status === "done"
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : task.status === "in_progress"
                        ? "border-amber-400 bg-amber-50"
                        : "border-outline-variant bg-white"
                    }`}
                  >
                    {task.status === "done" && <span className="material-symbols-outlined text-sm">check</span>}
                    {task.status === "in_progress" && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-bold text-sm text-on-surface ${task.status === "done" ? "line-through text-on-surface-variant" : ""}`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${PRIORITY_STYLE[task.priority]}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#eaedff] text-primary text-[10px] font-bold">
                        {task.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLE[task.status]}`}>
                        {STATUS_LABEL[task.status]}
                      </span>
                      {/* Folder badge if in "All Tasks" view */}
                      {selectedFolder === null && task.folderId && (() => {
                        const f = folders.find((x) => x.id === task.folderId);
                        return f ? (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                            style={{ backgroundColor: f.color }}
                          >
                            {f.icon} {f.name}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    {task.description && (
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className={`text-[11px] mt-1.5 font-medium ${task.dueDate < today && task.status !== "done" ? "text-red-600" : "text-on-surface-variant"}`}>
                        📅 Due: {new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {task.dueDate < today && task.status !== "done" && " · OVERDUE"}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEditTask(task)} className="p-1.5 rounded-lg hover:bg-[#eaedff] text-on-surface-variant hover:text-primary transition-colors" title="Edit">
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors" title="Delete">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Folder Modal ──────────────────────────────────────────────── */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-on-surface">
                {editFolder ? "Edit Module" : "Create New Module"}
              </h2>
              <button onClick={() => setShowFolderModal(false)} className="p-1.5 rounded-lg hover:bg-[#f5f5f5] text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Module Name *</label>
                <input
                  type="text"
                  value={folderForm.name}
                  onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                  placeholder="e.g. Module 1 - DSA Basics"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={folderForm.description}
                  onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                  placeholder="What is this module about?"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Icon picker */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setFolderForm({ ...folderForm, icon })}
                      className={`w-9 h-9 text-xl rounded-lg flex items-center justify-center transition-all border-2 ${
                        folderForm.icon === icon ? "border-primary bg-[#eaedff]" : "border-transparent hover:bg-[#f5f5f5]"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFolderForm({ ...folderForm, color })}
                      className={`w-8 h-8 rounded-full transition-all border-4 ${
                        folderForm.color === color ? "border-on-surface scale-110" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-bold text-sm"
                style={{ backgroundColor: folderForm.color }}
              >
                <span className="text-xl">{folderForm.icon}</span>
                <span>{folderForm.name || "Module Name"}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowFolderModal(false)} className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-bold hover:bg-[#f5f5f5] transition-colors">
                Cancel
              </button>
              <button
                onClick={saveFolder}
                disabled={savingFolder || !folderForm.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {savingFolder ? "Saving..." : editFolder ? "Save Changes" : "Create Module"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Task Modal ────────────────────────────────────────────────── */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-on-surface">
                {editTask ? "Edit Task" : "Add New Task"}
              </h2>
              <button onClick={() => setShowTaskModal(false)} className="p-1.5 rounded-lg hover:bg-[#f5f5f5] text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Task Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Solve 10 binary tree problems"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Description (optional)</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Any notes about this task..."
                  rows={2}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Folder */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Module (optional)</label>
                  <select
                    value={taskForm.folderId}
                    onChange={(e) => setTaskForm({ ...taskForm, folderId: e.target.value })}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none bg-white"
                  >
                    <option value="">📥 Inbox (no module)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Category</label>
                  <select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none bg-white"
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Due Date (optional)</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTaskModal(false)} className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-bold hover:bg-[#f5f5f5] transition-colors">
                Cancel
              </button>
              <button
                onClick={saveTask}
                disabled={savingTask || !taskForm.title.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {savingTask ? "Saving..." : editTask ? "Save Changes" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </Sidebar>
  );
}
