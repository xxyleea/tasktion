import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Task } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { ChevronLeft, ChevronRight, Calendar, Tag, Clock } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { getFilteredTasks, updateTask } = useTaskContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const tasks = getFilteredTasks();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      const taskDate = task.properties.dueDate;
      return taskDate === dateString;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date | null) => {
    if (!date) return false;
    return date.getMonth() === currentDate.getMonth();
  };

  const TaskItemDetailed: React.FC<{ task: Task }> = ({ task }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked) => 
              updateTask(task.id, { completed: Boolean(checked) })
            }
            className="mt-0.5"
          />
          <div className="flex-1">
            <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {task.properties.priority && (
                <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.properties.priority)}`}>
                  {task.properties.priority}
                </Badge>
              )}
              {task.properties.status && (
                <Badge variant="outline" className="text-xs">
                  {task.properties.status}
                </Badge>
              )}
              {task.properties.tags && Array.isArray(task.properties.tags) && (
                task.properties.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <div className="flex-1 flex h-full">
      {/* Left Half - Calendar */}
      <div className="w-1/2 p-4 border-r">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectedDate(today);
              }}
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 h-[calc(100%-120px)]">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            
            return (
              <div 
                key={date ? date.toISOString() : `empty-${index}`} 
                className={`min-h-[80px] p-2 border border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                  !isCurrentMonth(date) ? 'opacity-40' : ''
                } ${
                  isToday(date) ? 'bg-primary/10 border-primary' : ''
                } ${
                  isSelectedDate(date) ? 'bg-accent border-accent-foreground' : ''
                }`}
                onClick={() => setSelectedDate(date)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday(date) ? 'text-primary' : ''
                } ${
                  isSelectedDate(date) ? 'text-accent-foreground' : ''
                }`}>
                  {date?.getDate()}
                </div>
                
                {/* Task indicators */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div 
                      key={task.id}
                      className={`w-full h-1.5 rounded-full ${
                        task.properties.priority === 'Urgent' ? 'bg-red-500' :
                        task.properties.priority === 'High' ? 'bg-orange-500' :
                        task.properties.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                    />
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayTasks.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Half - Selected Date Tasks */}
      <div className="w-1/2 p-4 overflow-y-auto">
        <div className="sticky top-0 bg-background pb-4 border-b mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5" />
            <h2 className="text-xl font-semibold">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Select a date'}
            </h2>
          </div>
          {selectedDate && (
            <p className="text-sm text-muted-foreground">
              {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} due
            </p>
          )}
        </div>

        {selectedDate ? (
          selectedDateTasks.length > 0 ? (
            <div className="space-y-0">
              {selectedDateTasks.map((task) => (
                <TaskItemDetailed key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No tasks due</h3>
              <p className="text-sm text-muted-foreground">
                No tasks are scheduled for this date.
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Select a date</h3>
            <p className="text-sm text-muted-foreground">
              Click on a date in the calendar to view its tasks.
            </p>
          </div>
        )}

        {/* Show tasks without due dates */}
        {selectedDate && isToday(selectedDate) && (
          <>
            <Separator className="my-6" />
            <div>
              <h3 className="text-lg font-medium mb-4">Tasks without due dates</h3>
              {tasks.filter(task => !task.properties.dueDate).length > 0 ? (
                <div className="space-y-0">
                  {tasks
                    .filter(task => !task.properties.dueDate)
                    .slice(0, 5)
                    .map((task) => (
                      <TaskItemDetailed key={task.id} task={task} />
                    ))}
                  {tasks.filter(task => !task.properties.dueDate).length > 5 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      +{tasks.filter(task => !task.properties.dueDate).length - 5} more tasks without due dates
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tasks without due dates.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};