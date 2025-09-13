interface StorageData {
  user: { name: string; email: string };
  tasks: any[];
  properties: any[];
  categories: any[];
  currentView: string;
  currentCategory: string | null;
  version: string;
  lastModified: string;
}

interface StorageConfig {
  storageKey: string;
  autoSaveDelay: number;
  backupCount: number;
}

class LocalStorage {
  private config: StorageConfig;
  private autoSaveTimeout: NodeJS.Timeout | null = null;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      storageKey: 'taskManager',
      autoSaveDelay: 1000, // 1 second delay for auto-save
      backupCount: 5,
      ...config
    };
  }

  // Save data to localStorage
  async saveData(data: Partial<StorageData>): Promise<void> {
    try {
      const currentData = this.loadData();
      const updatedData: StorageData = {
        ...currentData,
        ...data,
        version: '1.0.0',
        lastModified: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem(this.config.storageKey, JSON.stringify(updatedData));
      
      // Create backup
      this.createBackup(updatedData);
      
      console.log('Data saved successfully', updatedData);
    } catch (error) {
      console.error('Failed to save data:', error);
      throw new Error('Failed to save data to local storage');
    }
  }

  // Load data from localStorage
  loadData(): StorageData {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) {
        return this.getDefaultData();
      }

      const data = JSON.parse(stored);
      
      // Validate and migrate data if necessary
      return this.validateAndMigrateData(data);
    } catch (error) {
      console.error('Failed to load data:', error);
      
      // Try to recover from backup
      const recoveredData = this.recoverFromBackup();
      if (recoveredData) {
        console.log('Recovered data from backup');
        return recoveredData;
      }
      
      // Return default data as last resort
      console.log('Using default data');
      return this.getDefaultData();
    }
  }

  // Auto-save with debouncing
  autoSave(data: Partial<StorageData>): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = setTimeout(() => {
      this.saveData(data);
    }, this.config.autoSaveDelay);
  }

  // Create backup
  private createBackup(data: StorageData): void {
    try {
      const backupKey = `${this.config.storageKey}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(data));
      
      // Clean up old backups
      this.cleanupOldBackups();
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  // Clean up old backups
  private cleanupOldBackups(): void {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${this.config.storageKey}_backup_`))
        .sort()
        .reverse(); // Most recent first

      // Remove excess backups
      if (backupKeys.length > this.config.backupCount) {
        const keysToRemove = backupKeys.slice(this.config.backupCount);
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  // Recover from backup
  private recoverFromBackup(): StorageData | null {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${this.config.storageKey}_backup_`))
        .sort()
        .reverse(); // Most recent first

      for (const backupKey of backupKeys) {
        try {
          const backupData = localStorage.getItem(backupKey);
          if (backupData) {
            const data = JSON.parse(backupData);
            return this.validateAndMigrateData(data);
          }
        } catch (error) {
          console.error(`Failed to recover from backup ${backupKey}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to recover from any backup:', error);
    }
    
    return null;
  }

  // Validate and migrate data
  private validateAndMigrateData(data: any): StorageData {
    // Basic validation
    if (!data || typeof data !== 'object') {
      return this.getDefaultData();
    }

    // Ensure all required fields exist with defaults
    const validatedData: StorageData = {
      user: data.user || { name: 'User', email: 'user@example.com' },
      tasks: Array.isArray(data.tasks) ? data.tasks : [],
      properties: Array.isArray(data.properties) ? data.properties : this.getDefaultProperties(),
      categories: Array.isArray(data.categories) ? data.categories : this.getDefaultCategories(),
      currentView: data.currentView || 'list',
      currentCategory: data.currentCategory || 'all',
      version: data.version || '1.0.0',
      lastModified: data.lastModified || new Date().toISOString()
    };

    // Data migration logic can be added here
    return this.migrateData(validatedData);
  }

  // Data migration
  private migrateData(data: StorageData): StorageData {
    // Add migration logic here when data structure changes
    // For now, just return the data as-is
    return data;
  }

  // Get default data structure
  private getDefaultData(): StorageData {
    return {
      user: { name: 'Lia', email: 'lia@example.com' },
      tasks: [
        {
          id: '1',
          title: 'Project Planning',
          description: 'Plan the new project structure and timeline',
          properties: { status: 'Not Started', priority: 'High', tags: ['Work', 'Project'] },
          completed: false,
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date('2024-01-15').toISOString()
        },
        {
          id: '2',
          title: 'Research competitors',
          description: 'Analyze competitor features and pricing',
          parentId: '1',
          properties: { status: 'Completed', priority: 'Medium', tags: ['Research'] },
          completed: true,
          createdAt: new Date('2024-01-16').toISOString(),
          updatedAt: new Date('2024-01-18').toISOString()
        },
        {
          id: '3',
          title: 'Create wireframes',
          parentId: '1',
          properties: { status: 'Not Started', priority: 'High', dueDate: '2024-02-01' },
          completed: false,
          createdAt: new Date('2024-01-16').toISOString(),
          updatedAt: new Date('2024-01-16').toISOString()
        },
        {
          id: '4',
          title: 'Team Meeting',
          description: 'Weekly sync with the development team',
          properties: { status: 'Not Started', priority: 'Medium', tags: ['Meeting', 'Work'], dueDate: '2024-01-25' },
          completed: false,
          createdAt: new Date('2024-01-20').toISOString(),
          updatedAt: new Date('2024-01-20').toISOString()
        },
        {
          id: '5',
          title: 'Personal workout plan',
          description: 'Create a new fitness routine for the month',
          properties: { status: 'Not Started', priority: 'Low', tags: ['Personal'] },
          completed: false,
          createdAt: new Date('2024-01-22').toISOString(),
          updatedAt: new Date('2024-01-22').toISOString()
        }
      ],
      properties: this.getDefaultProperties(),
      categories: this.getDefaultCategories(),
      currentView: 'list',
      currentCategory: 'all',
      version: '1.0.0',
      lastModified: new Date().toISOString()
    };
  }

  private getDefaultProperties() {
    return [
      {
        id: 'status',
        name: 'Status',
        type: 'select',
        options: ['Not Started', 'Completed', 'On Hold']
      },
      {
        id: 'priority',
        name: 'Priority',
        type: 'select',
        options: ['Low', 'Medium', 'High', 'Urgent']
      },
      {
        id: 'dueDate',
        name: 'Due Date',
        type: 'date'
      },
      {
        id: 'tags',
        name: 'Tags',
        type: 'multiselect',
        options: ['Work', 'Personal', 'Project', 'Meeting', 'Research']
      }
    ];
  }

  private getDefaultCategories() {
    return [
      { id: 'all', name: 'All Tasks', filter: {} },
      { id: 'urgent', name: 'Urgent', filter: { propertyId: 'priority', value: 'Urgent' } },
      { id: 'completed', name: 'Completed', filter: { propertyId: 'status', value: 'Completed' } }
    ];
  }

  // Export data for backup
  exportData(): string {
    const data = this.loadData();
    return JSON.stringify(data, null, 2);
  }

  // Import data from backup
  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      const validatedData = this.validateAndMigrateData(data);
      await this.saveData(validatedData);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid data format');
    }
  }

  // Clear all data
  clearData(): void {
    localStorage.removeItem(this.config.storageKey);
    
    // Clear backups
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(`${this.config.storageKey}_backup_`));
    
    backupKeys.forEach(key => localStorage.removeItem(key));
  }

  // Get storage stats
  getStorageStats(): { size: number; backupCount: number; lastModified: string } {
    const data = this.loadData();
    const dataString = JSON.stringify(data);
    const backupCount = Object.keys(localStorage)
      .filter(key => key.startsWith(`${this.config.storageKey}_backup_`))
      .length;

    return {
      size: new Blob([dataString]).size,
      backupCount,
      lastModified: data.lastModified
    };
  }
}

// Create singleton instance
export const storage = new LocalStorage();

// Storage hooks for React components
export const useStorage = () => {
  return {
    save: (data: Partial<StorageData>) => storage.saveData(data),
    load: () => storage.loadData(),
    autoSave: (data: Partial<StorageData>) => storage.autoSave(data),
    export: () => storage.exportData(),
    import: (data: string) => storage.importData(data),
    clear: () => storage.clearData(),
    getStats: () => storage.getStorageStats()
  };
};

export type { StorageData };