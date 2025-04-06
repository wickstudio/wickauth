'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Select, SelectItem, Button, Card, CardBody, CardHeader, CardFooter, Divider, Tooltip, Tabs, Tab } from '@nextui-org/react';
import { ArrowLeft, Save, QrCode, Upload, AlertCircle, Camera, Lock, Minimize, X } from 'lucide-react';
import { TOTPService } from '../../core/auth/totpService';
import { TokenStorage } from '../../core/storage/tokenStorage';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { Token } from '../../shared/types';

export default function AddToken() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    secret: '',
    issuer: '',
    algorithm: 'SHA-1',
    digits: '6',
    period: '30'
  });
  const [selectedTab, setSelectedTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrScanActive, setQrScanActive] = useState(false);

  function handleChange(key: string, value: string) {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (error) setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
      try {
        const secret = formData.secret.replace(/\s+/g, '').toUpperCase();
        const algorithm = formData.algorithm as 'SHA-1' | 'SHA-256' | 'SHA-512';
        const digits = parseInt(formData.digits);
        const period = parseInt(formData.period);
        
        const testToken: Token = {
          id: 'test',
          name: 'test',
          secret,
          algorithm,
          digits,
          period,
          createdAt: Date.now()
        };
        
        const testCode = await TOTPService.generateCode(testToken);
        
        if (!testCode) {
          throw new Error('Invalid secret');
        }
      } catch (err) {
        setError('Invalid secret key. Please check and try again.');
        setLoading(false);
        return;
      }
      
      const newToken: Token = {
        id: uuidv4(),
        name: formData.name,
        secret: formData.secret.replace(/\s+/g, '').toUpperCase(),
        issuer: formData.issuer || undefined,
        algorithm: formData.algorithm as 'SHA-1' | 'SHA-256' | 'SHA-512',
        digits: parseInt(formData.digits),
        period: parseInt(formData.period),
        createdAt: Date.now()
      };
      
      await TokenStorage.addToken(newToken);
      
      router.push('/');
    } catch (error) {
      console.error('Failed to add token', error);
      setError('Failed to add token. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    router.push('/');
  }

  async function handleScanQR() {
    setQrScanActive(true);
    setError('');
    
    try {
      if (typeof window !== 'undefined' && window.electronAPI?.scanQRCode) {
        const result = await window.electronAPI.scanQRCode();
        
        if (result && result.uri) {
          parseOtpAuthUri(result.uri);
        }
      } else {
        setTimeout(() => {
          parseOtpAuthUri('otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example&algorithm=SHA1&digits=6&period=30');
          setQrScanActive(false);
        }, 2000);
      }
    } catch (error) {
      console.error('QR scan failed', error);
      setError('Failed to scan QR code. Please try again or enter details manually.');
      setQrScanActive(false);
    }
  }
  
  function parseOtpAuthUri(uri: string) {
    try {
      const url = new URL(uri);
      
      if (url.protocol !== 'otpauth:') {
        throw new Error('Invalid URI protocol');
      }
      
      const pathParts = url.pathname.substring(2).split(':');
      
      const params = new URLSearchParams(url.search);
      const secret = params.get('secret');
      const issuer = params.get('issuer') || (pathParts[0] || '');
      const name = pathParts.length > 1 ? pathParts[1] : pathParts[0];
      
      let algorithm = 'SHA-1';
      if (params.get('algorithm')) {
        const alg = params.get('algorithm')?.toUpperCase();
        if (alg === 'SHA1' || alg === 'SHA-1') algorithm = 'SHA-1';
        if (alg === 'SHA256' || alg === 'SHA-256') algorithm = 'SHA-256';
        if (alg === 'SHA512' || alg === 'SHA-512') algorithm = 'SHA-512';
      }
      
      const digits = params.get('digits') || '6';
      const period = params.get('period') || '30';
      
      if (!secret) {
        throw new Error('No secret found in QR code');
      }
      
      setFormData({
        name: name || '',
        secret: secret,
        issuer: issuer,
        algorithm: algorithm,
        digits: digits,
        period: period
      });
      
      setSelectedTab('manual');
    } catch (error) {
      console.error('Failed to parse OTP URI', error);
      setError('Invalid QR code format. Please try again or enter details manually.');
    } finally {
      setQrScanActive(false);
    }
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
          >
            <Minimize size={16} />
          </Button>
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onClick={() => window.electronAPI?.closeWindow()}
            className="text-danger hover:bg-danger/20 rounded-full"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      
      <Card className="shadow-xl border dark:border-default-100/10">
        <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Add New Token</h1>
          <p className="text-default-500 text-sm">Add a new authentication token to your account</p>
        </CardHeader>
        
        <CardBody className="px-6 py-5">
          <Tabs 
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            className="mb-6"
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative mb-2",
              cursor: "w-full bg-gradient-to-r from-primary to-secondary h-[2px]",
              tab: "max-w-fit px-0 h-12 data-[hover=true]:text-default-500",
              tabContent: "group-data-[selected=true]:text-primary font-medium"
            }}
          >
            <Tab 
              key="manual" 
              title={
                <div className="flex items-center gap-2">
                  <Upload size={18} />
                  <span>Manual Entry</span>
                </div>
              }
            />
            <Tab 
              key="scan" 
              title={
                <div className="flex items-center gap-2">
                  <QrCode size={18} />
                  <span>Scan QR Code</span>
                </div>
              }
            />
          </Tabs>
          
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
        
          {selectedTab === 'manual' ? (
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
                    label: "text-default-700 dark:text-default-400 font-medium",
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
                >
                  Add Token
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
              {qrScanActive ? (
                <motion.div 
                  className="w-72 h-72 dark:bg-default-200/5 bg-default-100 rounded-lg border-2 border-dashed border-default-300 dark:border-default-600 flex items-center justify-center overflow-hidden relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="absolute w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera size={40} className="mx-auto mb-2 text-primary" />
                    </div>
                  </div>
                  <motion.div 
                    className="absolute w-full h-1 bg-gradient-to-r from-primary to-secondary top-0 left-0"
                    animate={{ 
                      y: ['0%', '100%', '0%'], 
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      y: { duration: 2, repeat: Infinity, ease: "linear" },
                      opacity: { duration: 2, repeat: Infinity, ease: "linear" }
                    }}
                  />
                  <div className="relative z-10 text-center">
                    <p className="mt-14 text-md font-medium text-primary">Scanning...</p>
                    <p className="text-sm text-default-500 mt-1">Align QR code within frame</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="w-72 h-72 dark:bg-default-200/5 bg-default-100 rounded-lg border-2 border-dashed border-default-300 dark:border-default-600 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ boxShadow: "0 0 15px rgba(0,112,243,0.2)" }}
                >
                  <div className="text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-3 rounded-full bg-primary/10 mb-3">
                        <QrCode size={40} className="text-primary" />
                      </div>
                      <p className="text-md font-medium">Scan QR Code</p>
                      <p className="text-sm text-default-500 mt-1 max-w-[200px]">
                        Position the QR code within the camera view
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <Button
                color="primary"
                onClick={handleScanQR}
                fullWidth
                isLoading={qrScanActive}
                startContent={!qrScanActive && <QrCode size={18} />}
                size="lg"
                className="font-medium max-w-xs shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                radius="sm"
              >
                {qrScanActive ? 'Scanning...' : 'Scan QR Code'}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
} 