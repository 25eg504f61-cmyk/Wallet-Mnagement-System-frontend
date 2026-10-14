import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Plus, Send, History } from 'lucide-react';
import SplitBillWidget from '../components/SplitBillWidget';

export default function Dashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState('0.00');
  const [walletId, setWalletId] = useState(null);
  const [stats, setStats] = useState({ totalSent: '0.00', totalReceived: '0.00', txCount: 0 });
  const [chartData, setChartData] = useState([]);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!user || !user.userId) return;
        const summaryRes = await api.get(`/wallets/user/${user.userId}/summary`);
        const summary = summaryRes.data?.data;
        if (summary?.wallet) {
          setWalletId(summary.wallet.id);
          setBalance(Number(summary.wallet.balance || 0).toFixed(2));
        }

        const txRes = await api.get(`/transactions/${summary?.wallet?.id || ''}`);
        const txs = txRes.data?.data || [];
        
        const recentTxs = [...txs].reverse().slice(0, 10);
        const mockData = recentTxs.map((tx, idx) => ({
          name: `T${idx + 1}`,
          amount: Number(tx.amount || 0)
        }));

        if (mockData.length === 0) {
          mockData.push({ name: 'Day 1', amount: 0 }, { name: 'Day 2', amount: 0 });
        }

        setStats({
          totalSent: Number(summary?.totalSent || 0).toFixed(2),
          totalReceived: Number(summary?.totalReceived || 0).toFixed(2),
          txCount: txs.length
        });
        setChartData(mockData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    }
    fetchData();
  }, [user]);

  const formattedBalance = Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-400">Here's what's happening with your money today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Wallet Card */}
        <motion.div 
          whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}
          className="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 glass-card border-slate-700 bg-gradient-to-br from-slate-800/80 to-slate-900/90 shadow-2xl"
        >
          {/* Decorative blur elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-fintech-indigo/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fintech-emerald/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Available Balance</p>
                <div className="flex items-center gap-4">
                  <h2 className="text-5xl font-bold text-white tracking-tight">
                    ₹{showBalance ? formattedBalance : '••••••'}
                  </h2>
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                  >
                    {showBalance ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-fintech-emerald/10 text-fintech-emerald border border-fintech-emerald/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-fintech-emerald animate-pulse" />
                  Active
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="flex gap-3">
                <div className="px-4 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-xs text-slate-300 font-mono">
                  ID: #{walletId || '---'}
                </div>
                <div className="px-4 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-xs text-slate-300 font-medium">
                  INR
                </div>
              </div>
              
              <div className="flex gap-3">
                <Link to="/deposit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fintech-indigo hover:bg-indigo-400 text-white font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]">
                  <Plus className="w-4 h-4" /> Add Money
                </Link>
                <Link to="/transfer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-200 font-medium transition-all">
                  <Send className="w-4 h-4" /> Send
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Panel */}
        <div className="flex flex-col gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-3xl glass-card flex items-center justify-between border-slate-700/50 h-full"
          >
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Received</p>
              <h3 className="text-2xl font-bold text-fintech-emerald">+₹{Number(stats.totalReceived).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-fintech-emerald/10 flex items-center justify-center text-fintech-emerald">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-3xl glass-card flex items-center justify-between border-slate-700/50 h-full"
          >
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Sent</p>
              <h3 className="text-2xl font-bold text-fintech-crimson">-₹{Number(stats.totalSent).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-fintech-crimson/10 flex items-center justify-center text-fintech-crimson">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lower Grid: Recharts & Split Bill */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Activity Flow */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-6 md:p-8 lg:col-span-2 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Activity Flow</h2>
            <Link to="/history" className="flex items-center gap-1.5 text-sm text-fintech-indigo hover:text-indigo-400 font-medium transition-colors">
              View all <History className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-[300px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(51, 65, 85, 0.5)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                  formatter={(value) => [`₹${value}`, 'Amount']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366F1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                  activeDot={{ r: 6, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Split Bill Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="h-full"
        >
          <SplitBillWidget />
        </motion.div>
      </div>
    </motion.div>
  );
}