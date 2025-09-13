import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Task, TaskProperty, Category, ViewMode } from '../types';
import { storage, StorageData } from '../utils/storage';
import { api } from '../utils/api';

interface TaskContextType {
  user: { name: string; email: string };
  updateUser: (updates: Partial<{ name: string; email: string }>) => void;
  tasks: Task[];
  properties: TaskProperty[];
  categories: Category[];
  currentView: ViewMode;
  currentCategory: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  addTaskAfter: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, afterTaskId: string) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addProperty: (property: Omit<TaskProperty, 'id'>) => void;
  updateProperty: (id: string, updates: Partial<TaskProperty>) => void;
  addTagOption: (newTag: string) => void;
  deleteTagOption: (tagToDelete: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  setCurrentView: (view: ViewMode) => void;
  setCurrentCategory: (categoryId: string | null) => void;
  getFilteredTasks: () => Task[];
  getTaskTree: () => Task[];
  getAllTags: () => string[];
  getAllAvailableTagOptions: () => string[];
  
  // Storage methods
  exportData: () => string;
  importData: (data: string) => Promise<void>;
  clearAllData: () => void;
  getStorageStats: () => { size: number; backupCount: number; lastModified: string };
  isLoading: boolean;
  lastSaved: Date | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState({ name: 'Lia', email: 'lia@example.com' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<TaskProperty[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [currentCategory, setCurrentCategory] = useState<string | null>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load tasks from backend on mount

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [tasks, categories] = await Promise.all([
          api.getTasks(),
          api.getCategories()
        ]);
        console.log('[TaskContext] Loaded tasks from backend:', tasks);
        console.log('[TaskContext] Loaded categories from backend:', categories);
        setTasks(tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        })));
        setCategories(categories);
      } catch (error) {
        console.error('[TaskContext] Failed to load tasks or categories from backend:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Auto-save function with debouncing
  const autoSave = useCallback((updatedData: Partial<StorageData>) => {
    // Convert dates to ISO strings for storage
    const dataToSave = {
      ...updatedData,
      tasks: updatedData.tasks?.map(task => ({
        ...task,
        createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
        updatedAt: task.updatedAt instanceof Date ? task.updatedAt.toISOString() : task.updatedAt
      }))
    };

    storage.autoSave(dataToSave);
    setLastSaved(new Date());
  }, []);

  const updateUser = (updates: Partial<{ name: string; email: string }>) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    autoSave({ user: updatedUser });
  };

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks(prev => [...prev, task]);
    api.saveTask(task);
    return task;
  };

  const addTaskAfter = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, afterTaskId: string) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedTasks = [...tasks];
    const afterTaskIndex = updatedTasks.findIndex(t => t.id === afterTaskId);
    
    if (afterTaskIndex === -1) {
      updatedTasks.push(task);
    } else {
      // Find where to insert: after this task and all its descendants
      let insertIndex = afterTaskIndex + 1;
      
      // Check if this task has any children (descendants)
      const hasChildren = updatedTasks.some(t => t.parentId === afterTaskId);
      
      if (hasChildren) {
        // Find the position after the last descendant
        for (let i = afterTaskIndex + 1; i < updatedTasks.length; i++) {
          const currentTask = updatedTasks[i];
          
          // Check if this task is a descendant of afterTaskId
          let isDescendant = false;
          let checkTask = currentTask;
          
          while (checkTask.parentId) {
            if (checkTask.parentId === afterTaskId) {
              isDescendant = true;
              break;
            }
            const foundTask = updatedTasks.find(t => t.id === checkTask.parentId);
            if (!foundTask) break;
            checkTask = foundTask;
          }
          
          if (!isDescendant) {
            insertIndex = i;
            break;
          } else {
            insertIndex = i + 1;
          }
        }
      }
      
      updatedTasks.splice(insertIndex, 0, task);
    }
    
    setTasks(updatedTasks);
    autoSave({ tasks: updatedTasks });
    return task;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      );
      const updatedTask = updatedTasks.find(t => t.id === id);
      if (updatedTask) api.saveTask(updatedTask);
      return updatedTasks;
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => {
      // Find all descendants to delete
      const toDelete = new Set([id]);
      let foundNew = true;
      while (foundNew) {
        foundNew = false;
        prev.forEach(task => {
          if (task.parentId && toDelete.has(task.parentId) && !toDelete.has(task.id)) {
            toDelete.add(task.id);
            foundNew = true;
          }
        });
      }
      const filteredTasks = prev.filter(task => !toDelete.has(task.id));
      api.deleteTask(id);
      return filteredTasks;
    });
  };

  const addProperty = (newProperty: Omit<TaskProperty, 'id'>) => {
    const property: TaskProperty = {
      ...newProperty,
      id: Date.now().toString()
    };
    const updatedProperties = [...properties, property];
    setProperties(updatedProperties);
    autoSave({ properties: updatedProperties });
  };

  const updateProperty = (id: string, updates: Partial<TaskProperty>) => {
    const updatedProperties = properties.map(prop =>
      prop.id === id ? { ...prop, ...updates } : prop
    );
    setProperties(updatedProperties);
    autoSave({ properties: updatedProperties });
  };

  const addTagOption = (newTag: string) => {
    // No longer update static property; tags are now dynamic from tasks
    // This function is kept for compatibility, but does nothing now
    // Tag will be added to the task directly in handleAddTag in TaskItem
  };

  const deleteTagOption = (tagToDelete: string) => {
    const tagsProperty = properties.find(p => p.id === 'tags');
    if (tagsProperty && tagsProperty.options?.includes(tagToDelete)) {
      updateProperty('tags', {
        options: tagsProperty.options.filter(tag => tag !== tagToDelete)
      });
      
      // Also remove this tag from all tasks that have it
      const updatedTasks = tasks.map(task => {
        if (task.properties.tags && Array.isArray(task.properties.tags)) {
          const filteredTags = task.properties.tags.filter((tag: string) => tag !== tagToDelete);
          return {
            ...task,
            properties: {
              ...task.properties,
              tags: filteredTags
            },
            updatedAt: new Date()
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      autoSave({ tasks: updatedTasks });
    }
  };

  const addCategory = (newCategory: Omit<Category, 'id'>) => {
    const category: Category = {
      ...newCategory,
      id: Date.now().toString()
    };
    const updatedCategories = [...categories, category];
    setCategories(updatedCategories);
    api.saveCategory(category);
  };

  const handleSetCurrentView = (view: ViewMode) => {
    setCurrentView(view);
    autoSave({ currentView: view });
  };

  const handleSetCurrentCategory = (categoryId: string | null) => {
    setCurrentCategory(categoryId);
    autoSave({ currentCategory: categoryId });
  };

  const getAllTags = (): string[] => {
    const allTags = new Set<string>();
    tasks.forEach(task => {
      if (task.properties.tags && Array.isArray(task.properties.tags)) {
        task.properties.tags.forEach((tag: string) => allTags.add(tag));
      }
    });
    return Array.from(allTags);
  };

  const getAllAvailableTagOptions = (): string[] => {
    // Return all unique tags from tasks
    const allTags = new Set<string>();
    tasks.forEach(task => {
      if (task.properties.tags && Array.isArray(task.properties.tags)) {
        task.properties.tags.forEach((tag: string) => allTags.add(tag));
      }
    });
    return Array.from(allTags);
  };

  const getFilteredTasks = (): Task[] => {
    if (!currentCategory || currentCategory === 'all') {
      return tasks;
    }

    const category = categories.find(c => c.id === currentCategory);
    if (!category?.filter.propertyId) {
      return tasks;
    }

    return tasks.filter(task => {
      const taskValue = task.properties[category.filter.propertyId!];
      if (Array.isArray(taskValue)) {
        return taskValue.includes(category.filter.value);
      }
      return taskValue === category.filter.value;
    });
  };

  const getTaskTree = (): Task[] => {
    const filteredTasks = getFilteredTasks();
    const taskMap = new Map<string, Task>();
    const rootTasks: Task[] = [];

    // First pass: create map and initialize children arrays
    filteredTasks.forEach(task => {
      taskMap.set(task.id, { ...task, children: [] });
    });

    // Second pass: build tree structure - preserving order from flat array
    filteredTasks.forEach(task => {
      const taskWithChildren = taskMap.get(task.id)!;
      if (task.parentId && taskMap.has(task.parentId)) {
        // Push children in the order they appear in the flat array
        taskMap.get(task.parentId)!.children!.push(taskWithChildren);
      } else {
        // Push root tasks in the order they appear in the flat array
        rootTasks.push(taskWithChildren);
      }
    });

    return rootTasks;
  };

  // Storage methods
  const exportData = () => {
    return storage.exportData();
  };

  const importData = async (data: string) => {
    try {
      await storage.importData(data);
      // Reload data after import
      window.location.reload();
    } catch (error) {
      throw error;
    }
  };

  const clearAllData = () => {
    storage.clearData();
    // Reset to default values
    setUser({ name: 'Lia', email: 'lia@example.com' });
    setTasks([]);
    setProperties([]);
    setCategories([]);
    setCurrentView('list');
    setCurrentCategory('all');
    setLastSaved(null);
  };

  const getStorageStats = () => {
    return storage.getStorageStats();
  };

  return (
    <TaskContext.Provider value={{
      user,
      updateUser,
      tasks,
      properties,
      categories,
      currentView,
      currentCategory,
      addTask,
      addTaskAfter,
      updateTask,
      deleteTask,
      addProperty,
      updateProperty,
      addTagOption,
      deleteTagOption,
      addCategory,
      setCurrentView: handleSetCurrentView,
      setCurrentCategory: handleSetCurrentCategory,
      getFilteredTasks,
      getTaskTree,
      getAllTags,
      getAllAvailableTagOptions,
      exportData,
      importData,
      clearAllData,
      getStorageStats,
      isLoading,
      lastSaved
    }}>
      {children}
    </TaskContext.Provider>
  );
};