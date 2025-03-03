'use client';

import { useState, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeaderboardTabsProps {
  children: ReactNode;
  initialTab?: string;
}

export function LeaderboardTabs({ children, initialTab = 'all' }: LeaderboardTabsProps) {
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    
    // Fix TypeScript error: Create a new URLSearchParams object properly
    const newParams = new URLSearchParams();
    
    // Copy all existing parameters
    if (searchParams) {
      searchParams.forEach((value, key) => {
        newParams.set(key, value);
      });
    }
    
    // Update the round parameter
    if (tab === 'all') {
      newParams.delete('round');
    } else {
      newParams.set('round', tab);
    }
    
    // Update the URL without refreshing the page
    const newUrl = `${pathname}?${newParams.toString()}`;
    router.push(newUrl, { scroll: false });
  };
  
  const handleRefresh = () => {
    // Force a refresh by revalidating the data
    router.refresh();
  };
  
  return (
    <Tabs 
      defaultValue={initialTab} 
      className="w-full"
      onValueChange={handleTabChange}
      value={selectedTab}
    >
      <div className="px-4 pt-3 flex items-center justify-between">
        <TabsList className="grid w-full grid-cols-3 bg-amber-50">
          <TabsTrigger value="all" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">All Rounds</TabsTrigger>
          <TabsTrigger value="1" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Round 1</TabsTrigger>
          <TabsTrigger value="2" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Round 2</TabsTrigger>
        </TabsList>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleRefresh}
          className="h-8 w-8 rounded-full bg-amber-100 hover:bg-amber-200 ml-2 flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4 text-amber-700" />
        </Button>
      </div>
      
      <TabsContent value={selectedTab} className="mt-0">
        {children}
      </TabsContent>
    </Tabs>
  );
}
