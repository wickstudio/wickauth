'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, Settings, Lock, Search, Plus, LifeBuoy, MoreVertical, Minimize, Maximize, X } from 'lucide-react';
import { Token } from '../../shared/types';
import { 
  Button, 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  Link, 
  Switch, 
  Tooltip, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Input,
  Avatar
} from '@nextui-org/react';
import { useEffect, useState } from 'react';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  useEffect(() => {
    setMounted(true);

    async function checkMaximized() {
      if (typeof window !== 'undefined' && window.electronAPI) {
        try {
          const maximized = await window.electronAPI.isMaximized();
          setIsMaximized(maximized);
        } catch (error) {
          console.error('Error checking window state:', error);
        }
      }
    }
    
    checkMaximized();
  }, []);

  const handleWindowControls = async (action: 'minimize' | 'maximize' | 'close') => {
    if (typeof window === 'undefined' || !window.electronAPI) {
      console.log('ElectronAPI not available for window controls');
      return;
    }
    
    try {
      if (action === 'minimize') {
        await window.electronAPI.minimizeWindow();
      } else if (action === 'maximize') {
        const newMaximized = await window.electronAPI.maximizeWindow();
        setIsMaximized(newMaximized);
      } else if (action === 'close') {
        await window.electronAPI.closeWindow();
      }
    } catch (error) {
      console.error(`Error handling window action: ${action}`, error);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Navbar 
      isBordered 
      className="bg-background/70 backdrop-blur-xl border-b dark:border-zinc-800/30 border-zinc-200/30 app-drag shadow-sm"
      classNames={{
        wrapper: "px-4",
      }}
      maxWidth="full"
    >
      <NavbarBrand className="app-drag">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg mr-2 shadow-md">
            <Lock className="text-white" size={20} />
          </div>
          <Link href="/" className="font-bold text-inherit text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            WickAuth
          </Link>
        </div>
      </NavbarBrand>
      
      <NavbarContent className="hidden sm:flex gap-4 app-drag flex-1 justify-center" justify="center">
        <NavbarItem className="max-w-lg w-full">
          <Input
            classNames={{
              base: "max-w-lg w-full h-10 app-no-drag",
              mainWrapper: "h-full",
              input: "text-small",
              inputWrapper: "h-full font-normal text-default-500 bg-default-400/10 dark:bg-default-500/10 hover:bg-default-400/20 dark:hover:bg-default-500/20 shadow-sm transition-colors rounded-xl",
            }}
            placeholder="Search tokens..."
            size="sm"
            radius="lg"
            startContent={<Search size={16} />}
            type="search"
          />
        </NavbarItem>
      </NavbarContent>
      
      <NavbarContent justify="end">
        <NavbarItem>
          <Button 
            isIconOnly 
            color="primary" 
            variant="flat" 
            aria-label="Add new token"
            as={Link}
            href="/add"
            className="app-no-drag bg-gradient-to-r from-primary/80 to-secondary/80 text-white shadow-md hover:shadow-lg hover:opacity-90"
            radius="full"
          >
            <Plus size={20} />
          </Button>
        </NavbarItem>
        
        <NavbarItem>
          <Tooltip content={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <div className="flex items-center app-no-drag">
              <Switch
                defaultSelected={theme === 'dark'}
                size="sm"
                color="primary"
                thumbIcon={({ isSelected }) => 
                  isSelected ? (
                    <Moon size={16} className="text-white" />
                  ) : (
                    <Sun size={16} className="text-white" />
                  )
                }
                onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                classNames={{
                  wrapper: "bg-default-200 dark:bg-default-700 group-data-[selected=true]:bg-gradient-to-r group-data-[selected=true]:from-primary group-data-[selected=true]:to-secondary",
                }}
              />
            </div>
          </Tooltip>
        </NavbarItem>
        
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button 
                isIconOnly 
                variant="light" 
                aria-label="More options" 
                className="app-no-drag hover:bg-default-100 dark:hover:bg-default-100/10"
                radius="full"
              >
                <MoreVertical size={20} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Profile Actions" 
              variant="flat"
              className="backdrop-blur-xl bg-background/70 dark:bg-default-100/50"
            >
              <DropdownItem 
                key="settings" 
                startContent={<Settings size={16} />} 
                as={Link} 
                href="/settings"
              >
                Settings
              </DropdownItem>
              <DropdownItem key="help" startContent={<LifeBuoy size={16} />}>Help & Support</DropdownItem>
              <DropdownItem key="about" startContent={<Lock size={16} />}>
                About WickAuth {typeof window !== 'undefined' && window.electronAPI?.appVersion ? window.electronAPI.appVersion : '0.1.0'}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
        
        {/* Window Controls (Electron) */}
        <div className="flex ml-2 -mr-2 app-no-drag">
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onClick={() => handleWindowControls('minimize')}
            className="text-default-500 hover:bg-default-100 dark:hover:bg-default-100/10 rounded-full"
          >
            <Minimize size={16} />
          </Button>
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onClick={() => handleWindowControls('maximize')}
            className="text-default-500 hover:bg-default-100 dark:hover:bg-default-100/10 rounded-full"
          >
            <Maximize size={16} className={isMaximized ? "scale-90" : ""} />
          </Button>
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onClick={() => handleWindowControls('close')}
            className="text-danger hover:bg-danger/20 rounded-full"
          >
            <X size={16} />
          </Button>
        </div>
      </NavbarContent>
    </Navbar>
  );
}