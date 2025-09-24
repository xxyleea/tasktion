import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, SortAsc } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { TaskItem } from './TaskItem';
import { Task } from '../types';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

export const TaskList: React.FC = () => {
  const { tasks, addTask, addTaskAfter, deleteTask, updateTask, getTaskTree, currentCategory, categories } = useTaskContext();

  // Helper: get default tag for current category (if tag-filtered)
  const currentCategoryObj = categories.find(c => c.id === currentCategory);
  const defaultTag =
    currentCategory === 'urgent'
      ? undefined
      : currentCategoryObj &&
        currentCategoryObj.filter &&
        currentCategoryObj.filter.propertyId === 'tags' &&
        typeof currentCategoryObj.filter.value === 'string'
        ? currentCategoryObj.filter.value
        : undefined;

  // Show correct header for built-in categories
  let currentCategoryName = 'All Tasks';
  if (currentCategory === 'urgent') {
    currentCategoryName = 'Urgent';
  } else if (currentCategoryObj) {
    currentCategoryName = currentCategoryObj.name;
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const taskRefs = useRef<Record<string, HTMLInputElement | null>>({});


  // Get flat list of tasks for document-style editing - preserving flat array order
  const getFlatTaskList = (): { task: Task; level: number }[] => {
    const taskTree = getTaskTree();
    const flatList: { task: Task; level: number }[] = [];

    const addTasksToList = (tasks: Task[], level: number) => {
      // Don't sort here - preserve the order from the flat tasks array
      // The tree structure already reflects the correct document order
      tasks.forEach(task => {
        flatList.push({ task, level });
        if (task.children && task.children.length > 0) {
          addTasksToList(task.children, level + 1);
        }
      });
    };

    addTasksToList(taskTree, 0);
    return flatList;
  };

  const filteredAndSortedTasks = () => {
    let flatTasks = getFlatTaskList();
    
    // Filter by search term
    if (searchTerm) {
      flatTasks = flatTasks.filter(({ task }) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Only sort if explicitly requested (not by default creation order)
    if (sortBy !== 'createdAt' || sortOrder !== 'asc') {
      flatTasks.sort(({ task: a }, { task: b }) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'priority':
            const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
            aValue = priorityOrder[a.properties.priority as keyof typeof priorityOrder] || 0;
            bValue = priorityOrder[b.properties.priority as keyof typeof priorityOrder] || 0;
            break;
          case 'status':
            aValue = a.properties.status || '';
            bValue = b.properties.status || '';
            break;
          default:
            return 0; // No sorting
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return flatTasks;
  };

  const taskList = filteredAndSortedTasks();

  const handleCreateTaskAfter = useCallback((afterTaskId: string, title: string = '', parentId?: string) => {
    const properties: Record<string, any> = {};
    if (currentCategory === 'urgent') {
      properties.priority = 'Urgent';
    } else if (defaultTag) {
      properties.tags = [defaultTag];
    }
    const newTask = addTaskAfter({
      title: title || '',
      parentId,
      properties,
      completed: false
    }, afterTaskId);
    // Focus the new task after a brief delay to ensure DOM updates
    setTimeout(() => {
      setFocusedTaskId(newTask.id);
    }, 0);
    return newTask;
  }, [addTaskAfter, defaultTag]);

  const handleDeleteTask = useCallback((taskId: string) => {
    const taskIndex = taskList.findIndex(({ task }) => task.id === taskId);
    deleteTask(taskId);
    
    // Focus previous task if available
    if (taskIndex > 0) {
      setFocusedTaskId(taskList[taskIndex - 1].task.id);
    } else if (taskList.length > 1) {
      setFocusedTaskId(taskList[1]?.task.id || null);
    } else {
      setFocusedTaskId(null);
    }
  }, [taskList, deleteTask]);

  const handleIndentTask = useCallback((taskId: string) => {
    const taskIndex = taskList.findIndex(({ task }) => task.id === taskId);
    const currentTask = taskList[taskIndex];
    
    if (!currentTask || taskIndex === 0) return;

    // Find the previous task at the same or higher level to be the new parent
    let newParentId: string | undefined;
    for (let i = taskIndex - 1; i >= 0; i--) {
      const prevTask = taskList[i];
      if (prevTask.level <= currentTask.level) {
        newParentId = prevTask.task.id;
        break;
      }
    }

    updateTask(taskId, { parentId: newParentId });
  }, [taskList, updateTask]);

  const handleUnindentTask = useCallback((taskId: string) => {
    const currentTaskData = taskList.find(({ task }) => task.id === taskId);
    if (!currentTaskData || currentTaskData.level === 0) return;

    const currentParent = tasks.find(t => t.id === currentTaskData.task.parentId);
    if (currentParent) {
      updateTask(taskId, { parentId: currentParent.parentId });
    }
  }, [taskList, tasks, updateTask]);

  // Arrow key navigation
  const handleArrowNavigation = useCallback((taskId: string, direction: 'up' | 'down') => {
    const currentIndex = taskList.findIndex(({ task }) => task.id === taskId);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    } else {
      newIndex = currentIndex < taskList.length - 1 ? currentIndex + 1 : taskList.length - 1;
    }

    if (newIndex !== currentIndex && taskList[newIndex]) {
      setFocusedTaskId(taskList[newIndex].task.id);
    }
  }, [taskList]);

  // Focus management
  useEffect(() => {
    if (focusedTaskId && taskRefs.current[focusedTaskId]) {
      const input = taskRefs.current[focusedTaskId];
      if (input) {
        // Use setTimeout to ensure DOM has updated
        const timeoutId = setTimeout(() => {
          input.focus();
          // Place cursor at end
          const value = input.value;
          input.setSelectionRange(value.length, value.length);
        }, 0);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [focusedTaskId]);

  const registerTaskRef = useCallback((taskId: string, ref: HTMLInputElement | null) => {
    taskRefs.current[taskId] = ref;
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{currentCategoryName}</h1>
            <p className="text-sm text-muted-foreground">
              {taskList.length} tasks
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Sort by</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Order</label>
                  <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Task List - Document Style */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-0">
          {taskList.map(({ task, level }) => (
            <TaskItem
              key={task.id}
              task={task}
              level={level}
              onCreateTaskAfter={handleCreateTaskAfter}
              onDeleteTask={handleDeleteTask}
              onIndentTask={handleIndentTask}
              onUnindentTask={handleUnindentTask}
              onArrowNavigation={handleArrowNavigation}
              registerRef={registerTaskRef}
              isAutoFocused={focusedTaskId === task.id}
            />
          ))}
          
          {/* Empty state or add first task */}
          {taskList.length === 0 && (
            <div
              className="flex items-center gap-2 py-2 cursor-text text-muted-foreground/60"
              onClick={() => {
                const properties: Record<string, any> = {};
                if (currentCategory === 'urgent') {
                  properties.priority = 'Urgent';
                } else if (defaultTag) {
                  properties.tags = [defaultTag];
                }
                const newTask = addTask({
                  title: '',
                  properties,
                  completed: false
                });
                setTimeout(() => {
                  setFocusedTaskId(newTask.id);
                }, 0);
              }}
            >
              <div className="w-4 h-4 border border-dashed border-muted-foreground/30 rounded-sm" />
              <span className="select-none">
                Start typing to create your first task...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};