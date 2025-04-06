'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Button, Tooltip, CircularProgress as NextUICircularProgress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input, DropdownSection } from '@nextui-org/react';
import { Copy, Star, StarOff, MoreVertical, Edit, Trash, AlertCircle, Search, X, Plus, Key, ChevronDown, LayoutList, List, Settings, Filter, Check, Clock, ArrowDownAZ } from 'lucide-react';
import { TOTPService } from '../../core/auth/totpService';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Token } from '../../shared/types';
import CircularProgress from './CircularProgress';

const TokenCode = ({ token, timeRemaining }: { token: Token; timeRemaining: number }) => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    function generateCode() {
      try {
        const newCode = TOTPService.generateCode(token);
        setCode(newCode);
        setError(false);
      } catch (err) {
        console.error('Error generating TOTP code:', err);
        setError(true);
        setCode('------');
      }
    }
    
    generateCode();
  }, [token, timeRemaining === 30]);
  
  const formattedCode = useMemo(() => {
    if (error || !code) return '------';
    
    const middle = Math.floor(code.length / 2);
    return `${code.slice(0, middle)} ${code.slice(middle)}`;
  }, [code, error]);
  
  const progress = useMemo(() => {
    const period = token.period || 30;
    return Math.max(0, Math.min(100, (timeRemaining / period) * 100));
  }, [timeRemaining, token.period]);
  
  const getProgressColor = useMemo(() => {
    if (progress <= 25) return "danger";
    if (progress <= 50) return "warning"; 
    return "primary";
  }, [progress]);
  
  return (
    <div className="relative flex items-center justify-between gap-4">
      <div className="flex items-center">
        <CircularProgress
          period={token.period || 30}
          size={36}
          strokeWidth={3}
        />
        <div className="flex flex-col ml-2">
          <span className="text-xs text-default-500">
            {timeRemaining}s
          </span>
        </div>
      </div>
      
      <div className="flex-1 text-center">
        {error ? (
          <div className="flex items-center justify-center text-danger">
            <AlertCircle size={16} className="mr-2" />
            <span>Error</span>
          </div>
        ) : (
          <motion.span 
            key={code}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-3xl tracking-wider py-1 px-2 rounded-md bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10"
          >
            {formattedCode}
          </motion.span>
        )}
      </div>
      
      <Tooltip content="Copy code">
        <Button
          isIconOnly
          variant="light"
          onClick={(e) => {
            e.preventDefault();
            if (!error) {
              try {
                const freshCode = TOTPService.generateCode(token);
                if (window.electronAPI) {
                  window.electronAPI.writeToClipboard(freshCode);
                } else {
                  navigator.clipboard.writeText(freshCode).catch(err => {
                    console.error('Browser clipboard API failed:', err);
                  });
                }
              } catch (err) {
                console.error('Error copying code:', err);
              }
            }
          }}
          disabled={error}
          className="bg-default-100/50 dark:bg-default-200/10 hover:bg-default-200/50 dark:hover:bg-default-200/20"
          aria-label="Copy authentication code"
        >
          <Copy size={20} />
        </Button>
      </Tooltip>
    </div>
  );
};

