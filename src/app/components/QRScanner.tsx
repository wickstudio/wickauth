'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader } from '@nextui-org/react';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onCancel: () => void;
}

export default function QRScanner({ onScan, onCancel }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {    
    let stream: MediaStream | null = null;
    
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setScanning(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please make sure you have granted camera permissions.');
      }
    }
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  function simulateScan() {
    const mockQrData = 'otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example&algorithm=SHA1&digits=6&period=30';
    onScan(mockQrData);
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center pb-0">
        <h3 className="text-lg font-medium">Scan QR Code</h3>
        <Button isIconOnly variant="light" onClick={onCancel}>
          <X size={20} />
        </Button>
      </CardHeader>
      
      <CardBody>
        {error ? (
          <div className="text-center py-8">
            <p className="text-danger mb-4">{error}</p>
            <Button color="primary" onClick={onCancel}>
              Back to Manual Entry
            </Button>
          </div>
        ) : (
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2/3 h-2/3 border-2 border-primary rounded-lg relative">
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-primary" />
              </div>
            </div>
            
            {scanning && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Scanning...
              </div>
            )}
          </div>
        )}
      </CardBody>
      
      <CardFooter className="flex justify-between">
        <Button color="danger" variant="light" onClick={onCancel}>
          Cancel
        </Button>
        {/* This button is for demonstration only */}
        <Button color="primary" onClick={simulateScan}>
          Simulate Scan
        </Button>
      </CardFooter>
    </Card>
  );
} 