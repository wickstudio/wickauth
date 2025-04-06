'use client';

import { useEffect, useState } from 'react';
import { Token } from '../../shared/types';
import { TOTPService } from '../../core/auth/totpService';
import { motion } from 'framer-motion';

interface TokenCodeProps {
  token: Token;
}

export default function TokenCode({ token }: TokenCodeProps) {
  const [code, setCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  useEffect(() => {
    generateCode();
    
    const dummyToken: Token = {
      id: 'timer',
      name: 'timer',
      secret: 'dummy',
      period: token.period,
      createdAt: Date.now()
    };
    
    setTimeRemaining(TOTPService.getTimeRemaining(dummyToken));
    
    const intervalId = setInterval(() => {
      const remaining = TOTPService.getTimeRemaining(dummyToken);
      setTimeRemaining(remaining);
      
      if (remaining === (token.period || 30)) {
        generateCode();
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [token]);
  
  function generateCode() {
    const newCode = TOTPService.generateCode(token);
    setCode(newCode);
  }
  
  const formatCode = (code: string) => {
    if (!code) return [];
    
    const digits = token.digits || 6;
    
    const segments = digits === 6 
      ? [code.substring(0, 3), code.substring(3, 6)]
      : [code.substring(0, 4), code.substring(4, 8)];
      
    return segments;
  };
  
  const segments = formatCode(code);
  
  const containerVariants = {
    new: { opacity: 1 },
    old: { opacity: 0.6 },
  };

  return (
    <motion.div 
      className="flex items-center justify-center rounded-xl bg-default-50 dark:bg-default-900/40 py-2 px-3"
      variants={containerVariants}
      initial="old"
      animate="new"
      key={code}
    >
      {segments.map((segment, index) => (
        <div 
          key={`${index}-${segment}`} 
          className={`font-mono text-2xl font-bold ${index > 0 ? 'ml-2' : ''}`}
        >
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {segment}
          </motion.span>
        </div>
      ))}
    </motion.div>
  );
}