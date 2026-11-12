import React, { useState } from 'react';
import { X, Wallet, AlertCircle, CheckCircle2, ShieldCheck, Clock, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useReels } from '../context/ReelsContext';

interface WithdrawEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenManagePayout: () => void;
  onOpenKycModal?: () => void;
}

export const WithdrawEarningsModal: React.FC<WithdrawEarningsModalProps> = ({
  isOpen,
  onClose,
  onOpenManagePayout,
  onOpenKycModal,
}) => {
  const { currentUser } = useAuth();
  const { getSellerWalletSummary, getSellerPayoutMethods, createWithdrawalRequest } = useTransactions();
  const { getCreatorGiftEarningsSummary } = useReels();

  const [amountStr, setAmountStr] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ id: string; net: number; method: string } | null>(null);

  if (!isOpen || !currentUser) return null;

  const wallet = getSellerWalletSummary(currentUser.id, currentUser.username);
  const giftEarnings = getCreatorGiftEarningsSummary(currentUser.username);
  const availableBalance = Math.round((wallet.availableBalance + giftEarnings.netPesos) * 100) / 100;
  const payoutMethods = getSellerPayoutMethods(currentUser.id);
  const defaultMethod = payoutMethods.find((p) => p.isDefault) || payoutMethods[0];

  const currentMethodId = selectedMethodId || (defaultMethod ? defaultMethod.id : '');
  const chosenMethod = payoutMethods.find((p) => p.id === currentMethodId);

  const parsedAmount = parseFloat(amountStr) || 0;
  const fixedFee = 10;
  const netPayout = Math.max(0, parsedAmount - fixedFee);
  const isValidAmount = parsedAmount >= 50 && parsedAmount <= availableBalance;

  const handleQuickAmount = (val: number) => {
    const target = Math.min(val, availableBalance);
    setAmountStr(target > 0 ? target.toString() : '');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (parsedAmount < 50) {
      setErrorMsg('Ang pinakamababang halaga na maaaring i-withdraw ay ₱50.00.');
      return;
    }

    if (parsedAmount > wallet.availableBalance) {
      setErrorMsg(`Hindi sapat ang inyong Available Balance (₱${wallet.availableBalance.toLocaleString()}).`);
      return;
    }

    if (!currentMethodId) {
      setErrorMsg('Pumili ng payout account kung saan ipapadala ang pondo.');
      return;
    }

    setIsSubmitting(true);
    const res = await createWithdrawalRequest(parsedAmount, currentMethodId);
    setIsSubmitting(false);

    if (res.success && res.withdrawal) {
      setSuccessInfo({
        id: res.withdrawal.id,
        net: res.withdrawal.netPayoutAmount ?? res.withdrawal.netAmount,
        method: (res.withdrawal.payoutAccountName || res.withdrawal.accountHolderName) + ` (${res.withdrawal.payoutChannel.toUpperCase()})`,
      });
    } else {
      setErrorMsg(res.error || 'Nagkaroon ng aberya sa pagsusumite ng withdrawal.');
    }
  };

  const handleModalClose = () => {
    setAmountStr('');
    setErrorMsg('');
    setSuccessInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-white to-purple-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Mag-withdraw ng Kita</h2>
              <p className="text-xs text-purple-700 font-medium">Stage 8 Manual Seller Withdrawal System</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {successInfo ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Naisumite ang Kahilingan!</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Reference ID:{' '}
                  <span className="font-mono font-bold text-purple-700">{successInfo.id}</span>
                </p>
              </div>

              <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Net Payout Amount:</span>
                  <span className="font-bold text-slate-900 text-sm">₱{successInfo.net.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Destinasyon:</span>
                  <span className="font-semibold text-purple-900">{successInfo.method}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Inaasahang Panahon:</span>
                  <span className="font-semibold text-amber-700">1 hanggang 20 Business Days</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Sinusuri na ito ng KayaNatinTo Finance team. Makakatanggap kayo ng in-app notification kapag naaprubahan at naipadala na ang inyong pondo.
              </p>

              <button
                onClick={handleModalClose}
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                Naiintindihan Ko (Isara)
              </button>
            </div>
          ) : currentUser.kycStatus !== 'approved' ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-9 h-9 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kailangan ng KYC Verification</h3>
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-semibold max-w-sm mx-auto leading-relaxed">
                  Kailangan munang ma-verify ang iyong account bago ka makapag-withdraw ng earnings.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 text-left space-y-1">
                <p className="font-semibold">Bakit kailangan ang KYC?</p>
                <p className="text-amber-800 dark:text-amber-300">
                  Ito ay para sa kaligtasan ng komunidad at pagsunod sa One Person, One Account policy ng KayaNatinTo. Tanggap ang Senior Citizen ID (OSCA) at PhilSys ID.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleModalClose();
                    if (onOpenKycModal) onOpenKycModal();
                  }}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>I-verify ang Account</span>
                </button>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  I-cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Available Balance Header Card */}
              <div className="rounded-2xl bg-gradient-to-br from-[#3B1376] to-[#5B21B6] text-white p-4 shadow-md">
                <div className="flex items-center justify-between text-xs text-purple-200 mb-1">
                  <span>Available Balance (Eligible sa Withdrawal):</span>
                  <span className="bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Verified Funds
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₱{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-purple-200 mt-1">
                  Mula sa mga natapos na benta, serbisyo, at kinumpirmang Reels gift appreciation.
                </p>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Halagang Iwi-withdraw (PHP)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="50"
                    max={wallet.availableBalance}
                    value={amountStr}
                    onChange={(e) => {
                      setAmountStr(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-bold text-lg text-slate-900 outline-none"
                    required
                  />
                </div>

                {/* Quick Selection Buttons */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {[100, 200, 500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      disabled={wallet.availableBalance < val}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      ₱{val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(wallet.availableBalance)}
                    disabled={wallet.availableBalance < 50}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 disabled:opacity-40 disabled:pointer-events-none transition-colors ml-auto"
                  >
                    I-withdraw Lahat
                  </button>
                </div>
              </div>

              {/* Payout Account Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Ipadala Sa (Payout Method)
                  </label>
                  <button
                    type="button"
                    onClick={onOpenManagePayout}
                    className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Magdagdag ng Account</span>
                  </button>
                </div>

                {payoutMethods.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 text-center space-y-2">
                    <p className="text-xs text-amber-800 font-medium">
                      Wala pa kayong nakarehistrong payout account o e-wallet.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenManagePayout}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                    >
                      Magdagdag ng GCash, Maya, o Bangko
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {payoutMethods.map((pm) => {
                      const isSelected = pm.id === currentMethodId;
                      const rawNum = pm.accountNumber.replace(/\D/g, '');
                      const maskedNumber =
                        rawNum.length >= 6
                          ? `${rawNum.slice(0, 4)} •••• ${rawNum.slice(-4)}`
                          : pm.accountNumber;

                      return (
                        <div
                          key={pm.id}
                          onClick={() => setSelectedMethodId(pm.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20'
                              : 'border-slate-200 hover:border-purple-200 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{pm.channelName}</span>
                              {pm.isDefault && (
                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">{pm.accountHolderName}</p>
                            <p className="text-xs font-mono text-slate-500">{maskedNumber}</p>
                          </div>
                          <input
                            type="radio"
                            name="payoutMethod"
                            checked={isSelected}
                            onChange={() => setSelectedMethodId(pm.id)}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Fee Breakdown Card */}
              {parsedAmount > 0 && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Halaga ng Withdrawal:</span>
                    <span className="font-semibold text-slate-900">₱{parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Fixed Withdrawal Fee:</span>
                    <span className="font-semibold text-amber-700">₱{fixedFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-purple-900">
                    <span>Netong Matatanggap (Net Payout):</span>
                    <span className="text-base text-purple-700">₱{netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              {/* Policy Disclosure Box */}
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">1 hanggang 20 Business Days Payout Window</p>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Ang lahat ng kahilingan sa withdrawal ay manu-manong sinusuri at ipinapadala ng KayaNatinTo finance administrators via Philippine banks o e-wallets. Walang awtomatikong kaltas bago ma-verify.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isValidAmount || !chosenMethod || isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Ipinapadala ang Kahilingan...</span>
                ) : (
                  <>
                    <span>Kumpirmahin ang Withdrawal (₱{netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
