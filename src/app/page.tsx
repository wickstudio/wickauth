'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Divider, Button, Link, Tooltip } from '@nextui-org/react';
import TokenList from './components/TokenList';
import { motion } from 'framer-motion';
import { Shield, LockKeyhole, Minimize, Maximize, X, Github, Instagram, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Check if window is maximized on load
    async function checkMaximized() {
      if (window.electronAPI) {
        const maximized = await window.electronAPI.isMaximized();
        setIsMaximized(maximized);
      }
    }
    checkMaximized();
  }, []);

  const handleMaximizeToggle = async () => {
    if (window.electronAPI) {
      const newState = await window.electronAPI.maximizeWindow();
      setIsMaximized(newState);
    }
  };

  const handleSocialLink = (url: string) => {
    if (window.electronAPI) {
      // Use Electron's shell to open external links safely
      window.electronAPI.openExternalLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <div className="app-drag px-4 py-1 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 app-no-drag">
          <div className="h-8 w-8 relative overflow-hidden rounded-md bg-black">
            <Image 
              src="/logo.png" 
              alt="WickAuth Logo" 
              width={36} 
              height={36}
              className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              priority
              unoptimized
            />
          </div>
          <span className="font-medium">Authenticator</span>
        </div>
        
        <div className="flex app-no-drag">
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onClick={() => window.electronAPI?.minimizeWindow()}
            className="text-default-500 hover:bg-default-100/50 dark:hover:bg-default-100/10 rounded-full"
            aria-label="Minimize window"
          >
            <Minimize size={16} />
          </Button>
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onClick={handleMaximizeToggle}
            className="text-default-500 hover:bg-default-100/50 dark:hover:bg-default-100/10 rounded-full"
            aria-label={isMaximized ? "Restore window" : "Maximize window"}
          >
            <Maximize size={16} />
          </Button>
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onClick={() => window.electronAPI?.closeWindow()}
            className="text-danger hover:bg-danger/20 rounded-full"
            aria-label="Close window"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-2 mb-1 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Authentication Tokens
          </h1>
          <p className="text-default-500 text-sm">
            Secure access to your accounts with time-based codes
          </p>
        </div>
        
        <div className="hidden sm:block">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none shadow-sm">
            <CardBody className="py-2 px-4 flex gap-2 items-center">
              <div className="p-1.5 rounded-full bg-primary/20">
                <Shield size={16} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-default-700 dark:text-default-300">
                End-to-End Encrypted
              </span>
            </CardBody>
          </Card>
        </div>
      </div>
      
      <Card className="shadow-xl border dark:border-default-100/10 mx-4 flex-grow overflow-hidden flex flex-col">
        <CardBody className="px-3 md:px-5 pt-2 pb-3 overflow-hidden h-full">
          <TokenList />
        </CardBody>
      </Card>
      
      <div className="mt-2 pt-3 pb-2 text-center text-xs text-default-400 border-t border-default-200/30 dark:border-default-700/30 mx-4 flex-shrink-0">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 relative mb-2 overflow-hidden bg-black">
            <Image 
              src="/logo.png" 
              alt="WickAuth Logo" 
              width={40} 
              height={40}
              className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              priority
              unoptimized
            />
          </div>
          
          {/* Social Media Links */}
          <div className="flex items-center justify-center gap-6 mb-3">
            <Tooltip content="GitHub: wickstudio">
              <button
                onClick={() => handleSocialLink('https://github.com/wickstudio')}
                className="text-default-500 hover:text-default-900 dark:hover:text-default-200 transition-colors"
                aria-label="GitHub"
              >
                <Github size={18} />
              </button>
            </Tooltip>
            
            <Tooltip content="Discord: discord.gg/wicks">
              <button
                onClick={() => handleSocialLink('https://discord.gg/wicks')}
                className="text-default-500 hover:text-default-900 dark:hover:text-default-200 transition-colors"
                aria-label="Discord"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  width={18} 
                  height={18} 
                  fill="currentColor"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/>
                </svg>
              </button>
            </Tooltip>
            
            <Tooltip content="Instagram: mik__subhi">
              <button
                onClick={() => handleSocialLink('https://www.instagram.com/mik__subhi/')}
                className="text-default-500 hover:text-default-900 dark:hover:text-default-200 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </button>
            </Tooltip>
          </div>
          
          <p className="mb-1">Your tokens are securely stored on this device only</p>
          <p className="text-default-500 font-medium">Powered by Wick Studio</p>
        </div>
      </div>
    </motion.div>
  );
}
