
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Home, MessageSquare, Briefcase, LoaderCircle } from 'lucide-react';
import { AppHeader } from '@/components/common/header';
import { Logo } from '@/components/common/logo';
import { cn } from '@/lib/utils';

function Header() {
  const { state } = useSidebar();
  return (
    <SidebarHeader>
      <div className="flex items-center gap-2">
        <Logo />
        <span
          className={cn(
            'text-lg font-bold font-headline transition-opacity duration-200',
            state === 'collapsed' && 'opacity-0'
          )}
        >
          Teacher's Sahayak
        </span>
      </div>
    </SidebarHeader>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.replace('/login');
    } else {
      setIsAuthenticating(false);
    }
  }, [router]);

  if (isAuthenticating) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getIsActive = (path: string) => {
    return pathname === path;
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <Header />
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push('/dashboard')}
                isActive={getIsActive('/dashboard')}
                tooltip="Dashboard"
              >
                <Home />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push('/dashboard/chat')}
                isActive={getIsActive('/dashboard/chat')}
                tooltip="Sahayak Chat"
              >
                <MessageSquare />
                <span>Sahayak Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push('/dashboard/services')}
                isActive={getIsActive('/dashboard/services')}
                tooltip="Services"
              >
                <Briefcase />
                <span>Services</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
