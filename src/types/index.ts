export interface TaskProperty {
  id: string;
  name: string;
  type: 'select' | 'multiselect' | 'date' | 'text' | 'number';
  options?: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  parentId?: string;
  properties: Record<string, any>;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  children?: Task[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  filter: {
    propertyId?: string;
    value?: any;
  };
}

export type ViewMode = 'list' | 'calendar' | 'settings' | 'help';