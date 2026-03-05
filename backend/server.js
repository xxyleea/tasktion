const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasktion';

// Serve built frontend
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI).catch(err => console.error('MongoDB connection error:', err));

// Task Schema
const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  parentId: String,
  completed: Boolean,
  properties: mongoose.Schema.Types.Mixed,
  createdAt: String,
  updatedAt: String,
});

// Category Schema
const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  color: String,
  properties: mongoose.Schema.Types.Mixed,
  createdAt: String,
  updatedAt: String,
});

const Task = mongoose.model('Task', taskSchema);
const Category = mongoose.model('Category', categorySchema);

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update a task
app.post('/api/tasks', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task || !task.id) return res.status(400).json({ error: 'Task with id required' });
    
    const existingTask = await Task.findOne({ id: task.id });
    if (existingTask) {
      await Task.updateOne({ id: task.id }, task);
    } else {
      const newTask = new Task(task);
      await newTask.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update a category
app.post('/api/categories', async (req, res) => {
  try {
    const { category } = req.body;
    if (!category || !category.id) return res.status(400).json({ error: 'Category with id required' });
    
    const existingCategory = await Category.findOne({ id: category.id });
    if (existingCategory) {
      await Category.updateOne({ id: category.id }, category);
    } else {
      const newCategory = new Category(category);
      await newCategory.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Task.deleteOne({ id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Category.deleteOne({ id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Task backend running on port ${PORT}`);
});
