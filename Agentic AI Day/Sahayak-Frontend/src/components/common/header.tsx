
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { UserNav } from './user-nav';
import { cn } from '@/lib/utils';


export function AppHeader() {
  const { state, isMobile } = useSidebar();
  
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="items-center gap-2 md:flex">
          <span className="text-lg font-bold font-headline uppercase">Teacher's Sahayak</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-google-red text-white hover:bg-transparent hover:text-google-red transition-transform hover:scale-110"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
