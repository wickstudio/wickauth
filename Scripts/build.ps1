Write-Host "======================================" -ForegroundColor Cyan
Write-Host "WickAuth Build Script (PowerShell)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Warning: Not running as Administrator. Symbolic link errors may occur." -ForegroundColor Yellow
    Write-Host "For best results, run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

$env:NODE_ENV = "production"

Write-Host "Closing any running instances..." -ForegroundColor Cyan
Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name WickAuth -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Cleaning previous builds..." -ForegroundColor Cyan
if (Test-Path "dist") { Remove-Item -Path "dist" -Recurse -Force }
if (Test-Path "out") { Remove-Item -Path "out" -Recurse -Force }
if (Test-Path "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign") { 
    Remove-Item -Path "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Configuring Next.js..." -ForegroundColor Cyan
@"
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: false,
  experimental: {
    appDocumentPreloading: false
  }
};

module.exports = nextConfig;
"@ | Out-File -FilePath "next.config.js" -Encoding utf8

Write-Host "Ensuring production mode is set..." -ForegroundColor Cyan
$mainPath = "src/core/desktop/main.ts"
if (Test-Path $mainPath) {
    Copy-Item -Path $mainPath -Destination "$mainPath.backup" -Force
    
    $mainContent = Get-Content -Path $mainPath -Raw
    
    $updatedContent = $mainContent -replace "const appEnvironment = process.env.NODE_ENV \|\| 'production';", "const appEnvironment = 'production';"
    
    $updatedContent | Out-File -FilePath $mainPath -Encoding utf8
}

Write-Host "Creating modified layout file..." -ForegroundColor Cyan
$layoutPath = "src/app/layout.tsx"
if (Test-Path $layoutPath) {
    Copy-Item -Path $layoutPath -Destination "$layoutPath.original" -Force
    
    @"
'use client';

import './globals.css';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider } from 'next-themes';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <title>WickAuth | Professional Authenticator</title>
        <meta name="description" content="Advanced desktop authenticator with TOTP support" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="h-full overflow-hidden bg-gradient-to-b from-background to-background/90 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <NextUIProvider>
            <div className="h-full max-h-screen overflow-hidden flex flex-col bg-gradient-to-b from-background to-background/80">
              {children}
            </div>
          </NextUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
"@ | Out-File -FilePath $layoutPath -Encoding utf8
    
    Write-Host "Created simplified layout file." -ForegroundColor Green
}

Write-Host "Building application..." -ForegroundColor Cyan
npm run build

if (-not (Test-Path "out")) {
    Write-Host "Build failed - no output directory created. Exiting." -ForegroundColor Red
    
    if (Test-Path "$layoutPath.original") {
        Write-Host "Restoring original layout file..." -ForegroundColor Yellow
        Copy-Item -Path "$layoutPath.original" -Destination $layoutPath -Force
        Remove-Item -Path "$layoutPath.original" -Force
    }
    
    if (Test-Path "$mainPath.backup") {
        Write-Host "Restoring original main.ts file..." -ForegroundColor Yellow
        Copy-Item -Path "$mainPath.backup" -Destination $mainPath -Force
        Remove-Item -Path "$mainPath.backup" -Force
    }
    
    exit 1
}

Write-Host "Fixing asset paths in HTML files..." -ForegroundColor Cyan
if (Test-Path "out/index.html") {
    $indexHtml = Get-Content -Path "out/index.html" -Raw
    $fixedHtml = $indexHtml -replace '/_next/', './_next/'
    $fixedHtml | Out-File -FilePath "out/index.html" -Encoding utf8

    Write-Host "Setting up dynamic routes..." -ForegroundColor Cyan
    New-Item -Path "out/edit" -ItemType Directory -Force | Out-Null
    New-Item -Path "out/edit/id-placeholder" -ItemType Directory -Force | Out-Null

    $fallbackHtml = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=/" />
<script>window.location.href = "/";</script>
</head>
<body>Loading...</body>
</html>
"@

    $fallbackHtml | Out-File -FilePath "out/edit/id-placeholder/index.html" -Encoding utf8
    $fixedHtml | Out-File -FilePath "out/edit/index.html" -Encoding utf8
} else {
    Write-Host "Warning: index.html not found. Skipping path fixes." -ForegroundColor Yellow
}

