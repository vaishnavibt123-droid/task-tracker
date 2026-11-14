import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import TaskForm from "./TaskForm";

const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "doing", label: "Doing" },
  { key: "done", label: "Done" },
];
const ORDER = ["todo", "doing", "done"];

export default function Board() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | task

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (priority) params.set("priority", priority);
    setLoading(true);
    api(`/tasks?${params}`, { token })
      .then(data => {
        setTasks(data);
        setError("");
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [query, priority, token]);

  const save = async data => {
    if (editing && editing !== "new") {
      const updated = await api(`/tasks/${editing._id}`, { method: "PUT", body: data, token });
      setTasks(ts => ts.map(t => (t._id === updated._id ? updated : t)));
    } else {
      const created = await api("/tasks", { method: "POST", body: data, token });
      setTasks(ts => [created, ...ts]);
    }
  };

  const move = async (task, dir) => {
    const next = ORDER[ORDER.indexOf(task.status) + dir];
    if (!next) return;
    try {
      const updated = await api(`/tasks/${task._id}`, { method: "PUT", body: { status: next }, token });
      setTasks(ts => ts.map(t => (t._id === updated._id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async task => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api(`/tasks/${task._id}`, { method: "DELETE", token });
      setTasks(ts => ts.filter(t => t._id !== task._id));
    } catch (err) {
      setError(err.message);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="board-wrap">
      <div className="toolbar">
        <input placeholder="Search tasks" value={query} onChange={e => setQuery(e.target.value)} />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button className="primary" onClick={() => setEditing("new")}>+ New task</button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="msg">Loading...</p>}

      <div className="board">
        {COLUMNS.map(col => {
          const list = tasks.filter(t => t.status === col.key);
          return (
            <section className="column" key={col.key}>
              <h3>
                {col.label} <span className="count">{list.length}</span>
              </h3>
              {list.length === 0 && !loading && <p className="empty">Nothing here yet.</p>}
              {list.map(t => {
                const due = t.dueDate ? t.dueDate.slice(0, 10) : "";
                const overdue = due && due < today && t.status !== "done";
                return (
                  <article className="task" key={t._id}>
                    <div className="task-head">
                      <strong>{t.title}</strong>
                      <span className={"pill " + t.priority}>{t.priority}</span>
                    </div>
                    {t.description && <p>{t.description}</p>}
                    {due && <small className={overdue ? "overdue" : ""}>Due {due}</small>}
                    <div className="task-actions">
                      <button disabled={t.status === "todo"} onClick={() => move(t, -1)} aria-label="Move left">←</button>
                      <button disabled={t.status === "done"} onClick={() => move(t, 1)} aria-label="Move right">→</button>
                      <button onClick={() => setEditing(t)}>Edit</button>
                      <button onClick={() => remove(t)}>Delete</button>
                    </div>
                  </article>
                );
              })}
            </section>
          );
        })}
      </div>

      {editing && (
        <TaskForm
          task={editing === "new" ? null : editing}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}