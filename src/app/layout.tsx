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
