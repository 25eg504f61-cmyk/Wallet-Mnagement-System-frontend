import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, Database, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, txRes] = await Promise.all([
          api.get('/admin/system-summary'),
          api.get('/admin/all-transactions')
        ]);
        setSummary(summaryRes.data);
        setTransactions(txRes.data);
      } catch (err) {
        setError('Failed to load admin data. Are you logged in as an ADMIN?');
        toast.error('Unauthorized: Admin access required');
      }
    }
    load();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-fintech-indigo" />
          Admin Ledger Dashboard
        </h1>
        <p className="text-slate-400">Financial Auditor view for double-entry accounting verification.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-fintech-crimson/10 border border-fintech-crimson/30 text-fintech-crimson flex items-center gap-3">
          <ShieldAlert className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div 
          whileHover={{ y: -2 }}
          className="glass-card p-6 rounded-3xl border-slate-700/50 flex items-center gap-6"
        >
          <div className="w-14 h-14 rounded-full bg-fintech-indigo/20 text-fintech-indigo flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Total Active Wallets</p>
            <h2 className="text-3xl font-bold text-white">{summary?.totalWallets ?? '—'}</h2>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="glass-card p-6 rounded-3xl border-slate-700/50 flex items-center gap-6"
        >
          <div className="w-14 h-14 rounded-full bg-fintech-emerald/20 text-fintech-emerald flex items-center justify-center">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">System Liability (INR)</p>
            <h2 className="text-3xl font-bold text-white">
              ₹{Number(summary?.totalBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Sum of all user balances in the system.</p>
          </div>
        </motion.div>
      </div>

      <div className="glass-card rounded-2xl border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Immutable Ledger Entries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700/50">
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Entry ID</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Tx Reference</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Wallet ID</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {tx.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-slate-400">
                      {tx.transactionId != null ? String(tx.transactionId) : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      (tx.type || tx.entryType) === 'CREDIT' ? 'bg-fintech-emerald/10 text-fintech-emerald border-fintech-emerald/20' : 
                      'bg-fintech-crimson/10 text-fintech-crimson border-fintech-crimson/20'
                    }`}>
                      {tx.type || tx.entryType || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono text-sm">
                    #{tx.wallet?.id ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {tx.transactionTime || tx.createdAt ? new Date(tx.transactionTime || tx.createdAt).toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`font-semibold ${(tx.type || tx.entryType) === 'CREDIT' ? 'text-fintech-emerald' : 'text-slate-200'}`}>
                      {(tx.type || tx.entryType) === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && !error && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>No ledger entries found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
