import React, { useState } from 'react';
import { X, Plus, Trash2, Check, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { PayoutChannel } from '../types/transaction';

interface ManagePayoutMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHANNELS: { id: PayoutChannel; name: string }[] = [
  { id: 'gcash', name: 'GCash Philippines' },
  { id: 'maya', name: 'Maya Wallet' },
  { id: 'maribank', name: 'MariBank Philippines' },
  { id: 'bpi', name: 'Bank of the Philippine Islands (BPI)' },
  { id: 'bdo', name: 'BDO Unibank' },
  { id: 'unionbank', name: 'UnionBank of the Philippines' },
  { id: 'seabank', name: 'SeaBank Philippines' },
  { id: 'other_bank', name: 'Ibang Bangko sa Pilipinas' },
];

export const ManagePayoutMethodsModal: React.FC<ManagePayoutMethodsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { getSellerPayoutMethods, addPayoutMethod, deletePayoutMethod, setDefaultPayoutMethod } = useTransactions();

  const [isAdding, setIsAdding] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<PayoutChannel>('gcash');
  const [accountHolderName, setAccountHolderName] = useState(currentUser?.fullName || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const methods = getSellerPayoutMethods(currentUser.id);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!accountHolderName.trim()) {
      setErrorMsg('Pakilagay ang buong pangalan ng may-ari ng account.');
      return;
    }

    if (!accountNumber.trim()) {
      setErrorMsg('Pakilagay ang numero ng account o mobile phone.');
      return;
    }

    const channelObj = CHANNELS.find((c) => c.id === selectedChannel);
    const channelName = channelObj ? channelObj.name : 'Philippine Account';

    setIsSubmitting(true);
    const res = await addPayoutMethod({
      channel: selectedChannel,
      channelName,
      accountHolderName,
      accountNumber,
      isDefault,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsAdding(false);
      setAccountNumber('');
      setIsDefault(false);
    } else {
      setErrorMsg(res.error || 'Hindi naidagdag ang payout account.');
    }
  };

  const maskAccount = (num: string) => {
    const raw = num.replace(/\D/g, '');
    if (raw.length >= 6) {
      return `${raw.slice(0, 4)} •••• ${raw.slice(-4)}`;
    }
    return num;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-white to-purple-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Mga Payout Account</h2>
              <p className="text-xs text-purple-700 font-medium">GCash, Maya, MariBank, at Philippine Banks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* List of Registered Accounts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nakatala na mga Account ({methods.length})
              </h3>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Magdagdag</span>
                </button>
              )}
            </div>

            {methods.length === 0 ? (
              <div className="p-5 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  Wala ka pang nakarehistrong payout account para sa pag-withdraw ng kita.
                </p>
                {!isAdding && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
                  >
                    Magrehistro ng Account
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {methods.map((method) => (
                  <div
                    key={method.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-200 shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{method.channelName}</span>
                        {method.isDefault ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Pangunahing Account
                          </span>
                        ) : (
                          <button
                            onClick={() => setDefaultPayoutMethod(method.id)}
                            className="text-[10px] font-semibold text-purple-600 hover:underline"
                          >
                            Gawing Default
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{method.accountHolderName}</p>
                      <p className="text-xs font-mono text-slate-500">{maskAccount(method.accountNumber)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deletePayoutMethod(method.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Tanggalin ang account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Account Form */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="border-t border-slate-200 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Magdagdag ng Bagong Payout Account</h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Kanselahin
                </button>
              </div>

              {/* Channel Selector */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Bangko o E-Wallet</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value as PayoutChannel)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 text-xs font-semibold text-slate-800 outline-none"
                >
                  {CHANNELS.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Holder Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Buong Pangalan ng Account Holder (Tulad sa Bangko/ID)
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Hal. Maria Clara Santos"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 text-xs font-medium text-slate-800 outline-none"
                  required
                />
              </div>

              {/* Account Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Account Number o Mobile Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Hal. 09171234567 o Bank Account Number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 text-xs font-mono font-medium text-slate-800 outline-none"
                  required
                />
              </div>

              {/* Set as Default */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span>Itakda bilang aking pangunahing (default) payout account</span>
              </label>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Isinusumite...' : 'I-save ang Payout Account'}
              </button>
            </form>
          )}

          {/* Security Note */}
          <div className="rounded-2xl bg-purple-50/60 border border-purple-100 p-3.5 flex items-start gap-2.5 text-xs text-purple-900">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Ligtas at Protektado ang Impormasyon</p>
              <p className="text-[11px] text-purple-700">
                Ang inyong account details ay ligtas na nakatago at gagamitin lamang ng mga authorized KayaNatinTo finance administrators para sa pagpapadala ng inyong kita.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
