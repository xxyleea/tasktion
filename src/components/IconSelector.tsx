import React from 'react';
import * as LucideIcons from 'lucide-react';

// Define available icons - only import what we need to avoid bundle bloat
export const AVAILABLE_ICONS = [
  'Hash',
  'Folder', 
  'Star',
  'Heart',
  'Target',
  'Coffee',
  'Book',
  'Camera',
  'Music',
  'Car',
  'Plane',
  'Home',
  'User',
  'Users',
  'Briefcase',
  'Code',
  'Palette',
  'Trophy',
  'Gift',
  'Lightbulb',
  'Clock',
  'Flag',
  'Globe',
  'Mail',
  'Phone',
  'Tag',
  'Shield',
  'Sun',
  'Moon',
  'Leaf',
  'Tree',
  'Flower',
  'Zap'
] as const;

export type IconName = typeof AVAILABLE_ICONS[number];

interface IconProps {
  name: IconName;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = "h-4 w-4" }) => {
  // Dynamically get the icon component from Lucide
  const IconComponent = (LucideIcons as any)[name];
  
  if (!IconComponent) {
    // Fallback to Hash if icon doesn't exist
    const FallbackIcon = LucideIcons.Hash;
    return <FallbackIcon className={className} />;
  }
  
  return <IconComponent className={className} />;
};

export const getIconComponent = (iconName: string, className = "h-4 w-4") => {
  if (AVAILABLE_ICONS.includes(iconName as IconName)) {
    return <Icon name={iconName as IconName} className={className} />;
  }
  return <Icon name="Hash" className={className} />;
};