import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { CheckCircle, AlertCircle, Wifi, WifiOff, Clock } from 'lucide-react';

export const SaveStatusIndicator: React.FC = () => {
  const { lastSaved } = useTaskContext();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (lastSaved) {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        setSaveStatus('saved');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-3 w-3" />;
    }

    switch (saveStatus) {
      case 'saving':
        return <Clock className="h-3 w-3 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      case 'saved':
      default:
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline - Changes saved locally';
    }

    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Save failed';
      case 'saved':
      default:
        return lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'All changes saved';
    }
  };

  const getStatusVariant = () => {
    if (!isOnline) {
      return 'secondary';
    }

    switch (saveStatus) {
      case 'saving':
        return 'outline';
      case 'error':
        return 'destructive';
      case 'saved':
      default:
        return 'secondary';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={getStatusVariant()} 
            className="text-xs flex items-center gap-1 cursor-default"
          >
            {getStatusIcon()}
            <span className="hidden sm:inline">{getStatusText()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{getStatusText()}</p>
            {lastSaved && (
              <p className="text-xs text-muted-foreground">
                Last saved: {lastSaved.toLocaleString()}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Connection: {isOnline ? 'Online' : 'Offline'} {isOnline ? <Wifi className="h-3 w-3 inline" /> : <WifiOff className="h-3 w-3 inline" />}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};