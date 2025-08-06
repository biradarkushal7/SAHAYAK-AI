
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User } from 'lucide-react';
import { SettingsDialog } from '@/components/settings/settings-dialog';

interface UserData {
  userId: string;
  name: string;
  email: string;
  picture: string;
}

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // Ensure email property exists
      if (!parsedUser.email) {
          parsedUser.email = parsedUser.userId;
      }
      setUser(parsedUser);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for storage changes to update the user nav when Google Login completes
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'user') {
            loadUser();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="group relative h-9 w-9 rounded-full bg-google-red text-white hover:bg-transparent hover:text-google-red"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback className="bg-transparent text-white group-hover:text-google-red">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-google-red focus:bg-destructive/10 focus:text-google-red">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
