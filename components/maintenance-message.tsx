'use client';
import { useEffect, useState } from 'react';

export default function MaintenanceMessage() {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const hiddenTimestamp = localStorage.getItem('maintenanceMessageHidden');
    
    if (hiddenTimestamp) {
      const timeElapsed = Date.now() - parseInt(hiddenTimestamp);
      const sevenMinutes = 7 * 60 * 1000; // 7 minutes in milliseconds
      
      if (timeElapsed < sevenMinutes) {
        setIsVisible(false);
      } else {
        localStorage.removeItem('maintenanceMessageHidden');
      }
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('maintenanceMessageHidden', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 sticky top-0 left-0 right-0 z-[99999] shadow-md">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <p className="font-medium text-center text-sm flex-grow">
          🛠️ Scheduled Maintenance: Our servers will be down on January 16th, from 1:00 AM to 3:00 AM IST.
        </p>
        <button 
          onClick={handleClose}
          className="ml-4 p-1 hover:bg-yellow-200 rounded"
          aria-label="Close maintenance message"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
