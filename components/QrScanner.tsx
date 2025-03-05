'use client';

import { useState, useEffect, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CameraIcon, XIcon, RefreshCw, AlertTriangle, FlipHorizontal, SwitchCamera } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QrScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
  autoStart?: boolean;
}

interface DetectedBarcode {
  boundingBox: any;
  cornerPoints: any[];
  format: string;
  rawValue: string;
}

// Interface for camera device
interface CameraDevice {
  deviceId: string;
  label: string;
}

export function QrScanner({ onScan, onError, className, autoStart = true }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(autoStart);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Add browser check right at the beginning
  const isBrowser = typeof window !== 'undefined';
  
  // Camera management states
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isChangingCamera, setIsChangingCamera] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  
  // Refs for streams and components
  const currentStreamRef = useRef<MediaStream | null>(null);
  const scannerKey = useRef(0); // Used to force re-mount scanner component
  
  // Safe scanning state updater to avoid state updates during render
  const scanningStateRef = useRef(isScanning);
  const updateScanningState = (newState: boolean) => {
    scanningStateRef.current = newState;
    setIsScanning(newState);
  };
  
  // Add a constraints fallback mechanism
  const [constraintAttempts, setConstraintAttempts] = useState(0);
  const maxConstraintAttempts = 3;
  
  // Initialize on client-side only with better browser detection
  useEffect(() => {
    if (isBrowser) {
      setIsMounted(true);
      
      // Only run camera initialization if we're in a browser
      const initializeCamera = async () => {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as any });
          if (permissionStatus.state === 'denied') {
            setCameraPermissionDenied(true);
            setError('Camera permission denied. Please check browser settings.');
            return;
          }
          
          // Request access to camera with environment facing first (for better QR scanning)
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'environment' } 
            });
            setCameraFacingMode('environment');
            stopMediaTracks(stream); // Clean up the stream after getting permission
          } catch (err) {
            // If environment camera fails, try user camera (front)
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'user' } 
            });
            setCameraFacingMode('user');
            stopMediaTracks(stream); // Clean up the stream after getting permission
          }
          
          // Get list of available video devices
          await enumerateVideoDevices();
        } catch (err) {
          // Handle errors
          console.log('Camera initialization error:', err);
          // We'll try to handle later in the requestCameraPermission function
        }
      };

      initializeCamera().catch(console.error);
    }
    
    return () => {
      // Cleanup
      if (isBrowser) {
        setIsMounted(false);
        stopCurrentStream();
      }
    };
  }, [isBrowser]); // Add isBrowser as dependency

  // Helper function to stop all tracks in a media stream
  const stopMediaTracks = (stream?: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }
  };
  
  // Stop current stream
  const stopCurrentStream = () => {
    stopMediaTracks(currentStreamRef.current);
    currentStreamRef.current = null;
  };
  
  // Function to enumerate video devices
  const enumerateVideoDevices = async () => {
    try {
      // First get permission if needed to see device labels
      let stream: MediaStream | null = null;
      try {
        if (!navigator.mediaDevices.enumerateDevices) {
          throw new Error('enumerateDevices not supported');
        }
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        // Check if we can already see device labels (permission already granted)
        const hasLabels = devices.some(device => device.kind === 'videoinput' && device.label);
        
        if (!hasLabels) {
          // We need to request permission to see labels
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      } catch (err) {
        console.error('Error getting camera permissions:', err);
      }
      
      // Now enumerate all devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`
        }));
      
      // Clean up the temporary stream if we created one
      if (stream) {
        stopMediaTracks(stream);
      }
      
      if (videoDevices.length > 0) {
        setCameras(videoDevices);
        console.log('Available cameras:', videoDevices);
      } else {
        console.log('No cameras found');
      }
    } catch (err) {
      console.error('Error enumerating video devices:', err);
    }
  };

  // Simple function for direct camera toggle (front/back)
  const toggleCameraFacing = () => {
    if (cameras.length <= 1) {
      // If only one camera, try toggling facing mode instead
      const newFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
      setCameraFacingMode(newFacingMode);
      forceReloadScanner();
      return;
    }
    
    // Otherwise, switch to the next available camera
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    switchToCamera(nextIndex);
  };

  // Function to switch to a specific camera by index
  const switchToCamera = async (index: number) => {
    try {
      if (cameras.length <= 1) return;
      if (index === currentCameraIndex) return;
      
      setIsChangingCamera(true);
      updateScanningState(false);
      
      // Stop current stream
      stopCurrentStream();
      
      // Update the camera index
      setCurrentCameraIndex(index);
      
      // Force Scanner component to remount
      forceReloadScanner();
      
      // Resume scanning after a delay
      setTimeout(() => {
        setIsChangingCamera(false);
        updateScanningState(true);
      }, 800);
    } catch (err) {
      console.error('Error switching camera:', err);
      setError('Failed to switch camera. Please try again.');
      setIsChangingCamera(false);
    }
  };

  const forceReloadScanner = () => {
    // Update the key to force remount of the Scanner component
    scannerKey.current += 1;
  };

  const handleScan = (detectedCodes: DetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      // Extract the raw value from the first detected code
      const data = detectedCodes[0].rawValue;
      if (data) {
        onScan(data);
      }
    }
  };

  // Enhanced renderScanner with progressive constraint fallbacks
  const renderScanner = () => {
    if (!isScanning) return null;
    
    // Get current camera - may be null if no cameras detected yet
    const currentCamera = cameras[currentCameraIndex];
    
    // Create constraints based on available information and current attempt level
    let constraints: any;
    
    // Progressive fallback strategy based on previous failures
    switch (constraintAttempts) {
      case 0:
        // First attempt: Try with ideal constraints
        if (cameras.length === 0) {
          constraints = {
            facingMode: { ideal: cameraFacingMode }
          };
        } else if (currentCamera?.deviceId) {
          constraints = {
            deviceId: { ideal: currentCamera.deviceId }
          };
        } else {
          constraints = {
            facingMode: { ideal: cameraFacingMode }
          };
        }
        break;
        
      case 1:
        // Second attempt: Try with minimal constraints
        constraints = {
          // Just width and height, no facing mode or device ID
          width: { ideal: 1280 },
          height: { ideal: 720 }
        };
        break;
        
      case 2:
      default:
        // Last attempt: No constraints at all
        constraints = true; // This lets the browser pick whatever camera/settings it wants
        break;
    }
    
    console.log(`Using camera constraints (attempt ${constraintAttempts + 1}/${maxConstraintAttempts + 1}):`, constraints);
    
    return (
      <Scanner
        key={`scanner-${scannerKey.current}-attempt-${constraintAttempts}`}
        onScan={handleScan}
        onError={handleError}
        formats={['qr_code']}
        scanDelay={750}
        allowMultiple={false}
        constraints={constraints}
        styles={{ 
          container: { width: '100%', height: '100%' },
          video: { width: '100%', height: '100%', objectFit: 'cover' }
        }}
        components={{
          audio: false,
          torch: false, // Disable torch as it can cause issues on some devices
          finder: true
        }}
      />
    );
  };

  // Significantly enhanced handleError function with better OverconstrainedError handling
  const handleError = (err: any) => {
    console.log('QR Scanner error:', err);
    
    const errorMsg = typeof err === 'string' ? err : err?.message || 'Unknown scanner error';
    
    // Special handling for OverconstrainedError
    if (errorMsg.includes('OverconstrainedError') || err.name === 'OverconstrainedError') {
      console.log(`Camera constraint error (attempt ${constraintAttempts + 1}/${maxConstraintAttempts + 1}) - trying fallback...`);
      
      // If we still have attempts left, try with more relaxed constraints
      if (constraintAttempts < maxConstraintAttempts) {
        setConstraintAttempts(curr => curr + 1);
        
        // Force scanner to remount with new constraints
        setTimeout(() => {
          forceReloadScanner();
        }, 300);
        
        return; // Don't show error to user, we're handling it
      } 
      // If we've exhausted all constraint options, try switching camera facing mode
      else {
        console.log('All constraint attempts failed, trying opposite camera...');
        
        // Reset constraint attempts
        setConstraintAttempts(0);
        
        // Try the opposite camera mode
        setCameraFacingMode(cameraFacingMode === 'environment' ? 'user' : 'environment');
        
        // Force scanner to remount
        setTimeout(() => {
          forceReloadScanner();
        }, 300);
        
        return; // Don't show error
      }
    }
    
    // Set user-friendly error message
    if (errorMsg.includes('Permission') || errorMsg.includes('permission') || errorMsg.includes('denied')) {
      setCameraPermissionDenied(true);
      setError('Camera access denied. Please check your browser settings.');
    } else if (errorMsg.includes('not found') || errorMsg.includes('No camera')) {
      setError('No camera detected on your device or camera is in use by another app.');
    } else if (errorMsg.includes('no video device')) {
      // Try reloading with different constraints
      forceReloadScanner();
      return; // Don't show this error
    } else {
      // Don't show common QR scanning errors to the user
      if (!errorMsg.includes('QR code not found') && !errorMsg.includes('No QR code found')) {
        setError(`Camera error: ${errorMsg}`);
      }
    }
    
    if (onError && !errorMsg.includes('QR code not found') && !errorMsg.includes('No QR code found')) {
      onError(errorMsg);
    }
  };

  const toggleScanner = () => {
    updateScanningState(!isScanning);
    setError(null);
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stopMediaTracks(stream); // Clean up after getting permission
      
      setCameraPermissionDenied(false);
      setError(null);
      updateScanningState(true);
      
      // Update the list of available cameras
      await enumerateVideoDevices();
      
      // Force remount of scanner component
      forceReloadScanner();
    } catch (err: any) {
      console.error("Failed to get camera permission", err);
      setCameraPermissionDenied(true);
      setError("Camera access denied. Please check your browser settings.");
      if (onError) onError("Camera permission denied");
    }
  };

  // Reset error after a few seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Add reset function to try again from scratch
  const resetScanner = () => {
    setConstraintAttempts(0);
    setCameraFacingMode('environment'); // Start with back camera
    forceReloadScanner();
    updateScanningState(true);
  };

  // Add retry button to the UI when we have errors
  const renderRetryButton = () => {
    if (!error) return null;
    
    return (
      <div className="mt-4 text-center">
        <Button 
          onClick={resetScanner} 
          variant="default"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry with Different Settings
        </Button>
      </div>
    );
  };

  // If we're not in a browser or not mounted, show loading state
  if (!isBrowser || !isMounted) {
    return (
      <Card className={`overflow-hidden ${className || ''}`}>
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <h3 className="font-medium text-sm text-blue-700">QR Scanner</h3>
        </div>
        <div className="p-4">
          <div className="w-full aspect-square max-w-[350px] mx-auto rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Initializing camera...</p>
          </div>
        </div>
      </Card>
    );
  }


  // Render camera selection dropdown when multiple cameras available
  const renderCameraSelector = () => {
    if (cameras.length <= 1) return null;
    
    return (
      <Select
        value={currentCameraIndex.toString()}
        onValueChange={(value) => switchToCamera(parseInt(value))}
        disabled={isChangingCamera || !isScanning}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Camera" />
        </SelectTrigger>
        <SelectContent>
          {cameras.map((camera, index) => (
            <SelectItem key={camera.deviceId} value={index.toString()}>
              {camera.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <Card className={`overflow-hidden ${className || ''}`}>
      <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CameraIcon className="h-4 w-4 text-blue-600" />
          <h3 className="font-medium text-sm text-blue-700">QR Scanner</h3>
          {cameras.length > 0 && (
            <span className="text-xs text-blue-500">
              {currentCameraIndex + 1}/{cameras.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleCameraFacing}
            disabled={isChangingCamera || !isScanning}
            title="Switch Camera"
          >
            <SwitchCamera className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleScanner}
          >
            {isScanning ? (
              <XIcon className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            {renderRetryButton()}
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
            <div className="w-full aspect-square max-w-[350px] mx-auto rounded-lg overflow-hidden bg-gray-100">
              {isScanning ? (
                isChangingCamera ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500">Switching camera...</p>
                  </div>
                ) : (
                  renderScanner()
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500">Scanner paused</p>
                </div>
              )}
            </div>
            
            {/* Camera selector - only shown when multiple cameras available */}
            {cameras.length > 1 && (
              <div className="mt-4 max-w-[350px] mx-auto">
                {renderCameraSelector()}
              </div>
            )}
            
            {/* Scanner Controls */}
            <div className="flex justify-center items-center gap-4 mt-4">
              <Button 
                onClick={toggleScanner}
                variant={isScanning ? "destructive" : "default"}
                className={isScanning ? "bg-red-600" : ""}
              >
                {isScanning ? "Stop Scanning" : "Start Scanning"}
              </Button>
              
              {cameras.length >= 1 && (
                <Button
                  onClick={toggleCameraFacing}
                  variant="outline"
                  disabled={!isScanning || isChangingCamera}
                >
                  <FlipHorizontal className="h-4 w-4 mr-2" />
                  Flip Camera
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}