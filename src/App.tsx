import React from "react";
import {
  TaskProvider,
  useTaskContext,
} from "./contexts/TaskContext";
import { Sidebar } from "./components/Sidebar";
import { TaskList } from "./components/TaskList";
import { CalendarView } from "./components/CalendarView";
import { SettingsView } from "./components/SettingsView";
import { HelpView } from "./components/HelpView";
import { SaveStatusIndicator } from "./components/SaveStatusIndicator";
import { Skeleton } from "./components/ui/skeleton";

const LoadingScreen: React.FC = () => (
  <div className="h-screen flex bg-background">
    <div className="w-64 border-r bg-sidebar">
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="pt-4 space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </div>
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-6 flex-1" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { currentView, isLoading } = useTaskContext();

  // Show loading screen while data is being loaded
  if (isLoading) {
    return <LoadingScreen />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "list":
        return <TaskList />;
      case "calendar":
        return <CalendarView />;
      case "settings":
        return <SettingsView />;
      case "help":
        return <HelpView />;
      default:
        return <TaskList />;
    }
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        {renderCurrentView()}

        {/* Save Status Indicator - Fixed position */}
        <div className="absolute bottom-4 right-4 z-10">
          <SaveStatusIndicator />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}