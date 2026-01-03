/**
 * Sidebar navigation component
 */
import { Link, useLocation } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import {
  LayoutDashboard,
  Receipt,
  Users,
  FileCheck,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('USER' | 'HR')[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['USER'],
  },
  {
    label: 'My Expenses',
    path: '/expenses',
    icon: Receipt,
    roles: ['USER'],
  },
  {
    label: 'HR Dashboard',
    path: '/hr/dashboard',
    icon: LayoutDashboard,
    roles: ['HR'],
  },
  {
    label: 'Review Expenses',
    path: '/hr/expenses',
    icon: FileCheck,
    roles: ['HR'],
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const { role } = useRole();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(role as 'USER' | 'HR')
  );

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg
                    transition-colors
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};




