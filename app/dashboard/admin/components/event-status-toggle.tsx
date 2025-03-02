'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { createClient } from '@/app/utils/supabase/clienttth';

export function EventStatusToggle() {
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const eventId = 'e47b5692-1e66-4f06-9362-f5727f27e167'; // Tech Treasure Hunt ID

  async function fetchStatus() {
    setIsLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('events')
      .select('is_active')
      .eq('id', eventId)
      .single();
    
    if (error) {
      setMessage(`Error fetching status: ${error.message}`);
    } else if (data) {
      setIsActive(data.is_active);
      setMessage('Status fetched successfully');
    }
    
    setIsLoading(false);
  }

  async function toggleStatus() {
    setIsLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('events')
      .update({ is_active: !isActive })
      .eq('id', eventId)
      .select()
      .single();
    
    if (error) {
      setMessage(`Error updating status: ${error.message}`);
    } else if (data) {
      setIsActive(data.is_active);
      setMessage(`Event is now ${data.is_active ? 'active' : 'inactive'}`);
    }
    
    setIsLoading(false);
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Tech Treasure Hunt Status</h3>
      
      <div className="flex items-center justify-between mb-4">
        <span>Event is {isActive ? 'Active' : 'Inactive'}</span>
        <Switch 
          checked={isActive} 
          onCheckedChange={toggleStatus}
          disabled={isLoading}
        />
      </div>
      
      <Button
        onClick={fetchStatus}
        variant="outline"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Loading...' : 'Check Current Status'}
      </Button>
      
      {message && (
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      )}
      
      <p className="mt-4 text-xs text-muted-foreground">
        Note: The game is programmed to show regardless of this setting.
        This toggle only affects other parts of the application.
      </p>
    </div>
  );
}