Write-Host "Copying application icon..." -ForegroundColor Cyan
if (Test-Path "public/logo.png") {
    New-Item -Path "out/images" -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
    Copy-Item -Path "public/logo.png" -Destination "out/logo.png" -Force
    Copy-Item -Path "public/logo.png" -Destination "out/images/logo.png" -Force
    
    Get-ChildItem -Path "out" -Filter "_next" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        Copy-Item -Path "public/logo.png" -Destination (Join-Path $_.FullName "logo.png") -Force
    }
}

Write-Host "Creating asset path resolver..." -ForegroundColor Cyan
@"
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('link[rel="stylesheet"], script[src], img[src]').forEach(element => {
      const srcAttr = element.hasAttribute('src') ? 'src' : 'href';
      const currentPath = element.getAttribute(srcAttr);
      
      if (currentPath && currentPath.startsWith('/')) {
        const newPath = './' + currentPath.substring(1);
        element.setAttribute(srcAttr, newPath);
      }
    });
  });
}
"@ | Out-File -FilePath "out/path-resolver.js" -Encoding utf8

Write-Host "Adding path resolver to HTML files..." -ForegroundColor Cyan
Get-ChildItem -Path "out" -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and -not $content.Contains('path-resolver.js')) {
        $updatedContent = $content -replace '</head>', '<script src="./path-resolver.js"></script></head>'
        $updatedContent | Out-File -FilePath $_.FullName -Encoding utf8
    }
}

Write-Host "Building executable..." -ForegroundColor Cyan
npm run make

Write-Host "Finalizing build..." -ForegroundColor Cyan
if (Test-Path "dist/win-unpacked") {
    New-Item -Path "dist/win-unpacked/resources/app" -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
    New-Item -Path "dist/win-unpacked/resources/app/.env.production" -ItemType File -Force | Out-Null
    "NODE_ENV=production" | Out-File -FilePath "dist/win-unpacked/resources/app/.env.production" -Encoding utf8
    
    if (Test-Path "public/logo.png") {
        New-Item -Path "dist/win-unpacked/resources" -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
        Copy-Item -Path "public/logo.png" -Destination "dist/win-unpacked/resources/logo.png" -Force
        
        New-Item -Path "dist/win-unpacked/resources/app/public" -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
        Copy-Item -Path "public/logo.png" -Destination "dist/win-unpacked/resources/app/public/logo.png" -Force -ErrorAction SilentlyContinue
        
        New-Item -Path "dist/win-unpacked/resources/app/out" -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
        Copy-Item -Path "public/logo.png" -Destination "dist/win-unpacked/resources/app/out/logo.png" -Force -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "out/index.html") {
        Copy-Item -Path "out/index.html" -Destination "dist/win-unpacked/resources/app/index.html" -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "Build succeeded!" -ForegroundColor Green
} else {
    Write-Host "Warning: Build may have failed - dist/win-unpacked not found." -ForegroundColor Yellow
}

if (Test-Path "$layoutPath.original") {
    Write-Host "Restoring original layout file..." -ForegroundColor Cyan
    Copy-Item -Path "$layoutPath.original" -Destination $layoutPath -Force
    Remove-Item -Path "$layoutPath.original" -Force
}

if (Test-Path "$mainPath.backup") {
    Write-Host "Restoring original main.ts file..." -ForegroundColor Cyan
    Copy-Item -Path "$mainPath.backup" -Destination $mainPath -Force
    Remove-Item -Path "$mainPath.backup" -Force
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is available at:" -ForegroundColor White
Write-Host "dist\win-unpacked\WickAuth.exe" -ForegroundColor White
Write-Host "dist\WickAuth-1.0.0.exe" -ForegroundColor White
Write-Host ""
Write-Host "Run 'run.bat' to start the application" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Green 