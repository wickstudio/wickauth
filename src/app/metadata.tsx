'use client';

import { useEffect, useState } from 'react';

export function AppMetadata() {
  const [appVersion, setAppVersion] = useState('1.0.0');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      setAppVersion(window.electronAPI.appVersion);
    }
  }, []);

  return null;
}

export const APP_NAME = 'WickAuth';
export const APP_DESCRIPTION = 'Professional Desktop Authenticator';
export const APP_VERSION = '1.0.0'; 