import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// Simple toggle switch component
const Toggle = ({ 
  checked, 
  onChange, 
  label 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  label: string 
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
        />
        <div className={`block w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
      <div className="ml-3 text-sm">{label}</div>
    </label>
  );
};

export default function Settings() {
  // User settings state
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'system',
    fontSize: parseInt(localStorage.getItem('fontSize') || '16'),
    fontFamily: localStorage.getItem('fontFamily') || 'system-ui',
    autoSave: localStorage.getItem('autoSave') !== 'false',
    spellCheck: localStorage.getItem('spellCheck') !== 'false',
    focusMode: localStorage.getItem('focusMode') === 'true',
    userName: localStorage.getItem('userName') || '',
    userEmail: localStorage.getItem('userEmail') || '',
  });

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('theme', settings.theme);
    localStorage.setItem('fontSize', settings.fontSize.toString());
    localStorage.setItem('fontFamily', settings.fontFamily);
    localStorage.setItem('autoSave', settings.autoSave.toString());
    localStorage.setItem('spellCheck', settings.spellCheck.toString());
    localStorage.setItem('focusMode', settings.focusMode.toString());
    localStorage.setItem('userName', settings.userName);
    localStorage.setItem('userEmail', settings.userEmail);
    
    // Apply theme to document
    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Handle theme change
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings({ ...settings, theme });
  };

  // Handle font size change
  const handleFontSizeChange = (change: number) => {
    const newSize = Math.max(12, Math.min(24, settings.fontSize + change));
    setSettings({ ...settings, fontSize: newSize });
  };

  // Handle toggle changes
  const handleToggleChange = (setting: keyof typeof settings, value: boolean) => {
    setSettings({ ...settings, [setting]: value });
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Display Name</label>
              <Input 
                value={settings.userName} 
                onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input 
                type="email"
                value={settings.userEmail} 
                onChange={(e) => setSettings({ ...settings, userEmail: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>
            <div className="pt-2">
              <Button>Save Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Theme</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant={settings.theme === 'light' ? 'default' : 'outline'} 
                  onClick={() => handleThemeChange('light')}
                  className="gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                  Light
                </Button>
                <Button 
                  variant={settings.theme === 'dark' ? 'default' : 'outline'} 
                  onClick={() => handleThemeChange('dark')}
                  className="gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                  Dark
                </Button>
                <Button 
                  variant={settings.theme === 'system' ? 'default' : 'outline'} 
                  onClick={() => handleThemeChange('system')}
                  className="gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="16" height="12" x="4" y="6" rx="2" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="M12 2v4" />
                    <path d="M12 18v4" />
                  </svg>
                  System
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Font Size</h3>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleFontSizeChange(-1)}
                >
                  -
                </Button>
                <span className="min-w-10 text-center">{settings.fontSize}px</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleFontSizeChange(1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Font Family</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={settings.fontFamily === 'system-ui' ? 'default' : 'outline'} 
                  onClick={() => setSettings({ ...settings, fontFamily: 'system-ui' })}
                  className="justify-start"
                >
                  System Default
                </Button>
                <Button 
                  variant={settings.fontFamily === 'serif' ? 'default' : 'outline'} 
                  onClick={() => setSettings({ ...settings, fontFamily: 'serif' })}
                  className="justify-start font-serif"
                >
                  Serif
                </Button>
                <Button 
                  variant={settings.fontFamily === 'mono' ? 'default' : 'outline'} 
                  onClick={() => setSettings({ ...settings, fontFamily: 'mono' })}
                  className="justify-start font-mono"
                >
                  Monospace
                </Button>
                <Button 
                  variant={settings.fontFamily === 'sans' ? 'default' : 'outline'} 
                  onClick={() => setSettings({ ...settings, fontFamily: 'sans' })}
                  className="justify-start"
                >
                  Sans-serif
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Editor Preferences</CardTitle>
            <CardDescription>Customize your writing experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-save documents</span>
              <Toggle 
                checked={settings.autoSave} 
                onChange={(checked) => handleToggleChange('autoSave', checked)}
                label=""
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Spell check</span>
              <Toggle 
                checked={settings.spellCheck} 
                onChange={(checked) => handleToggleChange('spellCheck', checked)}
                label=""
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Focus mode</span>
              <Toggle 
                checked={settings.focusMode} 
                onChange={(checked) => handleToggleChange('focusMode', checked)}
                label=""
              />
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>MarkFlow v1.0.0</p>
              <p className="mt-1">A modern, collaborative markdown editor.</p>
              <div className="mt-4">
                <p>Built with:</p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>React</li>
                  <li>TypeScript</li>
                  <li>Automerge</li>
                  <li>Tailwind CSS</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
