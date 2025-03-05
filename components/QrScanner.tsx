'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CameraIcon, XIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QrScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
  autoStart?: boolean;
}

export function QrScanner({ onScan, onError, className, autoStart = true }: QrScannerProps) {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<number>(0);
  const scannerDivId = "qr-reader";
  
  // Initialize scanner on component mount
  useEffect(() => {
    let html5QrCode: Html5Qrcode;
    try {
      html5QrCode = new Html5Qrcode(scannerDivId);
      setScanner(html5QrCode);
    } catch (err: any) {
      console.error('Error initializing scanner:', err);
      setError('Failed to initialize QR scanner. Please refresh the page.');
      return;
    }

    // Get available cameras with retry
    const initCameras = async (retryCount = 0) => {
      try {
        // Check for camera permissions
        try {
          const permissions = await navigator.permissions.query({ name: 'camera' as any });
          console.log('Camera permission state:', permissions.state);
          
          if (permissions.state === 'denied') {
            setCameraPermissionDenied(true);
            setError('Camera permission denied by browser. Check your browser settings.');
            return;
          }
        } catch (permError) {
          console.log('Permission API not supported, will try direct camera access');
        }
        
        // Try to get cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          // No cameras detected, try again if we haven't retried too many times
          if (retryCount < 3) {
            setTimeout(() => initCameras(retryCount + 1), 1000);
            return;
          }
          setError('No cameras detected on your device.');
          return;
        }

        const cameras = videoDevices.map(device => ({
          id: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 4)}`
        }));
        
        setAvailableCameras(cameras);
        
        // After getting cameras list, add a small delay before starting the scanner
        // This helps in some browsers where immediate camera access after enumeration can fail
        if (cameras.length > 0) {
          const backCamera = cameras.find(camera => 
            camera.label.toLowerCase().includes('back') || 
            camera.label.toLowerCase().includes('rear')
          );
          
          const cameraToUse = backCamera || cameras[0];
          setSelectedCamera(cameraToUse.id);
          
          if (autoStart) {
            // Add a small delay to allow camera resources to be released
            setTimeout(() => {
              startScanner(cameraToUse.id, html5QrCode).catch(err => {
                console.error('Failed to start scanner with first camera, trying another one', err);
                
                // If first camera fails, try another camera if available
                if (cameras.length > 1) {
                  const alternateCamera = cameras.find(cam => cam.id !== cameraToUse.id);
                  if (alternateCamera) {
                    setTimeout(() => {
                      startScanner(alternateCamera.id, html5QrCode).catch(err2 => {
                        console.error('Failed to start scanner with alternate camera', err2);
                        setError('Could not access camera. Please check permissions and try again.');
                      });
                    }, 500);
                  }
                }
              });
            }, 300);
          }
        }
      } catch (err: any) {
        console.error('Error getting cameras', err);
        
        if (err.name === 'NotAllowedError' || (err.message && err.message.includes('Permission'))) {
          setCameraPermissionDenied(true);
          setError('Camera permission denied. Please allow camera access in your browser settings.');
        } else {
          setError(`Error accessing camera: ${err.message || err}`);
        }
        
        if (onError) onError(err.toString());
      }
    };

    // Start camera initialization
    initCameras();
    
    // Cleanup on unmount
    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(err => console.error('Error stopping scanner', err));
      }
    };
  }, [autoStart, onError]);

  const startScanner = async (cameraId: string, scannerInstance = scanner) => {
    if (!scannerInstance) {
      setError('Scanner not initialized');
      return;
    }
    
    try {
      // First make sure any existing scanning is stopped
      if (scannerInstance.isScanning) {
        await scannerInstance.stop();
      }
      
      setIsScanning(true);
      setError(null);

      // Try starting the scanner with additional error handling
      await scannerInstance.start(
        cameraId, 
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          console.log('QR code detected:', decodedText);
          onScan(decodedText);
          // We don't stop scanning so it can continue to detect new codes
        },
        (errorMessage) => {
          // QR code scan error (not critical, just means no QR found in this frame)
          // We don't need to show these frequent errors to the user
        }
      );
    } catch (err: any) {
      setIsScanning(false);
      console.error('Error starting scanner:', err);
      
      if (err.name === 'NotAllowedError' || 
          (err.message && (
            err.message.includes('Permission') || 
            err.message.includes('denied')
          ))) {
        setCameraPermissionDenied(true);
        setError('Camera permission denied. Please allow camera access.');
      } else if (err.name === 'NotReadableError' || 
                (err.message && err.message.includes('Could not start video source'))) {
        setError(`Camera is in use or not available. Please close other apps using your camera and try again.`);
      } else {
        setError(`Failed to start scanner: ${err.message || err.toString()}`);
      }
      
      if (onError) onError(err.toString());
    }
  };

  const stopScanner = async () => {
    if (scanner && scanner.isScanning) {
      try {
        await scanner.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner', err);
        setError('Failed to stop scanner');
      }
    }
  };

  const toggleScanner = () => {
    if (isScanning) {
      stopScanner();
    } else if (selectedCamera) {
      startScanner(selectedCamera);
    }
  };

  const switchCamera = async (cameraId: string) => {
    try {
      if (scanner && isScanning) {
        await stopScanner();
      }
      setSelectedCamera(cameraId);
      if (scanner) {
        await startScanner(cameraId);
      }
    } catch (err: any) {
      console.error('Error switching camera:', err);
      setError(`Failed to switch camera: ${err.message || err}`);
    }
  };

  const requestCameraPermission = async () => {
    try {
      console.log('Requesting camera permission...');
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      setCameraPermissionDenied(false);
      setError(null);
      
      // After getting permission, re-initialize camera list
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setError('No cameras found on your device');
        return;
      }
      
      const cameras = videoDevices.map(device => ({
        id: device.deviceId,
        label: device.label || `Camera ${device.deviceId.slice(0, 4)}`
      }));
      
      setAvailableCameras(cameras);
      
      if (cameras.length > 0) {
        // Prefer back camera for QR scanning
        const backCamera = cameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear')
        );
        
        const cameraToUse = backCamera || cameras[0];
        setSelectedCamera(cameraToUse.id);
        
        if (scanner) {
          console.log('Starting scanner with camera:', cameraToUse.label);
          await startScanner(cameraToUse.id);
        }
      }
    } catch (err: any) {
      console.error("Failed to get camera permission", err);
      setCameraPermissionDenied(true);
      setError("Camera permission denied. Please check your browser settings.");
      if (onError) onError("Camera permission denied. Please allow camera access in your browser settings.");
    }
  };

  // Reset error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Card className={`overflow-hidden ${className || ''}`}>
      <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CameraIcon className="h-4 w-4 text-blue-600" />
          <h3 className="font-medium text-sm text-blue-700">QR Scanner</h3>
        </div>
        <div className="flex items-center gap-2">
          {isScanning && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={toggleScanner}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
          {!isScanning && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => selectedCamera && startScanner(selectedCamera)}
              disabled={!selectedCamera}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        {error && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {cameraPermissionDenied ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-4">Camera access is required to scan QR codes</p>
            <Button onClick={requestCameraPermission}>
              Grant Camera Permission
            </Button>
          </div>
        ) : (
          <>
            {/* QR Scanner Viewport */}
            <div 
              id={scannerDivId} 
              className="w-full aspect-square max-w-[350px] mx-auto rounded-lg overflow-hidden bg-gray-100"
            ></div>
            
            {/* Camera Controls - Fixed camera selection rendering */}
            {availableCameras.length > 1 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  {error?.includes('Could not start video source') ? 
                    'Try a different camera:' : 'Select Camera:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableCameras.map((camera) => (
                    <Button
                      key={camera.id}
                      variant={selectedCamera === camera.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => switchCamera(camera.id)}
                      className="text-xs"
                    >
                      {camera.label || `Camera ${camera.id.slice(0, 5)}`}
                    </Button>
                  ))}
                </div>
                {error && (
                  <Button 
                    onClick={requestCameraPermission} 
                    variant="outline" 
                    size="sm"
                    className="mt-2 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                  >
                    <RefreshCw className="mr-2 h-3 w-3" /> Retry Camera Access
                  </Button>
                )}
              </div>
            )}
            
            {/* Scanner Controls */}
            <div className="flex justify-center mt-4">
              <Button 
                onClick={toggleScanner}
                variant={isScanning ? "destructive" : "default"}
                className={isScanning ? "bg-red-600" : ""}
                disabled={!selectedCamera}
              >
                {isScanning ? "Stop Scanning" : "Start Scanning"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
