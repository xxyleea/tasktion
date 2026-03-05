const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasktion';

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
  icon: String,
  filter: mongoose.Schema.Types.Mixed,
});

const Task = mongoose.model('Task', taskSchema);
const Category = mongoose.model('Category', categorySchema);

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read the JSON file
    const dataPath = path.join(__dirname, 'tasks.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Clear existing data
    await Task.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing data');

    // Insert tasks
    if (data.tasks && data.tasks.length > 0) {
      await Task.insertMany(data.tasks);
      console.log(`✓ Migrated ${data.tasks.length} tasks`);
    }

    // Insert categories
    if (data.categories && data.categories.length > 0) {
      await Category.insertMany(data.categories);
      console.log(`✓ Migrated ${data.categories.length} categories`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
