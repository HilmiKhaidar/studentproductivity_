import React, { useState } from 'react';
import { Palette, Check, Type, Layout } from 'lucide-react';
import { useStore } from '../store/useStore';
import { predefinedThemes } from '../data/themes';
import toast from 'react-hot-toast';

export const Themes: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [selectedTheme, setSelectedTheme] = useState(settings.theme || 'default');

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    updateSettings({ theme: themeId });
    toast.success('Theme berhasil diubah!');
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    updateSettings({ fontSize: size });
    toast.success('Ukuran font berhasil diubah!');
  };

  const handleCompactModeToggle = () => {
    updateSettings({ compactMode: !settings.compactMode });
    toast.success(settings.compactMode ? 'Compact mode dinonaktifkan' : 'Compact mode diaktifkan');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Palette size={32} />
          Themes & Customization
        </h2>
        <p className="text-white/70 mt-1">Personalisasi tampilan aplikasimu</p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Pilih Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predefinedThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`relative rounded-xl p-4 border-2 transition-all hover:scale-105 ${
                selectedTheme === theme.id
                  ? 'border-white shadow-lg'
                  : 'border-white/20 hover:border-white/40'
              }`}
              style={{ background: theme.background }}
            >
              {theme.backgroundImage && (
                <div
                  className="absolute inset-0 rounded-xl opacity-50"
                  style={{ backgroundImage: theme.backgroundImage }}
                />
              )}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold" style={{ color: theme.textColor }}>
                    {theme.name}
                  </h4>
                  {selectedTheme === theme.id && (
                    <div className="bg-white rounded-full p-1">
                      <Check size={16} className="text-green-600" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/50"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/50"
                    style={{ backgroundColor: theme.secondary }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Type size={24} />
          Ukuran Font
        </h3>
        <div className="flex gap-4">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => handleFontSizeChange(size)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                settings.fontSize === size
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {size === 'small' && 'Kecil'}
              {size === 'medium' && 'Sedang'}
              {size === 'large' && 'Besar'}
            </button>
          ))}
        </div>
      </div>

      {/* Layout Options */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Layout size={24} />
          Layout
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Compact Mode</p>
            <p className="text-white/60 text-sm">Tampilan lebih padat dan efisien</p>
          </div>
          <button
            onClick={handleCompactModeToggle}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.compactMode ? 'bg-purple-600' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.compactMode ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Preview</h3>
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-lg font-bold text-white mb-2">Sample Card</h4>
            <p className="text-white/70">
              Ini adalah contoh tampilan card dengan theme yang kamu pilih.
            </p>
            <div className="flex gap-2 mt-3">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                Primary Button
              </button>
              <button className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                Secondary Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
