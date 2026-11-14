import { useState } from "react";

export default function TaskForm({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [status, setStatus] = useState(task?.status || "todo");
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!title.trim()) return setError("Title is required");
    setBusy(true);
    try {
      await onSave({ title, description, priority, status, dueDate: dueDate || null });
      onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <h2>{task ? "Edit task" : "New task"}</h2>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} />
        <textarea
          placeholder="Details (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
        <div className="row">
          <label>
            Priority
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            Status
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="todo">To do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>
        <label>
          Due date
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="primary" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}