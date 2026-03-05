import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TASKS_URL = `${API_BASE}/api/tasks`;
const CATEGORIES_URL = `${API_BASE}/api/categories`;

export const api = {
  async getTasks(): Promise<any[]> {
    const res = await axios.get(TASKS_URL);
    return res.data;
  },
  async saveTask(task: any): Promise<void> {
    await axios.post(TASKS_URL, { task });
  },
  async deleteTask(id: string): Promise<void> {
    await axios.delete(`${TASKS_URL}/${id}`);
  },

  // Category API
  async getCategories(): Promise<any[]> {
    const res = await axios.get(CATEGORIES_URL);
    return res.data;
  },
  async saveCategory(category: any): Promise<void> {
    await axios.post(CATEGORIES_URL, { category });
  },
  async deleteCategory(id: string): Promise<void> {
    await axios.delete(`${CATEGORIES_URL}/${id}`);
  }
};
