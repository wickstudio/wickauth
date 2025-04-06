# WickAuth

<div align="center">
  <img src="public/logo.png" alt="WickAuth Logo" width="150" />
  <h3>Professional Desktop Authenticator</h3>
  <p>A secure, elegant TOTP authenticator application for Windows</p>

  ![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![Platform](https://img.shields.io/badge/platform-Windows-brightgreen.svg)
  ![Node](https://img.shields.io/badge/node-%3E=18.0.0-green.svg)
  ![Electron](https://img.shields.io/badge/electron-29.x-blue.svg)
  ![NextJS](https://img.shields.io/badge/next.js-14.x-black.svg)
  [![Downloads](https://img.shields.io/github/downloads/wickstudio/wickauth/total.svg)](https://github.com/wickstudio/wickauth/releases/tag/v1.0.0)
  [![Release](https://img.shields.io/github/v/release/wickstudio/wickauth.svg)](https://github.com/wickstudio/wickauth/releases/tag/v1.0.0)
</div>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#downloads">Downloads</a> •
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#development">Development</a> •
  <a href="#security">Security</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a> •
  <a href="#acknowledgements">Acknowledgements</a>
</p>

---

## Overview

WickAuth is a professional-grade desktop authenticator application that provides secure two-factor authentication (2FA) using Time-Based One-Time Passwords (TOTP). Built with modern technologies like Electron, Next.js, and NextUI, it offers a sleek, intuitive interface while maintaining robust security standards.

Unlike browser-based authenticators, WickAuth operates as a standalone desktop application, offering enhanced security and offline accessibility. It's perfect for professionals, developers, and security-conscious users who require reliable authentication across multiple services.

## Downloads

### Latest Release: v1.0.0

- 📥 [WickAuth-Portable-1.0.0.exe](https://github.com/wickstudio/wickauth/releases/download/v1.0.0/WickAuth-Portable-1.0.0.exe) - Portable Windows Executable (No installation required)
- 📦 [Source code (zip)](https://github.com/wickstudio/wickauth/archive/refs/tags/v1.0.0.zip) - Source code archive (zip)
- 📦 [Source code (tar.gz)](https://github.com/wickstudio/wickauth/archive/refs/tags/v1.0.0.tar.gz) - Source code archive (tar.gz)

View all releases: [https://github.com/wickstudio/wickauth/releases](https://github.com/wickstudio/wickauth/releases)

## Features

### Core Features

- **TOTP Authentication**: RFC 6238 compliant Time-Based One-Time Password implementation
- **Secure Local Storage**: Encrypted database for storing authentication tokens
- **Offline Operation**: No internet connection required after setup
- **Custom Token Configuration**: Control over algorithm (SHA-1, SHA-256, SHA-512), digits (6 or 8), and period (30s or 60s)
- **Token Management**: Easy addition, editing, and removal of authentication tokens
- **Clipboard Integration**: One-click copying of generated codes
- **Countdown Timer**: Visual indication of code validity period

### User Experience

- **Modern UI**: Clean, responsive interface built with NextUI and Tailwind CSS
- **Custom Title Bar**: Frameless window with custom controls for a native feel
- **Dark Mode Support**: Full dark mode implementation for comfortable usage
- **Responsive Layout**: Adapts to different window sizes
- **Portable Mode**: Use without installation as a portable application
- **Auto-Starting Tokens**: Automatic code generation upon launch
- **Visual Feedback**: Animations and transitions for a polished experience

### Technical Features

- **Electron Framework**: Cross-platform compatibility (primarily Windows-focused)
- **Next.js Frontend**: React-based UI with modern development features
- **TypeScript**: Type-safe code for improved reliability
- **IPC Communication**: Secure communication between renderer and main processes
- **Protocol Handling**: Custom protocol handling for proper resource resolution
- **Multiple Build Options**: Both installed and portable versions available

## Screenshots

<div align="center">
  <img src="https://via.placeholder.com/800x450.png?text=WickAuth+Main+Screen" alt="WickAuth Main Screen" width="80%" />
  <p><em>Main application interface showing authentication tokens</em></p>
  
  <br />
  
  <div style="display: flex; justify-content: space-between;">
    <img src="https://via.placeholder.com/380x300.png?text=Add+Token+Screen" alt="Add Token Screen" width="48%" />
    <img src="https://via.placeholder.com/380x300.png?text=Token+Details" alt="Token Details" width="48%" />
  </div>
  <p><em>Left: Adding a new authentication token | Right: Token details view</em></p>
</div>

## Installation

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm** or **yarn**: For package management
- **Windows**: Windows 10 or higher recommended

### Method 1: Download Prebuilt Release (Recommended for Users)

1. Visit the [Releases](https://github.com/wickstudio/wickauth/releases) page
2. Download the latest `WickAuth-Portable-x.x.x.exe` file
3. Run the executable to start using WickAuth immediately

### Method 2: Build from Source (For Developers)

1. Clone the repository
   ```bash
   git clone https://github.com/wickstudio/wickauth.git
   cd wickauth
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Build the application
   ```bash
   # For regular build (development)
   npm run build
   
   # For portable executable (production)
   npm run make
   ```

4. Launch the application
   ```bash
   # For development version
   npm start
   
   # For production build
   ./dist/win-unpacked/WickAuth.exe
   ```

### Scripted Installation (Windows)

For convenience, several batch files are provided:

- `build.bat`: Creates a regular build
- `build.ps1`: Creates a portable EXE (requires PowerShell)
- `start.bat`: Launches the regular build
- `run.bat`: Smart launcher that automatically selects available build
- `dev.bat`: Starts the application in development mode

## Usage

### Getting Started

After launching WickAuth, you'll be presented with the main interface. If this is your first time using the application, the token list will be empty.

### Adding a New Token

1. Click the "**+ Add Token**" button in the main interface
2. Enter the required information:
   - **Name**: A descriptive name for the token (e.g., "GitHub")
   - **Secret Key**: The base32-encoded secret key provided by the service
   - **Issuer** (optional): The service provider name
3. Advanced options (optional):
   - **Algorithm**: Select from SHA-1, SHA-256, or SHA-512 (default: SHA-1)
   - **Digits**: Number of digits in the generated code (6 or 8)
   - **Period**: How often the code refreshes (30 or 60 seconds)
4. Click "**Add Token**" to save

### Using Authentication Tokens

1. When you need to authenticate, open WickAuth
2. Find the desired token in your list
3. Use the current code displayed next to the token name
4. The progress bar indicates the remaining validity time of the code

### Managing Tokens

- **Edit**: Click the edit icon (pencil) next to a token to modify its details
- **Delete**: In the edit screen, use the "Delete" button to remove a token
- **Copy**: Click the code to copy it to the clipboard automatically

### Window Controls

The custom title bar provides familiar controls:
- **Minimize**: Reduce the window to the taskbar
- **Maximize/Restore**: Toggle between maximized and regular window size
- **Close**: Exit the application

### Keyboard Shortcuts

- **Ctrl+N**: Add new token
- **Esc**: Cancel current operation
- **Ctrl+C**: Copy selected token code
- **Alt+F4**: Close application

## Architecture

WickAuth follows a modern architecture pattern combining Electron and Next.js:

### Application Layers

```
┌────────────────────────────────┐
│      Electron Main Process      │ ← Main application process
├────────────────────────────────┤
│        IPC Bridge Layer        │ ← Inter-process communication
├────────────────────────────────┤
│     Next.js (React) UI Layer   │ ← User interface components
├────────────────────────────────┤
│     Core Services & Utilities  │ ← TOTP generation, encryption
└────────────────────────────────┘
```

### Key Components

- **Main Process** (`src/core/desktop/main.ts`): Controls the application lifecycle, window management, and system integration
- **Preload Script** (`src/core/desktop/preload.js`): Exposes secure APIs to the renderer process
- **UI Components** (`src/app/`, `src/components/`): React components for the user interface
- **Core Services** (`src/core/`): Authentication and storage functionality
- **Data Types** (`src/shared/types.ts`): TypeScript interfaces for data structures
- **Route Handler** (`public/route-handler.js`): Client-side dynamic route handling for Electron

### Data Flow

1. User interacts with React components in the renderer process
2. UI components call exposed IPC methods from the preload script
3. IPC messages are transmitted to the main process
4. Main process performs operations (database, system tasks)
5. Results are returned to the renderer via IPC
6. UI updates to reflect changes

### Database Structure

Tokens are stored in a secure local database using electron-store with the following structure:

```typescript
interface Token {
  id: string;             // Unique identifier
  name: string;           // Display name
  secret: string;         // TOTP secret key
  issuer?: string;        // Optional service provider
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512';  // Hashing algorithm
  digits?: number;        // Code length (6 or 8)
  period?: number;        // Refresh period (30 or 60 seconds)
  createdAt: number;      // Timestamp of creation
}
```

## Development

### Development Environment Setup

1. Fork and clone the repository
   ```bash
   git clone https://github.com/yourusername/wickauth.git
   cd wickauth
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development environment
   ```bash
   npm run dev:electron
   ```
   This will:
   - Launch the Next.js development server
   - Start Electron pointing to the dev server
   - Enable hot reloading for faster development

### Project Structure

- **`/src/app`**: Next.js pages and routes
- **`/src/components`**: Reusable UI components
- **`/src/core`**: Core application functionality
  - **`/desktop`**: Electron-specific code
  - **`/auth`**: Authentication logic
  - **`/storage`**: Data persistence layer
- **`/src/shared`**: Shared utilities and types
- **`/public`**: Static assets and client-side scripts

### Build System

The application uses several build configurations:

- **Development Build**: Uses Next.js development server with hot reloading
- **Production Build**: Creates optimized static export and Electron application
- **Portable Build**: Packages the application as a standalone executable

### Styling and UI

- **Tailwind CSS**: Used for styling components
- **NextUI**: Component library for consistent design
- **Framer Motion**: Animations and transitions
- **Lucide Icons**: SVG icon set

### Testing Changes

1. Make your code changes
2. Run the development environment to test
3. Build a production version to verify functionality
   ```bash
   npm run build
   npm start
   ```

### Debugging

- **Main Process**: Use console.log statements (visible in terminal)
- **Renderer Process**: Use DevTools console (available in development mode)
- **Enable Debug Mode**: Set `DEBUG=true` environment variable for additional logging

## Security

### Security Design Principles

WickAuth prioritizes security through several key measures:

1. **Local Storage Only**: Authentication secrets never leave your device
2. **Encrypted Storage**: Data is stored in an encrypted format
3. **Process Isolation**: Electron's contextIsolation prevents direct access to Node.js APIs
4. **Limited File Access**: Application has restricted access to the filesystem
5. **No Network Requirement**: Functions fully offline after initial setup

### TOTP Implementation

The application implements the Time-Based One-Time Password algorithm according to RFC 6238:

1. Uses HMAC-SHA-1/SHA-256/SHA-512 cryptographic algorithms
2. Time-synchronized with standard 30-second windows (configurable)
3. Supports 6 or 8-digit output codes

### Data Protection

- Secrets are never exposed in the UI after initial entry
- Database is protected using machine-specific encryption
- No analytics or telemetry data is collected

### Security Recommendations

- Keep your operating system and application updated
- Use strong, unique passwords for each service
- Backup your authentication tokens securely
- Do not share your secret keys or QR codes

## Troubleshooting

### Common Issues

#### Application Won't Start

**Symptom**: Double-clicking the application does nothing or briefly shows a window before closing.

**Solutions**:
- Run the application as an administrator
- Ensure Node.js is properly installed (for dev mode)
- Check Windows Event Viewer for application errors
- Try running from the command line to see error output

#### Missing Icons or Resources

**Symptom**: The application starts but has missing graphics or icons.

**Solutions**:
- Ensure the application was built correctly
- Try rebuilding with `npm run make`
- Verify the `public` folder contains the required assets

#### Authentication Codes Not Working

**Symptom**: Generated codes aren't accepted by the service.

**Solutions**:
- Verify your computer's time is correctly synchronized
- Check if the service requires a specific algorithm or digits setting
- Ensure the secret key was entered correctly (no spaces, case-sensitive)

#### Blank Screen on Launch

**Symptom**: The application window is empty or shows a blank screen.

**Solutions**:
- Delete the application data and restart
- Try launching with the `--ignore-gpu-blacklist` flag
- Check your graphics drivers are up to date

### Getting Help

If you're experiencing issues not covered here:

1. Check the [GitHub Issues](https://github.com/wickstudio/wickauth/issues) for similar problems
2. Create a new issue with detailed information about your problem
3. Include your system information, error messages, and steps to reproduce

## Roadmap

### Planned Features

- **Cloud Backup**: Optional encrypted backup to cloud storage
- **Import/Export**: Support for importing/exporting tokens
- **QR Code Scanner**: Scan QR codes directly from screen
- **Multiple Profiles**: Support for different token collections
- **Automatic Updates**: In-app update system
- **Advanced Search**: Filter and search functionality for many tokens
- **Cross-Platform Support**: macOS and Linux versions
- **Mobile Companion App**: Synchronized mobile application

### In Development

- Enhanced security features
- UI/UX improvements
- Performance optimizations

### Version History

- **1.0.0**: Initial release with core functionality
- **1.1.0**: (Planned) QR code scanning and improved UI
- **1.2.0**: (Planned) Import/Export functionality
- **2.0.0**: (Planned) Cloud backup and cross-platform support

## Contributing

Contributions are welcome and appreciated! Here's how you can contribute:

### Ways to Contribute

- **Bug Reports**: Create detailed issues for bugs you encounter
- **Feature Requests**: Suggest new features or improvements
- **Documentation**: Help improve or translate documentation
- **Code Contributions**: Submit pull requests with bug fixes or features
- **Testing**: Test the application on different setups and report issues

### Contribution Process

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

### Code Style Guidelines

- Follow the existing code style
- Write clear, documented code
- Include appropriate tests for new functionality
- Ensure all linting passes (`npm run lint`)
- Keep pull requests focused on a single feature/fix

### Development Workflow

1. Select an issue to work on (or create one)
2. Discuss approach in the issue thread
3. Implement solution in your fork
4. Test thoroughly
5. Submit pull request
6. Address review feedback

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

### Technologies Used

- [Electron](https://www.electronjs.org/) - Desktop application framework
- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [NextUI](https://nextui.org/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide Icons](https://lucide.dev/) - SVG icon set
- [Totpify](https://github.com/n6g7/totpify) - TOTP implementation

### Inspiration

- [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)
- [Authy](https://authy.com/)
- [Microsoft Authenticator](https://www.microsoft.com/en-us/security/mobile-authenticator-app)

### Special Thanks

- All contributors and supporters
- The open-source community for their invaluable resources
- You, for using or contributing to WickAuth!

---

<div align="center">
  <p>
    <a href="https://github.com/wickstudio">
      <img src="https://via.placeholder.com/120x120.png?text=WickStudio" alt="WickStudio" width="60" style="border-radius: 50%;" />
    </a>
  </p>
  <p>
    Made with ❤️ by <a href="https://github.com/wickstudio">WickStudio</a>
  </p>
  <p>
    <a href="https://github.com/wickstudio/wickauth/stargazers">⭐ Star us on GitHub</a>
  </p>
</div> 
