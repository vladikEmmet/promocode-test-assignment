import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div />
            <div className="flex items-center gap-4">
                {user && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User size={16} />
                        <span>{user.name}</span>
                        <span className="text-slate-400">({user.email})</span>
                    </div>
                )}
                <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut size={16} className="mr-2" />
                    Выйти
                </Button>
            </div>
        </header>
    );
}