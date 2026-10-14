import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, ChevronRight, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DepositMoney() {
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('Razorpay');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const presetAmounts = [500, 1000, 5000];

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (Number(amount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    setLoading(true);

    try {
      const balRes = await api.get(`/wallets/user/${user.userId}`);
      const walletId = balRes.data.data.id;

      await new Promise(resolve => setTimeout(resolve, 1500));

      const txId = `txn_${Math.random().toString(36).substr(2, 9)}`;
      await api.post(`/wallets/${walletId}/deposit`, {
        amount: Number(amount),
        provider: provider,
        externalTransactionId: txId
      });

      setSuccess(true);
      toast.success('Money deposited successfully!');
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto mt-20 p-8 text-center glass-card rounded-3xl"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-fintech-emerald/20 text-fintech-emerald rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
        <p className="text-slate-400 mb-8">₹{amount} has been added to your wallet.</p>
        <div className="w-8 h-8 border-t-2 border-fintech-indigo border-solid rounded-full animate-spin mx-auto opacity-50"></div>
        <p className="text-slate-500 text-sm mt-4">Redirecting to dashboard...</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto py-10"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Add Money</h1>
        <p className="text-slate-400">Load funds securely via your preferred payment method.</p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-700/50 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fintech-indigo/10 rounded-full blur-3xl pointer-events-none" />
        
        <form onSubmit={handleDeposit} className="relative z-10 flex flex-col gap-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Amount (INR)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <IndianRupee className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                type="number"
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-4 text-lg focus:outline-none focus:border-fintech-indigo focus:ring-1 focus:ring-fintech-indigo transition-all placeholder-slate-500 font-mono" 
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                min="1"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex gap-3">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className="flex-1 py-2 px-3 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-fintech-indigo/20 hover:border-fintech-indigo/50 hover:text-fintech-indigo text-slate-300 text-sm font-medium transition-all"
              >
                + ₹{preset}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Payment Gateway</label>
            <div className="grid grid-cols-2 gap-4">
              {['Razorpay', 'Stripe'].map((gw) => (
                <label 
                  key={gw} 
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${provider === gw ? 'border-fintech-indigo bg-fintech-indigo/10 text-white' : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="provider" 
                      value={gw} 
                      checked={provider === gw}
                      onChange={(e) => setProvider(e.target.value)}
                      className="hidden"
                    />
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">{gw}</span>
                  </div>
                  {provider === gw && <div className="w-2 h-2 rounded-full bg-fintech-indigo" />}
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-xl bg-fintech-indigo hover:bg-indigo-400 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <>Pay ₹{amount || '0'} <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
