'use client';

import { useEffect, useState, useMemo } from 'react';
import { TOTPService } from '../../core/auth/totpService';
import { Token } from '../../shared/types';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  period: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircularProgress({
  period = 30,
  size = 28,
  strokeWidth = 3
}: CircularProgressProps) {
  const getDummyToken = (period: number): Token => ({
    id: 'timer',
    name: 'timer',
    secret: 'dummy',
    period,
    createdAt: Date.now()
  });
  
  const [timeRemaining, setTimeRemaining] = useState(
    TOTPService.getTimeRemaining(getDummyToken(period))
  );
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (timeRemaining / period) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const getColor = useMemo(() => {
    if (timeRemaining <= 5) return {
      stroke: 'url(#dangerGradient)',
      text: '#f31260'
    };
    if (timeRemaining <= 10) return {
      stroke: 'url(#warningGradient)',
      text: '#f5a524'
    };
    return {
      stroke: 'url(#primaryGradient)',
      text: '#0070f0'
    };
  }, [timeRemaining]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(TOTPService.getTimeRemaining(getDummyToken(period)));
    }, 1000);

    return () => clearInterval(interval);
  }, [period]);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0070f0" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f5a524" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
          <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f31260" />
            <stop offset="100%" stopColor="#ff6b93" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-default-200 dark:text-default-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </svg>
      
      {/* Time remaining text */}
      <motion.span 
        className="absolute text-[10px] font-medium"
        style={{ color: getColor.text }}
        initial={{ scale: 0.8 }}
        animate={{ 
          scale: timeRemaining <= 5 ? [0.8, 1.2, 0.8] : 1,
        }}
        transition={{ 
          duration: timeRemaining <= 5 ? 1 : 0.3,
          repeat: timeRemaining <= 5 ? Infinity : 0
        }}
      >
        {timeRemaining}
      </motion.span>
    </div>
  );
}