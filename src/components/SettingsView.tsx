import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Download, Upload, Trash2, Database, HardDrive, Calendar } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, updateUser, exportData, importData, clearAllData, getStorageStats } = useTaskContext();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

  const storageStats = getStorageStats();

  const handleSaveProfile = () => {
    updateUser({ name, email });
    toast.success('Profile updated successfully');
  };

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      await importData(text);
      toast.success('Data imported successfully. Page will reload...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAllData = async () => {
    try {
      setIsClearingData(true);
      clearAllData();
      toast.success('All data cleared successfully');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to clear data');
    } finally {
      setIsClearingData(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile and application preferences
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <Button onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export, import, and manage your application data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Storage Stats */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Storage Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{formatBytes(storageStats.size)}</p>
                      <p className="text-xs text-muted-foreground">Data Size</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{storageStats.backupCount}</p>
                      <p className="text-xs text-muted-foreground">Backups</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(storageStats.lastModified).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Last Modified</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Export/Import */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Backup & Restore</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleExportData} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      disabled={isImporting}
                      className="hidden"
                      id="import-file"
                    />
                    <Label htmlFor="import-file" className="cursor-pointer">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        asChild
                        disabled={isImporting}
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {isImporting ? 'Importing...' : 'Import Data'}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                  <Badge variant="destructive" className="text-xs">Irreversible</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your tasks, categories, and settings. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isClearingData}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isClearingData ? 'Clearing...' : 'Clear All Data'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your tasks, 
                        categories, properties, and settings. All backups will also be removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAllData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, delete everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Application Info */}
          <Card>
            <CardHeader>
              <CardTitle>Application Information</CardTitle>
              <CardDescription>
                Version and technical details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Version</span>
                <Badge variant="secondary">1.0.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Storage Type</span>
                <Badge variant="outline">Local Storage</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto-save</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};