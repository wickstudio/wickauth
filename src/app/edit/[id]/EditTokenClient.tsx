'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Select, SelectItem, Button, Card, CardBody, CardHeader, CardFooter, Divider, Tooltip } from '@nextui-org/react';
import { ArrowLeft, Save, Key, AlertCircle, Lock, Minimize, X } from 'lucide-react';
import { TOTPService } from '../../../core/auth/totpService';
import { TokenStorage } from '../../../core/storage/tokenStorage';
import { motion } from 'framer-motion';

export default function EditTokenClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    secret: '',
    issuer: '',
    algorithm: 'SHA-1',
    digits: '6',
    period: '30',
    createdAt: 0
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadToken() {
      try {
        if (typeof window !== 'undefined' && window.electronAPI) {
          const tokens = await window.electronAPI.getTokens();
          const token = tokens.find(t => t.id === params.id);
          
          if (token) {
            setFormData({
              id: token.id,
              name: token.name,
              secret: token.secret,
              issuer: token.issuer || '',
              algorithm: token.algorithm || 'SHA-1',
              digits: String(token.digits || 6),
              period: String(token.period || 30),
              createdAt: token.createdAt
            });
          } else {
            setError('Token not found');
          }
        } else {
          setError('Unable to load token in development mode');
        }
      } catch (error) {
        console.error('Failed to load token', error);
        setError('Failed to load token. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    }

    loadToken();
  }, [params.id]);

  function handleChange(key: string, value: string) {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (error) setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Token name is required');
      return;
    }
    
    if (!formData.secret.trim()) {
      setError('Secret key is required');
      return;
    }
    
    setLoading(true);
    
    try {
      await TokenStorage.updateToken({
        id: formData.id,
        name: formData.name,
        secret: formData.secret.replace(/\s+/g, '').toUpperCase(),
        issuer: formData.issuer || undefined,
        algorithm: formData.algorithm as 'SHA-1' | 'SHA-256' | 'SHA-512',
        digits: parseInt(formData.digits),
        period: parseInt(formData.period),
        createdAt: formData.createdAt
      });
      
      router.push('/');
    } catch (error) {
      console.error('Failed to update token', error);
      setError('Failed to update token. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    router.push('/');
  }

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-6 max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="app-drag py-1 mb-3 flex items-center justify-between">
        <Button
          variant="light"
          startContent={<ArrowLeft size={16} />}
          className="app-no-drag hover:bg-default-100/50 dark:hover:bg-default-100/10"
          size="sm"
          onClick={handleBack}
          aria-label="Go back"
        >
          Back
        </Button>
        
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
            onClick={() => window.electronAPI?.closeWindow()}
            className="text-danger hover:bg-danger/20 rounded-full"
            aria-label="Close window"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      
      <Card className="shadow-xl border dark:border-default-100/10">
        <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Edit Token</h1>
          <p className="text-default-500 text-sm">Update your authentication token</p>
        </CardHeader>
        
        <CardBody className="px-6 py-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 bg-danger-50 dark:bg-danger-900/20 text-danger rounded-lg flex items-center gap-2 border border-danger-200 dark:border-danger-800"
            >
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}
        
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-default-700 dark:text-default-400">
                Token Name <span className="text-danger">*</span>
              </label>
              <Input
                placeholder="e.g. Google, GitHub, Microsoft"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                variant="bordered"
                isRequired
                isClearable
                autoFocus
                radius="sm"
                classNames={{
                  inputWrapper: "shadow-sm group-data-[focus=true]:ring-2 ring-primary/20 dark:bg-default-100/5 bg-default-50",
                }}
                startContent={
                  <div className="text-default-400 pointer-events-none">
                    <Lock size={16} />
                  </div>
                }
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-default-700 dark:text-default-400">
                Issuer (Optional)
              </label>
              <Input
                placeholder="e.g. Company or Service Name"
                value={formData.issuer}
                onChange={(e) => handleChange('issuer', e.target.value)}
                variant="bordered"
                isClearable
                radius="sm"
                classNames={{
                  inputWrapper: "shadow-sm group-data-[focus=true]:ring-2 ring-primary/20 dark:bg-default-100/5 bg-default-50",
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-default-700 dark:text-default-400">
                Secret Key <span className="text-danger">*</span>
              </label>
              <Input
                placeholder="Base32 encoded secret"
                value={formData.secret}
                onChange={(e) => handleChange('secret', e.target.value)}
                variant="bordered"
                isRequired
                className="font-mono"
                radius="sm"
                classNames={{
                  inputWrapper: "shadow-sm group-data-[focus=true]:ring-2 ring-primary/20 dark:bg-default-100/5 bg-default-50",
                  input: "font-mono tracking-wide"
                }}
              />
            </div>
            
            <Divider className="my-3 opacity-50" />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-default-700 dark:text-default-400">
                  Algorithm
                </label>
                <Select
                  value={formData.algorithm}
                  onChange={(e) => handleChange('algorithm', e.target.value)}
                  variant="bordered"
                  radius="sm"
                  classNames={{
                    trigger: "shadow-sm dark:bg-default-100/5 bg-default-50",
                  }}
                  popoverProps={{
                    classNames: {
                      content: "dark:bg-default-100/80 backdrop-blur-lg"
                    }
                  }}
                >
                  <SelectItem key="SHA-1" value="SHA-1">SHA-1</SelectItem>
                  <SelectItem key="SHA-256" value="SHA-256">SHA-256</SelectItem>
                  <SelectItem key="SHA-512" value="SHA-512">SHA-512</SelectItem>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-default-700 dark:text-default-400">
                  Digits
                </label>
                <Select
                  value={formData.digits}
                  onChange={(e) => handleChange('digits', e.target.value)}
                  variant="bordered"
                  radius="sm"
                  classNames={{
                    trigger: "shadow-sm dark:bg-default-100/5 bg-default-50",
                  }}
                  popoverProps={{
                    classNames: {
                      content: "dark:bg-default-100/80 backdrop-blur-lg"
                    }
                  }}
                >
                  <SelectItem key="6" value="6">6 digits</SelectItem>
                  <SelectItem key="8" value="8">8 digits</SelectItem>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-default-700 dark:text-default-400">
                  Period
                </label>
                <Select
                  value={formData.period}
                  onChange={(e) => handleChange('period', e.target.value)}
                  variant="bordered"
                  radius="sm"
                  classNames={{
                    trigger: "shadow-sm dark:bg-default-100/5 bg-default-50",
                  }}
                  popoverProps={{
                    classNames: {
                      content: "dark:bg-default-100/80 backdrop-blur-lg"
                    }
                  }}
                >
                  <SelectItem key="30" value="30">30 seconds</SelectItem>
                  <SelectItem key="60" value="60">60 seconds</SelectItem>
                </Select>
              </div>
            </div>
            
            <div className="pt-4 flex flex-col gap-2">
              <Button
                color="primary"
                type="submit"
                fullWidth
                isLoading={loading}
                startContent={!loading && <Save size={18} />}
                size="lg"
                className="font-medium shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                radius="sm"
                aria-label="Save token changes"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
} 