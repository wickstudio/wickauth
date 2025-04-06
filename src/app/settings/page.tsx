'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Button, 
  Switch, 
  Input, 
  Select, 
  SelectItem,
  Tabs,
  Tab,
  Slider,
  Checkbox
} from '@nextui-org/react';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  Trash2, 
  Clock, 
  Fingerprint, 
  Save, 
  RefreshCw, 
  X,
  Minimize,
  Settings as SettingsIcon,
  Bell,
  PaintBucket
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [settings, setSettings] = useState({
    appearance: {
      theme: 'system',
      accentColor: 'blue',
      fontScale: 100,
      compactMode: false,
      animationsEnabled: true,
    },
    security: {
      lockAppOnExit: true,
      biometricUnlock: false,
      confirmBeforeDelete: true,
      hideTokensWhenInactive: false,
      autoLockTimeout: '5',
    },
    notifications: {
      enableNotifications: true,
      soundEffects: false,
      expirationReminder: true,
      reminderTime: '5',
    },
    backup: {
      autoBackup: false,
      backupInterval: 'weekly',
      encryptBackups: true,
      lastBackup: 'Never'
    }
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          
          if (parsedSettings.appearance.theme) {
            setTheme(parsedSettings.appearance.theme);
          }
        } catch (err) {
          console.error('Failed to parse settings', err);
        }
      }
    }
  }, [setTheme]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    }
  }, [settings]);
  
  type SettingsCategory = 'appearance' | 'security' | 'notifications' | 'backup';
  
  const updateSetting = (category: SettingsCategory, key: string, value: string | number | boolean | number[]) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    
    if (category === 'appearance' && key === 'theme') {
      setTheme(value as string);
    }
  };
  
  const handleBack = () => {
    router.push('/');
  };
  
  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = {
        appearance: {
          theme: 'system',
          accentColor: 'blue',
          fontScale: 100,
          compactMode: false,
          animationsEnabled: true,
        },
        security: {
          lockAppOnExit: true,
          biometricUnlock: false,
          confirmBeforeDelete: true,
          hideTokensWhenInactive: false,
          autoLockTimeout: '5',
        },
        notifications: {
          enableNotifications: true,
          soundEffects: false,
          expirationReminder: true,
          reminderTime: '5',
        },
        backup: {
          autoBackup: false,
          backupInterval: 'weekly',
          encryptBackups: true,
          lastBackup: 'Never'
        }
      };
      
      setSettings(defaultSettings);
      setTheme(defaultSettings.appearance.theme);
    }
  };
  
  const performBackup = () => {
    alert('Backup feature will be available in the next update');
  };
  
  const restoreBackup = () => {
    alert('Restore feature will be available in the next update');
  };
  
  return (
    <motion.div 
      className="container mx-auto max-w-4xl px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="app-drag py-1 mb-3 flex items-center justify-between">
        <Button
          variant="light"
          startContent={<ArrowLeft size={16} />}
          className="app-no-drag hover:bg-default-100/50 dark:hover:bg-default-100/10"
          size="sm"
          onClick={handleBack}
        >
          Back
        </Button>
        
        <div className="flex app-no-drag">
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onClick={() => window.electronAPI?.minimizeWindow()}
            className="text-default-500 hover:bg-default-100/50 dark:hover:bg-default-100/10 rounded-full"
          >
            <Minimize size={16} />
          </Button>
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onClick={() => window.electronAPI?.closeWindow()}
            className="text-danger hover:bg-danger/20 rounded-full"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="w-full sm:w-64 mb-4">
          <Card className="shadow-lg border dark:border-default-100/10">
            <CardBody className="p-0">
              <div className="flex flex-col">
                <Button
                  variant={activeTab === 'appearance' ? "flat" : "light"}
                  color={activeTab === 'appearance' ? "primary" : "default"}
                  startContent={<PaintBucket size={18} />}
                  className="justify-start h-12 rounded-none"
                  onClick={() => setActiveTab('appearance')}
                >
                  Appearance
                </Button>
                <Button
                  variant={activeTab === 'security' ? "flat" : "light"}
                  color={activeTab === 'security' ? "primary" : "default"}
                  startContent={<Shield size={18} />}
                  className="justify-start h-12 rounded-none"
                  onClick={() => setActiveTab('security')}
                >
                  Security
                </Button>
                <Button
                  variant={activeTab === 'notifications' ? "flat" : "light"}
                  color={activeTab === 'notifications' ? "primary" : "default"}
                  startContent={<Bell size={18} />}
                  className="justify-start h-12 rounded-none"
                  onClick={() => setActiveTab('notifications')}
                >
                  Notifications
                </Button>
                <Button
                  variant={activeTab === 'backup' ? "flat" : "light"}
                  color={activeTab === 'backup' ? "primary" : "default"}
                  startContent={<RefreshCw size={18} />}
                  className="justify-start h-12 rounded-none"
                  onClick={() => setActiveTab('backup')}
                >
                  Backup & Restore
                </Button>
                <Button
                  variant={activeTab === 'about' ? "flat" : "light"}
                  color={activeTab === 'about' ? "primary" : "default"}
                  startContent={<SettingsIcon size={18} />}
                  className="justify-start h-12 rounded-none"
                  onClick={() => setActiveTab('about')}
                >
                  About
                </Button>
              </div>
            </CardBody>
          </Card>
          
          <Button
            color="danger"
            variant="flat"
            startContent={<RefreshCw size={16} />}
            className="mt-4 w-full"
            onClick={resetSettings}
          >
            Reset All Settings
          </Button>
        </div>
        
        <div className="flex-1">
          <Card className="shadow-xl border dark:border-default-100/10">
            <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {activeTab === 'appearance' && 'Appearance'}
                {activeTab === 'security' && 'Security'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'backup' && 'Backup & Restore'}
                {activeTab === 'about' && 'About WickAuth'}
              </h1>
              <p className="text-default-500 text-sm">
                {activeTab === 'appearance' && 'Customize the look and feel of your app'}
                {activeTab === 'security' && 'Configure security settings'}
                {activeTab === 'notifications' && 'Manage app notifications'}
                {activeTab === 'backup' && 'Backup and restore your authentication tokens'}
                {activeTab === 'about' && 'Information about WickAuth'}
              </p>
            </CardHeader>
            
            <CardBody className="px-6 py-5">
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-default-700 dark:text-default-400">
                      Theme
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant={settings.appearance.theme === 'light' ? "flat" : "light"}
                        color={settings.appearance.theme === 'light' ? "primary" : "default"}
                        startContent={<Sun size={16} />}
                        onClick={() => updateSetting('appearance', 'theme', 'light')}
                      >
                        Light
                      </Button>
                      <Button
                        variant={settings.appearance.theme === 'dark' ? "flat" : "light"}
                        color={settings.appearance.theme === 'dark' ? "primary" : "default"}
                        startContent={<Moon size={16} />}
                        onClick={() => updateSetting('appearance', 'theme', 'dark')}
                      >
                        Dark
                      </Button>
                      <Button
                        variant={settings.appearance.theme === 'system' ? "flat" : "light"}
                        color={settings.appearance.theme === 'system' ? "primary" : "default"}
                        onClick={() => updateSetting('appearance', 'theme', 'system')}
                      >
                        System Default
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-default-700 dark:text-default-400">
                      Accent Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['blue', 'purple', 'cyan', 'green', 'pink', 'yellow', 'red'].map(color => (
                        <button
                          key={color}
                          className={`w-10 h-10 rounded-full transition-transform ${settings.appearance.accentColor === color ? 'ring-2 ring-primary scale-110' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => updateSetting('appearance', 'accentColor', color)}
                          aria-label={`${color} theme color`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-default-700 dark:text-default-400">
                        Font Size
                      </label>
                      <span className="text-sm text-default-500">
                        {settings.appearance.fontScale}%
                      </span>
                    </div>
                    
                    <Slider
                      size="sm"
                      step={10}
                      minValue={80}
                      maxValue={120}
                      value={settings.appearance.fontScale}
                      onChange={(val) => updateSetting('appearance', 'fontScale', val)}
                      className="max-w-md"
                      renderThumb={(props) => (
                        <div
                          {...props}
                          className="group p-1 top-1/2 bg-primary rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                        >
                          <span className="block w-4 h-4 rounded-full bg-background shadow-sm" />
                        </div>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700 dark:text-default-400">Compact Mode</p>
                      <p className="text-xs text-default-500">Show more information in less space</p>
                    </div>
                    <Switch
                      isSelected={settings.appearance.compactMode}
                      onValueChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
                      color="primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700 dark:text-default-400">Enable Animations</p>
                      <p className="text-xs text-default-500">Use animations throughout the app</p>
                    </div>
                    <Switch
                      isSelected={settings.appearance.animationsEnabled}
                      onValueChange={(checked) => updateSetting('appearance', 'animationsEnabled', checked)}
                      color="primary"
                    />
                  </div>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700 dark:text-default-400">Lock App on Exit</p>
                      <p className="text-xs text-default-500">Automatically lock the app when closed</p>
                    </div>
                    <Switch
                      isSelected={settings.security.lockAppOnExit}
                      onValueChange={(checked) => updateSetting('security', 'lockAppOnExit', checked)}
                      color="primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700 dark:text-default-400">Biometric Unlock</p>
                      <p className="text-xs text-default-500">Use your fingerprint or face to unlock the app</p>
                    </div>
                    <Switch
                      isSelected={settings.security.biometricUnlock}
                      onValueChange={(checked) => updateSetting('security', 'biometricUnlock', checked)}
                      color="primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700 dark:text-default-400">Confirm Before Delete</p>
                      <p className="text-xs text-default-500">Show confirmation dialog before deleting tokens</p>
                    </div>
                    <Switch
                      isSelected={settings.security.confirmBeforeDelete}
                      onValueChange={(checked) => updateSetting('security', 'confirmBeforeDelete', checked)}
                      color="primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700 dark:text-default-400">Hide Tokens When Inactive</p>
                      <p className="text-xs text-default-500">Hide token codes when app is in background</p>
                    </div>
                    <Switch
                      isSelected={settings.security.hideTokensWhenInactive}
                      onValueChange={(checked) => updateSetting('security', 'hideTokensWhenInactive', checked)}
                      color="primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-default-700 dark:text-default-400">
                      Auto-Lock Timeout (minutes)
                    </label>
                    <Select
                      value={settings.security.autoLockTimeout}
                      onChange={(e) => updateSetting('security', 'autoLockTimeout', e.target.value)}
                      variant="bordered"
                      size="sm"
                      className="max-w-xs"
                    >
                      <SelectItem key="0" value="0">Never</SelectItem>
                      <SelectItem key="1" value="1">1 minute</SelectItem>
                      <SelectItem key="5" value="5">5 minutes</SelectItem>
                      <SelectItem key="15" value="15">15 minutes</SelectItem>
                      <SelectItem key="30" value="30">30 minutes</SelectItem>
                      <SelectItem key="60" value="60">1 hour</SelectItem>
                    </Select>
                  </div>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700 dark:text-default-400">Enable Notifications</p>
                      <p className="text-xs text-default-500">Show system notifications</p>
                    </div>
                    <Switch
                      isSelected={settings.notifications.enableNotifications}
                      onValueChange={(checked) => updateSetting('notifications', 'enableNotifications', checked)}
                      color="primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700 dark:text-default-400">Sound Effects</p>
                      <p className="text-xs text-default-500">Play sounds for notifications</p>
                    </div>
                    <Switch
                      isSelected={settings.notifications.soundEffects}
                      onValueChange={(checked) => updateSetting('notifications', 'soundEffects', checked)}
                      color="primary"
                      isDisabled={!settings.notifications.enableNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700 dark:text-default-400">Token Expiration Reminder</p>
                      <p className="text-xs text-default-500">Notify before token codes refresh</p>
                    </div>
                    <Switch
                      isSelected={settings.notifications.expirationReminder}
                      onValueChange={(checked) => updateSetting('notifications', 'expirationReminder', checked)}
                      color="primary"
                      isDisabled={!settings.notifications.enableNotifications}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-default-700 dark:text-default-400">
                      Reminder Time (seconds before expiration)
                    </label>
                    <Select
                      value={settings.notifications.reminderTime}
                      onChange={(e) => updateSetting('notifications', 'reminderTime', e.target.value)}
                      variant="bordered"
                      size="sm"
                      className="max-w-xs"
                      isDisabled={!settings.notifications.enableNotifications || !settings.notifications.expirationReminder}
                    >
                      <SelectItem key="3" value="3">3 seconds</SelectItem>
                      <SelectItem key="5" value="5">5 seconds</SelectItem>
                      <SelectItem key="10" value="10">10 seconds</SelectItem>
                      <SelectItem key="15" value="15">15 seconds</SelectItem>
                    </Select>
                  </div>
                </div>
              )}
              
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700 dark:text-default-400">Automatic Backup</p>
                      <p className="text-xs text-default-500">Periodically backup your tokens</p>
                    </div>
                    <Switch
                      isSelected={settings.backup.autoBackup}
                      onValueChange={(checked) => updateSetting('backup', 'autoBackup', checked)}
                      color="primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-default-700 dark:text-default-400">
                      Backup Interval
                    </label>
                    <Select
                      value={settings.backup.backupInterval}
                      onChange={(e) => updateSetting('backup', 'backupInterval', e.target.value)}
                      variant="bordered"
                      size="sm"
                      className="max-w-xs"
                      isDisabled={!settings.backup.autoBackup}
                    >
                      <SelectItem key="daily" value="daily">Daily</SelectItem>
                      <SelectItem key="weekly" value="weekly">Weekly</SelectItem>
                      <SelectItem key="monthly" value="monthly">Monthly</SelectItem>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700 dark:text-default-400">Encrypt Backups</p>
                      <p className="text-xs text-default-500">Protect your backup files with encryption</p>
                    </div>
                    <Switch
                      isSelected={settings.backup.encryptBackups}
                      onValueChange={(checked) => updateSetting('backup', 'encryptBackups', checked)}
                      color="primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-default-700 dark:text-default-400">Last Backup</p>
                    <p className="text-sm text-default-500">{settings.backup.lastBackup}</p>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <Button
                      color="primary"
                      className="w-full"
                      onClick={performBackup}
                      startContent={<RefreshCw size={16} />}
                    >
                      Create Manual Backup
                    </Button>
                    
                    <Button
                      color="default"
                      variant="flat"
                      className="w-full"
                      onClick={restoreBackup}
                    >
                      Restore from Backup
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="bg-gradient-to-br from-primary to-secondary p-4 w-16 h-16 rounded-lg mx-auto mb-4">
                      <Lock className="text-white w-full h-full" />
                    </div>
                    <h2 className="text-xl font-bold">WickAuth Authenticator</h2>
                    <p className="text-default-500">Version {typeof window !== 'undefined' && window.electronAPI?.appVersion ? window.electronAPI.appVersion : '1.0.0'}</p>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <h3 className="text-md font-medium mb-2">About WickAuth</h3>
                    <p className="text-default-500 text-sm mb-4">
                      WickAuth is a secure, open-source authenticator app for managing your two-factor authentication tokens. Your data is encrypted and stored locally on your device.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-2">Privacy</h3>
                    <p className="text-default-500 text-sm mb-4">
                      WickAuth does not collect any personal data. All of your tokens are stored encrypted on your local device and are never transmitted to any server.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-2">Credits</h3>
                    <p className="text-default-500 text-sm">
                      Built with Next.js, Electron, and NextUI. Icons provided by Lucide.
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  );
} 