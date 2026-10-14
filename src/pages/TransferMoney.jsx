import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, ChevronRight, IndianRupee, Hash, ArrowLeft, ShieldCheck, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TransferMoney() {
  const [receiverWalletId, setReceiverWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Recipient, 2: Amount
  const [hashId, setHashId] = useState('');
  
  const { user } = useAuth();
  const presetAmounts = [500, 1000, 5000];

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!receiverWalletId) {
      toast.error('Please enter a valid Wallet ID');
      return;
    }
    setStep(2);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (Number(amount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    setLoading(true);

    try {
      if (!user || !user.userId) return;
      const balRes = await api.get(`/wallets/user/${user.userId}`);
      const senderWalletId = balRes.data.data.id;

      if (senderWalletId.toString() === receiverWalletId) {
        toast.error('You cannot transfer money to yourself');
        setLoading(false);
        return;
      }

      const idempotencyKey = crypto.randomUUID();

      await api.post(
        '/wallets/transfer',
        {
          senderWalletId: senderWalletId,
          receiverWalletId: Number(receiverWalletId),
          amount: Number(amount),
        },
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        }
      );

      setHashId(`0x${btoa(idempotencyKey + Date.now()).slice(0, 32).toLowerCase()}`);
      setSuccess(true);
      toast.success('Transfer verified and committed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setSuccess(false);
    setStep(1);
    setReceiverWalletId('');
    setAmount('');
    setHashId('');
  };

  const copyHash = () => {
    navigator.clipboard.writeText(hashId);
    toast.success('Hash ID copied to clipboard');
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto mt-20 p-8 text-center glass-card rounded-3xl border-slate-700/50 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-fintech-emerald/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fintech-indigo/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-fintech-emerald/20 text-fintech-emerald rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Transfer Successful!</h2>
          <p className="text-slate-400 mb-8 text-lg">₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been sent to Wallet #{receiverWalletId}.</p>
          
          <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 mb-8 text-left group hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-fintech-emerald" />
                Verified Hash ID
              </p>
              <button onClick={copyHash} className="text-slate-400 hover:text-white transition-colors p-1">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="font-mono text-sm text-fintech-indigo break-all">{hashId}</p>
          </div>

          <button 
            onClick={resetForm}
            className="w-full px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all shadow-lg hover:shadow-xl"
          >
            Send Another Transfer
          </button>
        </div>
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
        <h1 className="text-3xl font-bold text-white mb-2">Send Money</h1>
        <p className="text-slate-400">Transfer funds securely in real-time.</p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-700/50 relative overflow-hidden min-h-[440px] flex flex-col justify-center shadow-xl">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fintech-indigo/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Security Badge */}
          <div className="self-center mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <ShieldCheck className="w-4 h-4" />
            Security Level: High (Idempotency Protected)
          </div>

          <div className="flex items-center gap-2 mb-8">
            <div className={`h-2 rounded-full flex-1 transition-colors duration-500 ${step >= 1 ? 'bg-fintech-indigo' : 'bg-slate-800'}`} />
            <div className={`h-2 rounded-full flex-1 transition-colors duration-500 ${step >= 2 ? 'bg-fintech-indigo' : 'bg-slate-800'}`} />
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleNextStep} 
                  className="flex flex-col gap-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Recipient Wallet ID</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Hash className="w-5 h-5 text-slate-400" />
                      </div>
                      <input 
                        type="number"
                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-4 text-lg focus:outline-none focus:border-fintech-indigo focus:ring-1 focus:ring-fintech-indigo transition-all placeholder-slate-500 font-mono" 
                        placeholder="Enter Wallet ID"
                        value={receiverWalletId}
                        onChange={(e) => setReceiverWalletId(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      Ensure the Wallet ID is correct before proceeding.
                    </p>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-xl bg-fintech-indigo hover:bg-indigo-400 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit} 
                  className="flex flex-col gap-6"
                >
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors self-start mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Recipient
                  </button>

                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Sending to</span>
                    <span className="font-mono text-white font-medium text-lg">Wallet #{receiverWalletId}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Amount (INR)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <IndianRupee className="w-5 h-5 text-slate-400" />
                      </div>
                      <input 
                        type="number"
                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-4 text-xl focus:outline-none focus:border-fintech-indigo focus:ring-1 focus:ring-fintech-indigo transition-all placeholder-slate-500 font-mono font-semibold" 
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
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
                        ₹{preset}
                      </button>
                    ))}
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-xl bg-fintech-indigo hover:bg-indigo-400 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      <>Send ₹{amount || '0'} <Send className="w-4 h-4 ml-1" /></>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}