import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const RegistrationNotice = () => {
  return (
    <div className="bg-yellow-50/20 border-2 border-yellow-500/50 rounded-xl p-6 mb-8 flex items-center space-x-4">
      <div>
        <h4 className="text-xl font-bold text-white mb-2">‼️ Important Registration Notice ‼️</h4>
        <p className="text-white/90 text-base">
          Team leaders, please note:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>You can <strong>only participate in ONE game</strong>.</li>
            <li>All game matches are scheduled for the same dates.</li>
            <li>Register for <strong>only one game</strong> in High-Ping.</li>
            <li>If you&apos;ve joined multiple game groups, <strong>exit the groups you won&apos;t play in</strong>.</li>
          </ul>
        </p>
      </div>
    </div>
  );
};
