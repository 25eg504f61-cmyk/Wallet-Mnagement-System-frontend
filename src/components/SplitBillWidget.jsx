import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Users, IndianRupee, Link as LinkIcon, Check, Plus, Minus } from 'lucide-react';

export default function SplitBillWidget() {
  const [amount, setAmount] = useState('');
  const [members, setMembers] = useState(2);
  const [copied, setCopied] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const splitAmount = amount ? (Number(amount) / members).toFixed(2) : '0.00';
  const mockLink = `https://wallet.me/req/${btoa(String(Date.now())).slice(0, 8).toLowerCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mockLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 border-slate-700/50 h-full flex flex-col relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-fintech-indigo/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-fintech-indigo/10 flex items-center justify-center text-fintech-indigo">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Split the Bill</h2>
          <p className="text-sm text-slate-400">Share expenses instantly</p>
        </div>
      </div>

      <div className="space-y-5 relative z-10 flex-1">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Total Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IndianRupee className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setCalculated(false);
              }}
              placeholder="0.00"
              className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-fintech-indigo transition-all placeholder-slate-600 font-mono text-lg" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Number of People</label>
          <div className="flex items-center justify-between bg-slate-900/50 border border-slate-700 rounded-xl p-2">
            <button 
              onClick={() => {
                if (members > 2) {
                  setMembers(members - 1);
                  setCalculated(false);
                }
              }}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 font-mono text-lg text-white">
              <Users className="w-4 h-4 text-slate-400" /> {members}
            </div>
            <button 
              onClick={() => {
                setMembers(members + 1);
                setCalculated(false);
              }}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!calculated ? (
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => setCalculated(true)}
              disabled={!amount || Number(amount) <= 0}
              className="w-full py-3.5 rounded-xl bg-fintech-indigo hover:bg-indigo-400 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              Calculate Split
            </motion.button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-fintech-emerald/10 border border-fintech-emerald/20 rounded-xl p-4 mt-2"
            >
              <div className="text-center mb-4">
                <p className="text-sm text-fintech-emerald mb-1">Each person pays</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">₹{splitAmount}</h3>
              </div>
              
              <div className="flex items-center bg-slate-900 rounded-lg p-1.5 border border-slate-700/50">
                <div className="truncate px-3 text-sm font-mono text-slate-400 flex-1">
                  {mockLink}
                </div>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors whitespace-nowrap"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
