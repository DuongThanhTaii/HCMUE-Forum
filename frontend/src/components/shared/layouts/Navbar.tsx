'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Home,
  MessageSquare,
  BookOpen,
  MessageCircle,
  Briefcase,
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-primary h-8 w-8 rounded-lg" />
          <span className="text-xl font-bold">UniHub</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          <Link href="/" className="hover:text-primary text-sm font-medium transition-colors">
            {t('home')}
          </Link>
          <Link href="/forum" className="hover:text-primary text-sm font-medium transition-colors">
            {t('forum')}
          </Link>
          <Link
            href="/learning"
            className="hover:text-primary text-sm font-medium transition-colors"
          >
            {t('learning')}
          </Link>
          <Link href="/chat" className="hover:text-primary text-sm font-medium transition-colors">
            {t('chat')}
          </Link>
          <Link href="/career" className="hover:text-primary text-sm font-medium transition-colors">
            {t('career')}
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <LanguageSwitcher />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.avatar} alt={user?.fullName} />
                    <AvatarFallback>{user?.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-muted-foreground text-xs">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user?.id}`}>
                    <User className="mr-2 h-4 w-4" />
                    {t('profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex md:space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">{t('login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t('register')}</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            <Link
              href="/"
              className="hover:bg-accent flex items-center rounded px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="mr-3 h-5 w-5" />
              {t('home')}
            </Link>
            <Link
              href="/forum"
              className="hover:bg-accent flex items-center rounded px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              {t('forum')}
            </Link>
            <Link
              href="/learning"
              className="hover:bg-accent flex items-center rounded px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="mr-3 h-5 w-5" />
              {t('learning')}
            </Link>
            <Link
              href="/chat"
              className="hover:bg-accent flex items-center rounded px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageCircle className="mr-3 h-5 w-5" />
              {t('chat')}
            </Link>
            <Link
              href="/career"
              className="hover:bg-accent flex items-center rounded px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Briefcase className="mr-3 h-5 w-5" />
              {t('career')}
            </Link>
            {!isAuthenticated && (
              <>
                <div className="bg-border h-px" />
                <Link
                  href="/login"
                  className="hover:bg-accent block rounded px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="hover:bg-accent block rounded px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
