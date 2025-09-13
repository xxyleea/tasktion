 import React, { useState } from 'react';
import { Switch } from "./ui/switch";
import { 
  List, 
  Calendar, 
  Settings,
  Plus,
  Hash,
  Inbox,
  Star,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ViewMode } from '../types';
import { AVAILABLE_ICONS, getIconComponent } from './IconSelector';

// --- Dark mode toggle component ---
const DarkModeToggle: React.FC = () => {
  // Check initial mode from localStorage or system preference
  const getInitial = () => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    // Default to light mode if no preference is set
    return false;
  };
  const [enabled, setEnabled] = React.useState(getInitial);

  React.useEffect(() => {
    const html = document.documentElement;
    if (enabled) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [enabled]);

  return (
    <Switch checked={enabled} onCheckedChange={setEnabled} />
  );
}

export const Sidebar: React.FC = () => {
  const { 
    user,
    currentView, 
    currentCategory, 
    categories, 
    setCurrentView, 
    setCurrentCategory,
    tasks,
    getAllTags,
    getAllAvailableTagOptions,
    addCategory
  } = useTaskContext();

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Hash');

  const views: { id: ViewMode; name: string; icon: React.ReactNode }[] = [
    { id: 'list', name: 'List', icon: <List className="h-4 w-4" /> },
    { id: 'calendar', name: 'Calendar', icon: <Calendar className="h-4 w-4" /> }
  ];

  // Use the comprehensive icon list from IconSelector
  const availableIcons = AVAILABLE_ICONS;

  const getCategoryIcon = (category: { id: string; icon?: string }) => {
    // Special handling for built-in categories
    if (category.id === 'all') return <Inbox className="h-4 w-4" />;
    if (category.id === 'urgent') return <Star className="h-4 w-4" />;
    if (category.id === 'completed') return <CheckCircle className="h-4 w-4" />;
    
    // Use custom icon if available
    if (category.icon) {
      return getIconComponent(category.icon);
    }
    
    // Default fallback
    return <Hash className="h-4 w-4" />;
  };

  const getTaskCount = (categoryId: string) => {
    if (categoryId === 'all') return tasks.length;
    
    const category = categories.find(c => c.id === categoryId);
    if (!category?.filter.propertyId) return 0;
    
    return tasks.filter(task => {
      const taskValue = task.properties[category.filter.propertyId!];
      if (Array.isArray(taskValue)) {
        return taskValue.includes(category.filter.value);
      }
      return taskValue === category.filter.value;
    }).length;
  };

  const getCompletedTasksCount = () => {
    return tasks.filter(task => task.completed).length;
  };

  const getProgressPercentage = () => {
    if (tasks.length === 0) return 0;
    return Math.round((getCompletedTasksCount() / tasks.length) * 100);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && selectedTag) {
      addCategory({
        name: newCategoryName.trim(),
        icon: selectedIcon,
        filter: {
          propertyId: 'tags',
          value: selectedTag
        }
      });
      setNewCategoryName('');
      setSelectedTag('');
      setSelectedIcon('Hash');
      setShowAddCategory(false);
    }
  };

  const availableTags = getAllAvailableTagOptions();

  return (
    <div className="w-64 border-r bg-sidebar flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sidebar-foreground">Hi {user.name}!</h2>
        <div className="mt-2 text-sm text-sidebar-foreground/70">
          {getCompletedTasksCount()} of {tasks.length} completed ({getProgressPercentage()}%)
        </div>
        <div className="mt-2 bg-sidebar-accent rounded-full h-2">
          <div 
            className="bg-sidebar-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Views */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-2">Views</h3>
        <div className="space-y-1">
          {views.map((view) => (
            <Button
              key={view.id}
              variant={currentView === view.id ? "secondary" : "ghost"}
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setCurrentView(view.id)}
            >
              {view.icon}
              <span className="ml-2">{view.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-sidebar-foreground/70">Categories</h3>
          <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-sidebar-foreground/70">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon-select">Category Icon</Label>
                  <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {getIconComponent(selectedIcon)}
                          <span>{selectedIcon}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availableIcons.map((iconName) => (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            {getIconComponent(iconName)}
                            <span>{iconName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag-select">Filter by Tag</Label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tag to filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim() || !selectedTag}
                  >
                    Create Category
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-1">
          {/* All Tasks button */}
          <Button
            key="all"
            variant={currentCategory === 'all' ? "secondary" : "ghost"}
            className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => {
              setCurrentCategory('all');
              setCurrentView('list');
            }}
          >
            <div className="flex items-center">
              <Inbox className="h-4 w-4" />
              <span className="ml-2">All Tasks</span>
            </div>
            {getTaskCount('all') > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {getTaskCount('all')}
              </Badge>
            )}
          </Button>

          {/* Urgent Tasks button (acts as a built-in category) */}
          <Button
            key="urgent"
            variant={currentCategory === 'urgent' ? "secondary" : "ghost"}
            className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => {
              setCurrentCategory('urgent');
              setCurrentView('list');
            }}
          >
            <div className="flex items-center">
              <Star className="h-4 w-4" />
              <span className="ml-2">Urgent</span>
            </div>
            {(() => {
              // Count tasks with priority 'urgent'
              const count = tasks.filter(task => {
                if (task.completed) return false;
                return task.properties?.priority === 'urgent';
              }).length;
              return count > 0 ? (
                <Badge variant="secondary" className="ml-auto text-xs">{count}</Badge>
              ) : null;
            })()}
          </Button>
          {categories.map((category) => {
            const taskCount = getTaskCount(category.id);
            return (
              <Button
                key={category.id}
                variant={currentCategory === category.id ? "secondary" : "ghost"}
                className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => {
                  setCurrentCategory(category.id);
                  setCurrentView('list');
                }}
              >
                <div className="flex items-center">
                  {getCategoryIcon(category)}
                  <span className="ml-2">{category.name}</span>
                </div>
                {taskCount > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {taskCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-sidebar-foreground/70">Dark Mode</span>
          {/* Dark mode toggle switch */}
          <DarkModeToggle />
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCurrentView('help')}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="ml-2">Help</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCurrentView('settings')}
        >
          <Settings className="h-4 w-4" />
          <span className="ml-2">Settings</span>
        </Button>
      </div>
    </div>
  );
};