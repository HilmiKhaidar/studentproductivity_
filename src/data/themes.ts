import { Theme } from '../types';

export const predefinedThemes: Theme[] = [
  {
    id: 'default',
    name: 'Purple Gradient',
    primary: '#8b5cf6',
    secondary: '#ec4899',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    background: 'linear-gradient(135deg, #667eea 0%, #0ea5e9 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    primary: '#f97316',
    secondary: '#ef4444',
    background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'forest',
    name: 'Forest Green',
    primary: '#10b981',
    secondary: '#059669',
    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.05)',
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    primary: '#ec4899',
    secondary: '#f43f5e',
    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'minimal',
    name: 'Minimal Light',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    textColor: '#1f2937',
    cardBg: 'rgba(255, 255, 255, 0.8)',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    primary: '#f0abfc',
    secondary: '#22d3ee',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f0abfc\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    textColor: '#ffffff',
    cardBg: 'rgba(240, 171, 252, 0.1)',
  },
];

export const getThemeById = (id: string): Theme => {
  return predefinedThemes.find(t => t.id === id) || predefinedThemes[0];
};