export default function TokenList() {
  const router = useRouter();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [tokenCategories, setTokenCategories] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'name' | 'recent' | 'favorite'>('name');
  const [viewMode, setViewMode] = useState<'compact' | 'comfortable'>('comfortable');
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  
  useEffect(() => {
    async function loadTokens() {
      try {
        if (typeof window !== 'undefined' && window.electronAPI) {
          const loadedTokens = await window.electronAPI.getTokens();
          setTokens(loadedTokens);
          
          const savedFavorites = localStorage.getItem('favorites');
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
          }
          
          const savedCategories = localStorage.getItem('tokenCategories');
          if (savedCategories) {
            setTokenCategories(JSON.parse(savedCategories));
          }
          
          const savedViewMode = localStorage.getItem('viewMode');
          if (savedViewMode) {
            setViewMode(savedViewMode as 'compact' | 'comfortable');
          }
          
          const savedSortOption = localStorage.getItem('sortOption');
          if (savedSortOption) {
            setSortOption(savedSortOption as 'name' | 'recent' | 'favorite');
          }
        } else {
          const mockTokens: Token[] = [
            {
              id: '1',
              name: 'Google',
              issuer: 'Google',
              secret: 'JBSWY3DPEHPK3PXP',
              algorithm: 'SHA-1',
              digits: 6,
              period: 30,
              createdAt: Date.now() - 3600000
            },
            {
              id: '2',
              name: 'GitHub',
              issuer: 'GitHub',
              secret: 'JBSWY3DPEHPK3PXP',
              algorithm: 'SHA-256',
              digits: 6,
              period: 30,
              createdAt: Date.now() - 7200000
            },
            {
              id: '3',
              name: 'AWS',
              issuer: 'Amazon',
              secret: 'JBSWY3DPEHPK3PXP',
              algorithm: 'SHA-512',
              digits: 8,
              period: 60,
              createdAt: Date.now() - 1800000
            }
          ];
          setTokens(mockTokens);
          setTokenCategories({
            '1': 'personal',
            '2': 'work',
            '3': 'work'
          });
        }
      } catch (err) {
        console.error('Failed to load tokens', err);
        setError('Failed to load your authentication tokens');
      } finally {
        setLoading(false);
      }
    }
    
    loadTokens();
  }, []);
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const period = 30;
      return period - (now % period);
    };
    
    setTimeRemaining(calculateTimeRemaining());
    
    const intervalId = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const toggleFavorite = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const newFavorites = { ...favorites, [id]: !favorites[id] };
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    const element = document.getElementById(`favorite-btn-${id}`);
    if (element) {
      element.classList.add('scale-125');
      setTimeout(() => {
        element.classList.remove('scale-125');
      }, 200);
    }
  };
  
  const updateTokenCategory = (id: string, category: string) => {
    const newCategories = { ...tokenCategories, [id]: category };
    setTokenCategories(newCategories);
    localStorage.setItem('tokenCategories', JSON.stringify(newCategories));
  };
  
  const filteredTokens = useMemo(() => {
    let filtered = tokens;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(token => 
        token.name.toLowerCase().includes(query) || 
        (token.issuer && token.issuer.toLowerCase().includes(query))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(token => 
        tokenCategories[token.id] === selectedCategory
      );
    }
    
    return filtered;
  }, [tokens, searchQuery, selectedCategory, tokenCategories]);
  
  const categories = useMemo(() => {
    const cats = new Set(Object.values(tokenCategories));
    return ['all', ...Array.from(cats)];
  }, [tokenCategories]);
  
  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      if (sortOption === 'favorite') {
        if (favorites[a.id] && !favorites[b.id]) return -1;
        if (!favorites[a.id] && favorites[b.id]) return 1;
      }
      
      if (sortOption === 'recent') {
        return b.createdAt - a.createdAt;
      }
      
      return a.name.localeCompare(b.name);
    });
  }, [filteredTokens, favorites, sortOption]);
  
  const copyTokenCode = async (token: Token, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const code = TOTPService.generateCode(token);
      
      if (window.electronAPI) {
        await window.electronAPI.writeToClipboard(code);
      } else {
        await navigator.clipboard.writeText(code).catch(err => {
          console.error('Browser clipboard API failed:', err);
        });
      }
      
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
      
      const element = document.getElementById(`token-${token.id}`);
      if (element) {
        element.classList.add('bg-primary-50', 'dark:bg-primary-900/20');
        setTimeout(() => {
          element.classList.remove('bg-primary-50', 'dark:bg-primary-900/20');
        }, 300);
      }
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };
  
  const handleDeleteToken = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!confirm('Are you sure you want to delete this token?')) {
      return;
    }
    
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const updatedTokens = await window.electronAPI.deleteToken(id);
        setTokens(updatedTokens);
        
        const newCategories = { ...tokenCategories };
        delete newCategories[id];
        setTokenCategories(newCategories);
        localStorage.setItem('tokenCategories', JSON.stringify(newCategories));
      } else {
        setTokens(tokens.filter(t => t.id !== id));
        
        const newCategories = { ...tokenCategories };
        delete newCategories[id];
        setTokenCategories(newCategories);
        localStorage.setItem('tokenCategories', JSON.stringify(newCategories));
      }
    } catch (err) {
      console.error('Failed to delete token', err);
    }
  };
  
  const handleEditToken = (id: string) => {
    router.push(`/edit/${id}`);
  };
  
  const toggleViewMode = () => {
    const newMode = viewMode === 'comfortable' ? 'compact' : 'comfortable';
    setViewMode(newMode);
    localStorage.setItem('viewMode', newMode);
  };
  
  const updateSortOption = (option: 'name' | 'recent' | 'favorite') => {
    setSortOption(option);
    localStorage.setItem('sortOption', option);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <div className="flex flex-col items-center">
          <motion.div 
            className="h-12 w-12 border-3 border-primary rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-default-500">Loading your tokens...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <motion.div 
        className="p-6 dark:bg-danger-900/20 bg-danger-50 rounded-lg text-center border border-danger-200 dark:border-danger-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AlertCircle className="mx-auto mb-3 text-danger" size={32} />
        <p className="text-danger font-medium">{error}</p>
        <Button 
          color="primary" 
          className="mt-4"
          variant="flat"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </motion.div>
    );
  }
  
  if (tokens.length === 0) {
    return (
      <motion.div 
        className="p-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
        >
          <Key size={24} className="text-primary" />
        </motion.div>
        <h3 className="text-xl font-medium mb-2">No tokens found</h3>
        <p className="text-default-500 mb-6 max-w-md mx-auto">Add your first authentication token to get started with secure access.</p>
        <Button 
          color="primary"
          onClick={() => router.push('/add')}
          size="lg"
          className="font-medium shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          radius="sm"
          startContent={<Plus size={20} />}
        >
          Add Your First Token
        </Button>
      </motion.div>
    );
  }
  
  return (
    <div className="space-y-4 pb-16 relative max-w-full overflow-x-hidden h-full flex flex-col">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg pt-2 pb-3 flex-shrink-0">
        <div className="mb-4 relative">
          <Input
            type="search"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search size={18} className="text-default-400" />}
            endContent={
              searchQuery && (
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </Button>
              )
            }
            classNames={{
              inputWrapper: "shadow-sm dark:bg-default-100/5 bg-default-50",
            }}
            radius="sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
            {categories.map(category => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "flat" : "light"}
                color={selectedCategory === category ? "primary" : "default"}
                className="capitalize whitespace-nowrap"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Tokens' : category}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-1">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  endContent={<ChevronDown size={16} />}
                >
                  {sortOption === 'name' ? 'A-Z' : 
                   sortOption === 'recent' ? 'Recent' : 'Favorites'}
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Sort options"
                onAction={(key) => updateSortOption(key as any)}
                selectedKeys={[sortOption]}
                selectionMode="single"
              >
                <DropdownItem key="name" startContent={<ArrowDownAZ size={16} />}>Alphabetical</DropdownItem>
                <DropdownItem key="recent" startContent={<Clock size={16} />}>Most Recent</DropdownItem>
                <DropdownItem key="favorite" startContent={<Star size={16} />}>Favorites First</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            
            <Button
              size="sm"
              variant="flat"
              isIconOnly
              onClick={toggleViewMode}
              aria-label={viewMode === 'comfortable' ? 'Switch to compact view' : 'Switch to comfortable view'}
            >
              {viewMode === 'comfortable' ? <LayoutList size={16} /> : <List size={16} />}
            </Button>
            
            <Button
              size="sm"
              variant="flat"
              isIconOnly
              onClick={() => setShowOptions(!showOptions)}
              aria-label="Settings"
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>
        
        {showOptions && (
          <motion.div 
            className="mb-4 p-3 rounded-lg bg-default-50 dark:bg-default-100/5 border border-default-200 dark:border-default-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="text-sm font-medium mb-2">Token Display Options</div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant={viewMode === 'comfortable' ? "flat" : "light"}
                color={viewMode === 'comfortable' ? "primary" : "default"}
                onClick={() => {
                  setViewMode('comfortable');
                  localStorage.setItem('viewMode', 'comfortable');
                }}
                startContent={<LayoutList size={16} />}
              >
                Comfortable
              </Button>
              <Button 
                size="sm"
                variant={viewMode === 'compact' ? "flat" : "light"}
                color={viewMode === 'compact' ? "primary" : "default"}
                onClick={() => {
                  setViewMode('compact');
                  localStorage.setItem('viewMode', 'compact');
                }}
                startContent={<List size={16} />}
              >
                Compact
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 w-full flex-grow overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AnimatePresence>
          {sortedTokens.map((token) => (
            <motion.div
              key={token.id}
              id={`token-${token.id}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              layout
              className="transition-colors duration-300"
            >
              <Card 
                className={`overflow-visible mb-2 border dark:border-default-100/10 ${viewMode === 'compact' ? 'py-2' : ''} h-full`}
                isPressable
                onPress={() => handleEditToken(token.id)}
                shadow="sm"
                radius="sm"
              >
                <div className={viewMode === 'compact' ? 'px-3 py-1' : 'p-4'}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Button
                        id={`favorite-btn-${token.id}`}
                        isIconOnly
                        variant="light"
                        onClick={(e) => toggleFavorite(token.id, e)}
                        className={`${favorites[token.id] ? "text-warning" : "text-default-400"} transition-transform duration-200`}
                        size={viewMode === 'compact' ? 'sm' : 'md'}
                        aria-label={favorites[token.id] ? "Remove from favorites" : "Add to favorites"}
                      >
                        {favorites[token.id] ? <Star size={viewMode === 'compact' ? 16 : 20} fill="currentColor" /> : <StarOff size={viewMode === 'compact' ? 16 : 20} />}
                      </Button>
                      
                      <div>
                        <h3 className={`${viewMode === 'compact' ? 'text-sm' : 'text-md'} font-semibold flex items-center gap-2`}>
                          {token.name}
                          {tokenCategories[token.id] && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-default-100 dark:bg-default-50/10 text-default-600 dark:text-default-400 capitalize">
                              {tokenCategories[token.id]}
                            </span>
                          )}
                        </h3>
                        {token.issuer && viewMode !== 'compact' && (
                          <p className="text-sm text-default-500">{token.issuer}</p>
                        )}
                      </div>
                    </div>
                    
                    <Dropdown>
                      <DropdownTrigger>
                        <div 
                          className={`cursor-pointer p-1 rounded-full text-default-400 hover:text-default-600 hover:bg-default-100 dark:hover:bg-default-100/10 transition-colors`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical size={viewMode === 'compact' ? 16 : 20} />
                        </div>
                      </DropdownTrigger>
                      <DropdownMenu 
                        aria-label="Token actions"
                        onAction={(key) => {
                          if (key === 'edit') handleEditToken(token.id);
                          if (key === 'delete') handleDeleteToken(token.id);
                          if (key === 'copy') copyTokenCode(token);
                          if (key.toString().startsWith('category-')) {
                            const category = key.toString().split('-')[1];
                            updateTokenCategory(token.id, category);
                          }
                        }}
                      >
                        <DropdownItem
                          key="copy"
                          startContent={<Copy size={16} />}
                        >
                          Copy Code
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<Edit size={16} />}
                        >
                          Edit
                        </DropdownItem>
                        
                        <DropdownSection title="Category">
                          <>
                          {['personal', 'work', 'finance', 'social'].map(category => (
                            <DropdownItem 
                              key={`category-${category}`}
                              startContent={
                                <span className="w-2 h-2 rounded-full bg-primary mr-1"></span>
                              }
                              endContent={
                                tokenCategories[token.id] === category && (
                                  <Check size={14} className="text-primary" />
                                )
                              }
                            >
                              <span className="capitalize">{category}</span>
                            </DropdownItem>
                          ))}
                          <DropdownItem
                            key="category-other"
                            startContent={
                              <span className="w-2 h-2 rounded-full bg-default-400 mr-1"></span>
                            }
                            endContent={
                              tokenCategories[token.id] === 'other' && (
                                <Check size={14} className="text-primary" />
                              )
                            }
                          >
                            Other
                          </DropdownItem>
                          </>
                        </DropdownSection>
                        
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Trash size={16} />}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  
                  <div className={`mt-1 ${viewMode === 'compact' ? 'mb-0' : 'mb-1'} relative`}>
                    <TokenCode token={token} timeRemaining={timeRemaining} />
                  </div>
                  
                  {viewMode !== 'compact' && (
                    <div className="mt-3 flex gap-2 text-xs text-default-400">
                      {token.algorithm !== 'SHA-1' && (
                        <span className="bg-default-100 dark:bg-default-50/10 px-2 py-1 rounded-full">
                          {token.algorithm}
                        </span>
                      )}
                      {token.digits !== 6 && (
                        <span className="bg-default-100 dark:bg-default-50/10 px-2 py-1 rounded-full">
                          {token.digits} digits
                        </span>
                      )}
                      {token.period !== 30 && (
                        <span className="bg-default-100 dark:bg-default-50/10 px-2 py-1 rounded-full">
                          {token.period}s
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      <motion.div 
        className="fixed bottom-4 right-4 z-20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          color="primary" 
          size="lg"
          className="shadow-lg h-14 w-14 rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-200 backdrop-blur-lg"
          onClick={() => router.push('/add')}
          aria-label="Add new token"
        >
          <Plus size={24} />
        </Button>
      </motion.div>
      
      {/* Floating action button for category filter */}
      <motion.div 
        className="fixed bottom-4 left-4 z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Dropdown placement="top-start">
          <DropdownTrigger>
            <Button
              color="default"
              variant="flat"
              className="h-10 w-10 rounded-full shadow-md bg-background/80 backdrop-blur-lg"
              isIconOnly
              aria-label="Filter options"
            >
              <Filter size={18} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownSection title="View Options">
              <DropdownItem
                key="sortAZ"
                startContent={<ArrowDownAZ size={16} />}
                endContent={sortOption === 'name' && <Check size={14} />}
                onPress={() => updateSortOption('name')}
              >
                Sort A-Z
              </DropdownItem>
              <DropdownItem
                key="sortRecent"
                startContent={<Clock size={16} />}
                endContent={sortOption === 'recent' && <Check size={14} />}
                onPress={() => updateSortOption('recent')}
              >
                Sort by Recent
              </DropdownItem>
              <DropdownItem
                key="sortFavorite"
                startContent={<Star size={16} />}
                endContent={sortOption === 'favorite' && <Check size={14} />}
                onPress={() => updateSortOption('favorite')}
              >
                Favorites First
              </DropdownItem>
            </DropdownSection>
            <DropdownSection title="Layout">
              <DropdownItem
                key="comfortView"
                startContent={<LayoutList size={16} />}
                endContent={viewMode === 'comfortable' && <Check size={14} />}
                onPress={() => {
                  setViewMode('comfortable');
                  localStorage.setItem('viewMode', 'comfortable');
                }}
              >
                Comfortable View
              </DropdownItem>
              <DropdownItem
                key="compactView"
                startContent={<List size={16} />}
                endContent={viewMode === 'compact' && <Check size={14} />}
                onPress={() => {
                  setViewMode('compact');
                  localStorage.setItem('viewMode', 'compact');
                }}
              >
                Compact View
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </motion.div>
      
      {/* Copied to clipboard toast */}
      <AnimatePresence>
        {showCopiedToast && (
          <motion.div
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-default-800 dark:bg-default-50 text-white dark:text-default-900 px-4 py-2 rounded-xl shadow-lg z-50 flex items-center gap-2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <Check size={16} />
            <span className="text-sm font-medium">Code copied to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}