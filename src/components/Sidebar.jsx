import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, ArrowRightLeft, History, Shield, LogOut, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = user.role !== 'ADMIN' 
    ? [
        { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/wallet', name: 'My Wallet', icon: Wallet },
        { path: '/deposit', name: 'Add Money', icon: PlusCircle },
        { path: '/transfer', name: 'Transfer', icon: ArrowRightLeft },
        { path: '/history', name: 'History', icon: History }
      ]
    : [
        { path: '/admin', name: 'Admin Panel', icon: Shield }
      ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col h-screen glass-panel border-r border-slate-700/30">
      <div className="p-6 flex items-center gap-3 border-b border-slate-700/30">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fintech-indigo to-purple-500 flex items-center justify-center shadow-lg">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <Link to="/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
          WalletLedger
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group
                ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className="absolute inset-0 bg-fintech-indigo/20 rounded-xl border border-fintech-indigo/30" 
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-fintech-indigo' : 'group-hover:text-slate-300'}`} />
              <span className="font-medium relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/30">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-fintech-indigo border border-slate-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-200 truncate">{user.name}</span>
              <span className="text-xs text-slate-500">{user.role}</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 w-full py-2 mt-1 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
