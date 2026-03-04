import { NavLink } from 'react-router-dom';
import { Users, Tag, ShoppingCart, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { to: '/dashboard/users', label: 'Пользователи', icon: Users },
    { to: '/dashboard/promocodes', label: 'Промокоды', icon: Tag },
    { to: '/dashboard/orders', label: 'Заказы', icon: ShoppingCart },
    { to: '/dashboard/promo-usages', label: 'Аналитика', icon: BarChart3 },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200">
                <span className="font-bold text-lg text-slate-900">PromoManager</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                            )
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}