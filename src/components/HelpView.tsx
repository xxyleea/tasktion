import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { ArrowLeft, Search, Keyboard, List, Calendar, Settings, Zap, Heart } from 'lucide-react';

export const HelpView: React.FC = () => {
  const { setCurrentView } = useTaskContext();
  const [searchTerm, setSearchTerm] = useState('');

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Zap className="h-5 w-5" />,
      items: [
        {
          question: 'How do I create my first task?',
          answer: 'Simply start typing anywhere in the task list. Each task behaves like a line in a text document - press Enter to create a new task below, Tab to indent it as a subtask.'
        },
        {
          question: 'How do I organize tasks with subtasks?',
          answer: 'Use Tab to indent a task as a subtask, or Shift+Tab to unindent it. The document-style interface makes it natural to organize tasks hierarchically, just like outlining in a text editor.'
        },
        {
          question: 'What are properties and how do I use them?',
          answer: 'Properties like Status, Priority, Due Date, and Tags help you organize and filter your tasks. Click the three dots (⋯) next to any task to edit its properties.'
        }
      ]
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      icon: <Keyboard className="h-5 w-5" />,
      items: [
        {
          question: 'Task Creation & Editing',
          answer: (
            <div className="space-y-2">
              <div className="flex justify-between"><kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd><span>Create new task</span></div>
              <div className="flex justify-between"><kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd><span>Make subtask</span></div>
              <div className="flex justify-between"><kbd className="px-2 py-1 bg-muted rounded text-xs">Backspace</kbd><span>Delete empty task</span></div>
              <div className="flex justify-between"><kbd className="px-2 py-1 bg-muted rounded text-xs">Escape</kbd><span>Cancel editing</span></div>
            </div>
          )
        }
      ]
    },
    {
      id: 'views',
      title: 'Views & Organization',
      icon: <List className="h-5 w-5" />,
      items: [
        {
          question: 'What are the different views?',
          answer: (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <strong>List View:</strong> Document-style task list with hierarchical organization and inline editing
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <strong>Calendar View:</strong> See tasks organized by due dates in a monthly calendar
              </div>
            </div>
          )
        },
        {
          question: 'How do I create custom categories?',
          answer: 'Click the + button next to Categories in the sidebar. You can create categories based on existing tags to quickly filter your tasks.'
        },
        {
          question: 'How does sorting work?',
          answer: 'Use the Sort button to organize tasks by Created Date, Title, Priority, or Status. You can sort in ascending or descending order.'
        }
      ]
    },
    {
      id: 'properties',
      title: 'Task Properties',
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          question: 'Status Options',
          answer: (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">Not Started</Badge>
                <span>Task hasn't been worked on yet</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">On Hold</Badge>
                <span>Task is paused or waiting</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
                <span>Task is finished</span>
              </div>
            </div>
          )
        },
        {
          question: 'Priority Levels',
          answer: (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-red-100 text-red-800">Urgent</Badge>
                <span>Needs immediate attention</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">High</Badge>
                <span>Important and should be done soon</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
                <span>Standard priority</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">Low</Badge>
                <span>Can be done when time permits</span>
              </div>
            </div>
          )
        },
        {
          question: 'Using Tags Effectively',
          answer: 'Tags help you categorize tasks across different dimensions. Use tags like "Work", "Personal", "Project", "Meeting" to easily filter and find related tasks.'
        }
      ]
    }
  ];

  const filteredSections = helpSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentView('list')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Help & Support</h1>
          <p className="text-sm text-muted-foreground">
            Everything you need to master your task management
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search help articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Start Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            New to the app? Here's how to get started in 30 seconds:
          </p>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Start typing anywhere to create your first task</li>
            <li>Press Enter to create new tasks below, Tab to indent as subtasks</li>
            <li>Click the ⋯ button to add properties like priority and due dates</li>
            <li>Switch between List and Calendar views in the sidebar</li>
          </ol>
        </CardContent>
      </Card>

      {/* Help Sections */}
      <div className="space-y-6">
        {filteredSections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {section.icon}
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.items.map((item, index) => (
                  <AccordionItem key={index} value={`${section.id}-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {typeof item.answer === 'string' ? (
                        <p className="text-sm text-muted-foreground">{item.answer}</p>
                      ) : (
                        <div className="text-sm text-muted-foreground">{item.answer}</div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 p-4 bg-muted/30 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          Need more help? This app is designed to be intuitive and iOS Notes-inspired. 
          Just start typing and explore!
        </p>
      </div>
    </div>
  );
};