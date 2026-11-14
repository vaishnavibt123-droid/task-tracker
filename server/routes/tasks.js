const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pick = body => {
  const out = {};
  ["title", "description", "status", "priority", "dueDate"].forEach(k => {
    if (body[k] !== undefined) out[k] = body[k];
  });
  return out;
};

// list (search + priority filter)
router.get("/", async (req, res) => {
  try {
    const filter = { user: req.userId };
    if (req.query.q) filter.title = new RegExp(escapeRegex(String(req.query.q)), "i");
    if (["low", "medium", "high"].includes(req.query.priority))
      filter.priority = req.query.priority;
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Could not load tasks" });
  }
});

// create
router.post("/", async (req, res) => {
  try {
    const data = pick(req.body);
    if (!data.title || !String(data.title).trim())
      return res.status(400).json({ message: "Title is required" });
    const task = await Task.create({ ...data, user: req.userId });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: "Invalid task data" });
  }
});

// update
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      pick(req.body),
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: "Invalid task data" });
  }
});

// delete
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ message: "Invalid task id" });
  }
});

module.exports = router;