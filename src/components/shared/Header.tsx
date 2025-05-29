
"use client";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { useRouter } from 'next/navigation';
import { UserCircle, LogOut, Home, Sun, Moon } from 'lucide-react'; // Removed LogIn
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case 'vendor':
        return '/vendor/dashboard';
      case 'delivery_partner':
        return '/delivery/dashboard';
      case 'customer':
        return '/auth/customer-login';
      default:
        return '/';
    }
  };

  const renderThemeChanger = () => {
    if (!mounted) {
      return <Skeleton className="h-8 w-8 rounded-md" />;
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="h-9 w-9"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <Logo size="normal" />
        <div className="flex items-center gap-2 sm:gap-3">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </>
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push(getDashboardLink())} className="flex items-center gap-2">
                <UserCircle size={18} />
                <span className="hidden sm:inline">{user.name} ({user.role.replace('_', ' ')})</span>
                <span className="sm:hidden sr-only">Profile</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1.5 sm:gap-2">
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden sr-only">Logout</span>
              </Button>
            </>
          ) : (
            <>
            {/* Home button for unauthenticated users can remain if desired, or be removed */}
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="hidden sm:flex items-center gap-2">
                <Home size={18} />
                <span>Home</span>
              </Button>
            {/* Generic Login button removed as per request */}
            </>
          )}
           {renderThemeChanger()}
        </div>
      </div>
    </header>
  );
}
