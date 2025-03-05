'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Download, X } from 'lucide-react';
import { useRef } from 'react';
import html2canvas from 'html2canvas';

interface AttendanceCardDialogProps {
  profile: any;
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceCardDialog({ profile, isOpen, onClose }: AttendanceCardDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `attendance-card-${profile?.full_name?.replace(/\s+/g, '-').toLowerCase() || 'user'}.png`;
      link.click();
    } catch (err) {
      console.error('Error generating attendance card:', err);
    }
  };

  // Avoid rendering if no profile data
  if (!profile?.id) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center">Your Attendance Card</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div 
            ref={cardRef}
            className="bg-white rounded-lg shadow-md p-6 max-w-[350px] mx-auto border border-gray-200"
          >
            <div className="text-center mb-4">
              <h3 className="font-bold text-xl text-gray-900">{profile?.full_name || 'User'}</h3>
              <p className="text-sm text-gray-600">{profile?.email || 'No email'}</p>
              <p className="text-sm text-gray-600 mt-1">{profile?.phone || 'No phone'}</p>
            </div>
            
            <div className="flex justify-center mb-4">
              <div className="bg-white p-1 border border-gray-100 rounded-md">
                <QRCodeSVG
                  value={profile.id}
                  size={180}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">Scan for attendance verification</p>
              <p className="text-xs font-semibold text-purple-600 mt-1">SPECTRUM 2025</p>
            </div>
            
            {profile?.college_name && (
              <div className="text-center mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">{profile.college_name}</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
          <Button onClick={downloadCard} className="bg-purple-600 hover:bg-purple-700">
            <Download className="mr-2 h-4 w-4" />
            Download Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
