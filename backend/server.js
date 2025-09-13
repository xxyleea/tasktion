const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());


// Helper to read data (tasks and categories)
function readData() {
  if (!fs.existsSync(DATA_FILE)) return { tasks: [], categories: [] };
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  // Backward compatibility: if categories missing, add empty array
  if (!data.categories) data.categories = [];
  return data;
}

// Helper to write data
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}


// Get all tasks
app.get('/api/tasks', (req, res) => {
  const data = readData();
  res.json(data.tasks);
});

// Get all categories
app.get('/api/categories', (req, res) => {
  const data = readData();
  res.json(data.categories);
});


// Add or update a task
app.post('/api/tasks', (req, res) => {
  const { task } = req.body;
  if (!task || !task.id) return res.status(400).json({ error: 'Task with id required' });
  const data = readData();
  const idx = data.tasks.findIndex(t => t.id === task.id);
  if (idx >= 0) {
    data.tasks[idx] = task;
  } else {
    data.tasks.push(task);
  }
  writeData(data);
  res.json({ success: true });
});

// Add or update a category
app.post('/api/categories', (req, res) => {
  const { category } = req.body;
  if (!category || !category.id) return res.status(400).json({ error: 'Category with id required' });
  const data = readData();
  const idx = data.categories.findIndex(c => c.id === category.id);
  if (idx >= 0) {
    data.categories[idx] = category;
  } else {
    data.categories.push(category);
  }
  writeData(data);
  res.json({ success: true });
});


// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  data.tasks = data.tasks.filter(t => t.id !== id);
  writeData(data);
  res.json({ success: true });
});

// Delete a category
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  data.categories = data.categories.filter(c => c.id !== id);
  writeData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Task backend running on http://localhost:${PORT}`);
});
