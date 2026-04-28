const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// GET /api/todos — return all todos newest first
router.get('/', async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    next(err);
  }
});

// POST /api/todos — create a new todo
router.post('/', async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const todo = await Todo.create({ title: title.trim(), description: description?.trim() || '' });
    res.status(201).json(todo);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(', ') });
    }
    next(err);
  }
});

// PUT /api/todos/:id — update title and/or description
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { title: title.trim(), description: description?.trim() || '' },
      { new: true, runValidators: true }
    );
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(', ') });
    }
    next(err);
  }
});

// PATCH /api/todos/:id/done — toggle done status
router.patch('/:id/done', async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    todo.done = !todo.done;
    await todo.save();
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/todos/completed — delete all completed todos (must be before /:id)
router.delete('/completed', async (req, res, next) => {
  try {
    const result = await Todo.deleteMany({ done: true });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/todos/:id — delete a todo
router.delete('/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json({ message: 'Todo deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
