import { Token } from './shared/types';

declare global {
  interface Window {
    electronAPI?: {
      getTokens: () => Promise<Token[]>;
      addToken: (token: Token) => Promise<Token[]>;
      updateToken: (token: Token) => Promise<Token[]>;
      deleteToken: (id: string) => Promise<Token[]>;
      
      scanQRCode: () => Promise<{ uri: string }>;
      
      isMaximized: () => Promise<boolean>;
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<boolean>;
      unmaximizeWindow: () => Promise<boolean>;
      closeWindow: () => Promise<void>;
      
      writeToClipboard: (text: string) => Promise<boolean>;
      
      openExternalLink: (url: string) => Promise<boolean>;
      
      appVersion: string;
    };
  }
}

export {}; 