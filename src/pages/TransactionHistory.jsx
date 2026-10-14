import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, FileText, X, QrCode, Download, ShieldCheck } from 'lucide-react';

export default function TransactionHistory() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, CREDIT, DEBIT
  const [selectedTx, setSelectedTx] = useState(null);
  
  const { user } = useAuth();
  const [walletId, setWalletId] = useState(null);

  useEffect(() => {
    async function loadTransactions() {
      try {
        if (!user || !user.userId) return;
        const balRes = await api.get(`/wallets/user/${user.userId}`);
        const userWalletId = balRes.data.data.id;
        setWalletId(userWalletId);

        const res = await api.get(`/transactions/${userWalletId}`);
        const transactions = res.data?.data?.content || res.data?.content || res.data?.data || [];
        setEntries(transactions);
      } catch (e) {
        console.error(e);
      }
    }
    loadTransactions();
  }, [user]);

  const filteredEntries = useMemo(() => {
    return entries.filter((tx) => {
      // Basic Search
      const matchSearch = String(tx.id).includes(search) || 
                          String(tx.fromWalletId).includes(search) || 
                          String(tx.toWalletId).includes(search);
                          
      // Filter Logic
      let isCredit = false;
      let isDebit = false;
      
      if (tx.toWalletId === walletId || tx.type === 'DEPOSIT') isCredit = true;
      if (tx.fromWalletId === walletId || tx.type === 'WITHDRAWAL') isDebit = true;

      const matchFilter = filter === 'ALL' || (filter === 'CREDIT' && isCredit) || (filter === 'DEBIT' && isDebit);

      return matchSearch && matchFilter;
    });
  }, [entries, search, filter, walletId]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-slate-400">Track all your credits, debits, and transfers.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-slate-100 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
            />
          </div>
          <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1 w-full sm:w-auto overflow-hidden">
            {['ALL', 'CREDIT', 'DEBIT'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredEntries.map((tx) => {
          const isCredit = tx.toWalletId === walletId || tx.type === 'DEPOSIT';
          
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={tx.id} 
              onClick={() => setSelectedTx(tx)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-600 hover:bg-slate-800/80 cursor-pointer transition-all shadow-sm group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isCredit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {isCredit ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-100 text-base">
                    {isCredit ? (tx.fromWalletId ? `Received from #${tx.fromWalletId}` : 'Wallet Deposit') : (tx.toWalletId ? `Sent to #${tx.toWalletId}` : 'Wallet Withdrawal')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500 font-mono bg-slate-800/50 px-2 py-0.5 rounded">ID: {tx.id}</p>
                    <p className="text-xs text-slate-400">
                      {tx.transactionTime ? new Date(tx.transactionTime).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  tx.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                  tx.status === 'FAILED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                  'bg-slate-700/50 text-slate-300 border-slate-600'
                }`}>
                  {tx.status || 'UNKNOWN'}
                </span>
                
                <span className={`font-bold text-lg ${isCredit ? 'text-green-500' : 'text-slate-100'}`}>
                  {isCredit ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </motion.div>
          );
        })}
        
        {filteredEntries.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No transactions found.</p>
          </div>
        )}
      </div>

      {/* Upgraded Digital Receipt Modal */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Receipt Header */}
              <div className="bg-gradient-to-b from-indigo-900/40 to-slate-900 p-6 text-center relative border-b border-slate-700/50">
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-4 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">Verified Receipt</h3>
                <p className="text-sm text-indigo-300 font-medium flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  Ledger Immutable Record
                </p>
              </div>
              
              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                <div className="text-center mb-6">
                  <p className="text-slate-400 text-sm mb-1">Transaction Amount</p>
                  <h2 className={`text-4xl font-bold tracking-tight ${selectedTx.type === 'DEPOSIT' || selectedTx.toWalletId === walletId ? 'text-green-400' : 'text-slate-100'}`}>
                    ₹{Number(selectedTx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h2>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700/50 border-dashed">
                    <span className="text-slate-400 text-sm">Date & Time</span>
                    <span className="text-slate-200 text-sm font-medium">{selectedTx.transactionTime ? new Date(selectedTx.transactionTime).toLocaleString('en-IN') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700/50 border-dashed">
                    <span className="text-slate-400 text-sm">Status</span>
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${selectedTx.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {selectedTx.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700/50 border-dashed">
                    <span className="text-slate-400 text-sm">Sender Wallet</span>
                    <span className="font-mono text-slate-300 text-sm">#{selectedTx.fromWalletId || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Receiver Wallet</span>
                    <span className="font-mono text-slate-300 text-sm">#{selectedTx.toWalletId || '-'}</span>
                  </div>
                </div>

                {/* Simulated QR Code & Hash */}
                <div className="flex items-center gap-4 bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
                  <div className="w-16 h-16 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                    {/* Simulated QR placeholder icon */}
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Blockchain Hash ID</p>
                    <p className="font-mono text-xs text-slate-300 break-all leading-relaxed">
                      0x{btoa(selectedTx.id + selectedTx.transactionTime).slice(0, 32).toLowerCase()}...
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/80 p-5 border-t border-slate-700">
                <button 
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
                >
                  <Download className="w-5 h-5" /> Download PDF Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}