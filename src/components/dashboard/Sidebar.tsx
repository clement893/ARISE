'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, BarChart3, Target, LogOut, ChevronDown, Settings, User, Shield, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    plan?: string;
    role?: string;
  };
  activePage?: string;
  onLogout?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/dashboard/results', label: 'Results & Reports', icon: BarChart3 },
  { href: '/dashboard/development', label: 'Development plan', icon: Target },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

/**
 * NavLink component for sidebar navigation items
 */
interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  variant?: 'default' | 'admin';
}

const NavLink = ({ href, icon: Icon, label, isActive, variant = 'default' }: NavLinkProps) => {
  const baseClasses = 'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors';
  
  const variantClasses = {
    default: isActive
      ? 'bg-secondary-500 text-primary-700 font-semibold'
      : 'text-white/90 hover:bg-white/10',
    admin: 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
  };

  return (
    <Link href={href} className={cn(baseClasses, variantClasses[variant])}>
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </Link>
  );
};

/**
 * UserProfile component for sidebar header
 */
interface UserProfileProps {
  displayName: string;
  fullName: string;
  plan?: string;
  isAdmin: boolean;
}

const UserProfile = ({ displayName, fullName, plan, isAdmin }: UserProfileProps) => {
  return (
    <div className="px-4 mb-6">
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
        <div 
          className="w-10 h-10 rounded-full bg-neutral-300 flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          <span className="text-primary-700 font-semibold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-white text-sm font-medium">{fullName}</span>
            <ChevronDown className="w-4 h-4 text-white/70" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" size="sm">
              {plan || 'Starter'} plan
            </Badge>
            {isAdmin && (
              <Badge variant="admin" size="sm">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Sidebar component - Main navigation sidebar for dashboard
 */
export default function Sidebar({ user, activePage, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const displayName = user.firstName || 'User';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const isAdmin = user.role === 'admin';

  return (
    <aside 
      className="w-[240px] min-h-screen bg-primary-500 flex flex-col"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="p-6 flex justify-center">
        <Link href="/" aria-label="Go to homepage">
          <svg width="60" height="70" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M30 5C20 5 15 15 15 25C15 35 20 40 30 45C40 40 45 35 45 25C45 15 40 5 30 5Z" stroke="currentColor" className="text-secondary-500" strokeWidth="2" fill="none"/>
            <path d="M30 15C25 15 22 20 22 27C22 34 25 38 30 42C35 38 38 34 38 27C38 20 35 15 30 15Z" stroke="currentColor" className="text-secondary-500" strokeWidth="2" fill="none"/>
            <path d="M30 25C28 25 26 28 26 32C26 36 28 39 30 42C32 39 34 36 34 32C34 28 32 25 30 25Z" fill="currentColor" className="text-secondary-500"/>
            <path d="M30 45C30 55 35 60 35 65" stroke="currentColor" className="text-secondary-500" strokeWidth="2" fill="none"/>
          </svg>
        </Link>
      </div>

      {/* User Profile */}
      <UserProfile 
        displayName={displayName}
        fullName={fullName}
        plan={user.plan}
        isAdmin={isAdmin}
      />

      {/* Navigation */}
      <nav className="flex-1 px-3" aria-label="Dashboard navigation">
        <ul className="space-y-1" role="list">
          {navItems.map((item) => {
            const isActive = activePage ? item.href.includes(activePage) : pathname === item.href;
            return (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive}
                />
              </li>
            );
          })}
          
          {/* Admin Link - Only visible for admins */}
          {isAdmin && (
            <li className="mt-4 pt-4 border-t border-white/20">
              <NavLink
                href="/admin"
                icon={Shield}
                label="Admin Panel"
                isActive={false}
                variant="admin"
              />
            </li>
          )}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <Button
          variant="secondary"
          onClick={onLogout}
          leftIcon={<LogOut className="w-5 h-5" />}
          fullWidth
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}

export type { SidebarProps, NavItem };
