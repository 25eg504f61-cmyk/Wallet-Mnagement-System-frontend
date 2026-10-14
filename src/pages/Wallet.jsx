import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, User, Coins, Hash } from 'lucide-react';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    async function loadWallet() {
      try {
        if (!user || !user.userId) return;
        const res = await api.get(`/wallets/user/${user.userId}`);
        setWallet(res.data?.data);
      } catch (e) {
        console.error(e);
      }
    }
    loadWallet();
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-10"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
        <p className="text-slate-400">View your wallet details and status.</p>
      </div>

      <div className="glass-card rounded-3xl p-8 border-slate-700/50 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fintech-indigo/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fintech-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fintech-indigo to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <WalletIcon className="w-8 h-8 text-white" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-fintech-emerald/10 text-fintech-emerald border border-fintech-emerald/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <div className="w-2 h-2 rounded-full bg-fintech-emerald animate-pulse" />
              ACTIVE
            </span>
          </div>

          <div className="mb-10">
            <p className="text-slate-400 uppercase tracking-wider text-sm font-medium mb-2">Available Balance</p>
            <h2 className="text-6xl font-bold text-white tracking-tight">
              ₹{Number(wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Hash className="w-4 h-4" />
                <span className="text-sm font-medium">Wallet ID</span>
              </div>
              <span className="text-lg font-mono text-white font-medium">#{wallet?.id || '---'}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Owner</span>
              </div>
              <span className="text-lg text-white font-medium">{wallet?.ownerName || user?.name || '---'}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Coins className="w-4 h-4" />
                <span className="text-sm font-medium">Currency</span>
              </div>
              <span className="text-lg text-white font-medium">INR (₹)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}