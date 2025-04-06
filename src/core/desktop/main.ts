import { app, BrowserWindow, ipcMain, protocol, screen, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import serve from 'electron-serve';
import Store from 'electron-store';
import { Token } from '../../shared/types';

const appEnvironment = 'production';
const isProd = appEnvironment === 'production';
const store = new Store({ name: 'wickauth-database' });

let mainWindow: BrowserWindow | null;

const loadURL = serve({ 
  directory: 'out',
  isCorsEnabled: true
});

function logDebugInfo(message: string, ...args: any[]) {
  if (process.env.DEBUG) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  logDebugInfo('Creating window...');
  logDebugInfo('App path:', app.getAppPath());
  logDebugInfo('Resource path:', process.resourcesPath);
  logDebugInfo('Current directory:', process.cwd());
  
  if (isProd) {
    protocol.registerFileProtocol('file', (request, callback) => {
      const url = request.url.substring(7);
      try {
        return callback(decodeURIComponent(url));
      } catch (error) {
        return callback('404');
      }
    });
  }
  
  let iconPath;
  if (isProd) {
    const possibleIconPaths = [
      path.join(process.resourcesPath, 'icon.ico'),
      path.join(process.resourcesPath, 'icon.png'),
      path.join(process.resourcesPath, 'logo.png'),
      path.join(app.getAppPath(), 'logo.png'),
      path.join(app.getAppPath(), 'resources', 'icon.ico'),
      path.join(app.getAppPath(), 'resources', 'logo.png'),
      path.join(app.getAppPath(), 'public', 'icon.ico'),
      path.join(app.getAppPath(), 'public', 'logo.png'),
      path.join(app.getAppPath(), 'out', 'logo.png'),
      path.join(__dirname, '..', '..', '..', 'public', 'logo.png')
    ];
    
    logDebugInfo('Searching for icon files...');
    possibleIconPaths.forEach(p => {
      logDebugInfo(`Checking: ${p} - ${fs.existsSync(p) ? 'EXISTS' : 'NOT FOUND'}`);
    });
    
    for (const possiblePath of possibleIconPaths) {
      if (fs.existsSync(possiblePath)) {
        iconPath = possiblePath;
        logDebugInfo('Using icon path:', iconPath);
        break;
      }
    }
    
    if (!iconPath) {
      logDebugInfo('No icon found, using default Electron icon');
    }
  } else {
    const devIconPaths = [
      path.join(process.cwd(), 'public', 'icon.ico'),
      path.join(process.cwd(), 'public', 'logo.png')
    ];
    
    for (const possiblePath of devIconPaths) {
      if (fs.existsSync(possiblePath)) {
        iconPath = possiblePath;
        logDebugInfo('Using development icon path:', iconPath);
        break;
      }
    }
    
    if (!iconPath) {
      iconPath = path.join(process.cwd(), 'public', 'logo.png');
      logDebugInfo('Falling back to default development icon path:', iconPath);
    }
  }
  
  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: Math.min(1100, width * 0.8),
    height: Math.min(800, height * 0.8),
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      devTools: !isProd
    },
    title: 'WickAuth',
    show: false,
    backgroundColor: '#121212',
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    icon: iconPath,
    useContentSize: true,
    fullscreenable: true
  };

  mainWindow = new BrowserWindow(windowOptions);
  
  mainWindow.webContents.on('render-process-gone' as any, (_event: any, details: any) => {
    logDebugInfo('Renderer process crashed:', details);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    logDebugInfo('Failed to load:', errorCode, errorDescription);
  });
  
  const aspectRatio = windowOptions.width! / windowOptions.height!;
  mainWindow.setAspectRatio(aspectRatio);

  if (isProd) {
    logDebugInfo('Loading from production build');
    
    try {
      const outDir = path.join(app.getAppPath(), 'out');
      logDebugInfo('Files in out directory:', outDir);
      if (fs.existsSync(outDir)) {
        fs.readdirSync(outDir).forEach(file => {
          logDebugInfo(` - ${file}`);
          
          const filePath = path.join(outDir, file);
          if (fs.statSync(filePath).isDirectory()) {
            logDebugInfo(`   Subdir contents of ${file}:`);
            try {
              fs.readdirSync(filePath).slice(0, 5).forEach(subFile => {
                logDebugInfo(`     - ${subFile}`);
              });
              if (fs.readdirSync(filePath).length > 5) {
                logDebugInfo(`     ... and more files`);
              }
            } catch (err) {
              logDebugInfo(`     Error reading subdirectory: ${err}`);
            }
          }
        });
      } else {
        logDebugInfo('Out directory not found at:', outDir);
      }
    } catch (err) {
      logDebugInfo('Error listing directory:', err);
    }
    
    logDebugInfo('Using electron-serve to load content');
    loadURL(mainWindow);
  } else {
    const port = process.env.PORT || 3000;
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    logDebugInfo('Window ready to show');
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      
      if (!isProd && mainWindow) {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    logDebugInfo('Navigation detected:', parsedUrl.pathname);
    
    if (parsedUrl.pathname.startsWith('/edit/') && isProd) {
      logDebugInfo('Detected dynamic route navigation');
    }
  });

  ipcMain.handle('get-tokens', () => {
    return store.get('tokens') as Token[] || [];
  });

  ipcMain.handle('add-token', (_event, token: Token) => {
    const tokens = store.get('tokens') as Token[] || [];
    store.set('tokens', [...tokens, token]);
    return store.get('tokens');
  });

  ipcMain.handle('update-token', (_event, updatedToken: Token) => {
    const tokens = store.get('tokens') as Token[] || [];
    const updatedTokens = tokens.map((token: Token) => 
      token.id === updatedToken.id ? updatedToken : token
    );
    store.set('tokens', updatedTokens);
    return updatedTokens;
  });

  ipcMain.handle('delete-token', (_event, tokenId: string) => {
    const tokens = store.get('tokens') as Token[] || [];
    const filteredTokens = tokens.filter((token: Token) => token.id !== tokenId);
    store.set('tokens', filteredTokens);
    return filteredTokens;
  });
  
  ipcMain.handle('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
    return true;
  });
  
  ipcMain.handle('window-maximize', () => {
    if (!mainWindow) return false;
    
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return false;
    } else {
      mainWindow.maximize();
      return true;
    }
  });
  
  ipcMain.handle('window-close', () => {
    if (mainWindow) mainWindow.close();
    return true;
  });
  
  ipcMain.handle('is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });
  
  ipcMain.handle('clipboard-write', (_event, text) => {
    const { clipboard } = require('electron');
    clipboard.writeText(text);
    return true;
  });
  
  ipcMain.handle('open-external-link', (_event, url) => {
    shell.openExternal(url);
    return true;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  if (isProd) {
    protocol.interceptFileProtocol('file', (request, callback) => {
      let url = request.url.substr(7);
      url = decodeURIComponent(url);
      
      if (url.includes('.js') || url.includes('.css') || url.includes('.png') || url.includes('.ico')) {
        const outPath = path.join(app.getAppPath(), 'out', path.basename(url));
        if (fs.existsSync(outPath)) {
          return callback(outPath);
        }
        
        const nextPath = path.join(app.getAppPath(), 'out', '_next', path.basename(url));
        if (fs.existsSync(nextPath)) {
          return callback(nextPath);
        }
      }
      
      callback(url);
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 
