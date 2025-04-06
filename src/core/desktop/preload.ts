import { contextBridge, ipcRenderer } from 'electron';
import { Token } from '../../shared/types';

contextBridge.exposeInMainWorld('electronAPI', {
  getTokens: () => ipcRenderer.invoke('get-tokens'),
  addToken: (token: Token) => ipcRenderer.invoke('add-token', token),
  updateToken: (token: Token) => ipcRenderer.invoke('update-token', token),
  deleteToken: (id: string) => ipcRenderer.invoke('delete-token', id),
  
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  
  writeToClipboard: (text: string) => ipcRenderer.invoke('clipboard-write', text),

  openExternalLink: (url: string) => ipcRenderer.invoke('open-external-link', url),

  appVersion: process.env.npm_package_version || '0.1.0',
}); 