import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { useTaskContext } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { MoreHorizontal, Calendar, Tag, Check, ChevronsUpDown, X, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface TaskItemProps {
  task: Task;
  level: number;
  onCreateTaskAfter: (afterTaskId: string, title?: string, parentId?: string) => Task;
  onDeleteTask: (taskId: string) => void;
  onIndentTask: (taskId: string) => void;
  onUnindentTask: (taskId: string) => void;
  onArrowNavigation: (taskId: string, direction: 'up' | 'down') => void;
  registerRef: (taskId: string, ref: HTMLInputElement | null) => void;
  isAutoFocused?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  level,
  onCreateTaskAfter, 
  onDeleteTask, 
  onIndentTask, 
  onUnindentTask,
  onArrowNavigation,
  registerRef,
  isAutoFocused
}) => {
  const { updateTask, properties, addTagOption, deleteTagOption, getAllAvailableTagOptions } = useTaskContext();
  const [editTitle, setEditTitle] = useState(task.title);
  const [showTagsPopover, setShowTagsPopover] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      registerRef(task.id, inputRef.current);
    }
    
    // Cleanup when component unmounts
    return () => {
      registerRef(task.id, null);
    };
  }, [task.id, registerRef]);

  // Handle auto-focus
  useEffect(() => {
    if (isAutoFocused && inputRef.current) {
      const timeoutId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(editTitle.length, editTitle.length);
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isAutoFocused, editTitle]);



  useEffect(() => {
    setEditTitle(task.title);
  }, [task.title]);

  const handlePropertyChange = (propertyId: string, value: any) => {
    updateTask(task.id, {
      properties: { ...task.properties, [propertyId]: value }
    });
  };

  const handleTitleChange = (value: string) => {
    setEditTitle(value);
    updateTask(task.id, { title: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Create new task after this one
      onCreateTaskAfter(task.id, '', task.parentId);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        onUnindentTask(task.id);
      } else {
        onIndentTask(task.id);
      }
    } else if (e.key === 'Backspace' && editTitle === '') {
      e.preventDefault();
      onDeleteTask(task.id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onArrowNavigation(task.id, 'up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onArrowNavigation(task.id, 'down');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Tag management - always get fresh list from context
  const availableTags = getAllAvailableTagOptions();
  const currentTags = Array.isArray(task.properties.tags) ? task.properties.tags : [];

  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
    !currentTags.includes(tag)
  );

  const handleAddTag = (tag: string) => {
    const newTags = [...currentTags, tag];
    handlePropertyChange('tags', newTags);
    setTagSearchTerm('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = currentTags.filter((tag: string) => tag !== tagToRemove);
    handlePropertyChange('tags', newTags);
  };

  const handleCreateNewTag = () => {
    const trimmedTag = tagSearchTerm.trim();
    if (trimmedTag && !availableTags.includes(trimmedTag)) {
      addTagOption(trimmedTag);
      handleAddTag(trimmedTag);
      setTagSearchTerm('');
    }
  };

  return (
    <div 
      className="group flex items-center gap-2 py-1 hover:bg-accent/30 rounded transition-colors"
      style={{ paddingLeft: `${level * 20}px` }}
    >
      {/* Checkbox */}
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => 
          updateTask(task.id, { completed: Boolean(checked) })
        }
        className="shrink-0"
      />

      {/* Title Input - Always in edit mode */}
      <div className="flex-1 min-w-0">
        <Input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a task..."
          className={`h-6 text-sm border-none p-0 focus-visible:ring-0 bg-transparent ${
            task.completed ? 'line-through text-muted-foreground' : ''
          }`}
        />
      </div>

      {/* Properties - Always Visible */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Status */}
        {task.properties.status && (
          <Badge variant="secondary" className={`text-xs ${getStatusColor(task.properties.status)}`}>
            {task.properties.status}
          </Badge>
        )}

        {/* Priority */}
        {task.properties.priority && (
          <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.properties.priority)}`}>
            {task.properties.priority}
          </Badge>
        )}

        {/* Due Date */}
        {task.properties.dueDate && (
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(task.properties.dueDate).toLocaleDateString()}
          </Badge>
        )}

        {/* Tags */}
        {currentTags.length > 0 && (
          <div className="flex gap-1">
            {currentTags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
            {currentTags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{currentTags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Edit Properties Button - Only visible on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Edit Properties</h4>
                
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">Status</label>
                  <Select
                    value={task.properties.status || ''}
                    onValueChange={(value) => handlePropertyChange('status', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">Priority</label>
                  <Select
                    value={task.properties.priority || ''}
                    onValueChange={(value) => handlePropertyChange('priority', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={task.properties.dueDate || ''}
                    onChange={(e) => handlePropertyChange('dueDate', e.target.value)}
                    className="h-8"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Tags</label>
                    
                    {/* Tag Management Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          Manage Tags
                        </div>
                        <DropdownMenuSeparator />
                        {availableTags.length > 0 ? (
                          availableTags.map((tag) => (
                            <DropdownMenuItem
                              key={tag}
                              className="flex items-center justify-between text-xs"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <span className="flex-1">{tag}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTagOption(tag);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-xs text-muted-foreground">
                            No tags available
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Current Tags */}
                  {currentTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {currentTags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1 pr-1">
                          <span>{tag}</span>
                          <button
                            type="button"
                            className="ml-1 h-4 w-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none flex items-center justify-center hover:bg-destructive/10 shrink-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveTag(tag);
                            }}
                            aria-label={`Remove ${tag} tag`}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add Tags */}
                  <Popover open={showTagsPopover} onOpenChange={setShowTagsPopover}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={showTagsPopover}
                        className="h-8 w-full justify-between text-xs"
                      >
                        Add tags...
                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Search or create tags..." 
                          value={tagSearchTerm}
                          onValueChange={setTagSearchTerm}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {tagSearchTerm.trim() && !availableTags.includes(tagSearchTerm.trim()) && (
                              <div className="p-2">
                                <Button 
                                  size="sm" 
                                  className="w-full text-xs"
                                  onClick={() => {
                                    handleCreateNewTag();
                                    setShowTagsPopover(false);
                                  }}
                                >
                                  Create "{tagSearchTerm.trim()}"
                                </Button>
                              </div>
                            )}
                            {tagSearchTerm.trim() && availableTags.includes(tagSearchTerm.trim()) && (
                              <div className="p-2 text-xs text-muted-foreground">
                                No matching tags found.
                              </div>
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredTags.map((tag) => (
                              <CommandItem
                                key={tag}
                                value={tag}
                                onSelect={() => {
                                  handleAddTag(tag);
                                  setShowTagsPopover(false);
                                }}
                                className="text-xs"
                              >
                                <Check className="mr-2 h-3 w-3 opacity-0" />
                                {tag}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};