import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Receipt,
  FileCheck2,
  XCircle,
  Building2,
  DollarSign,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { WithdrawalStatus, WithdrawalRequest, ProductOrder } from '../types/transaction';

interface AdminFinancialDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminFinancialDashboardModal: React.FC<AdminFinancialDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const {
    withdrawals,
    orders,
    updateWithdrawalStatus,
    recordCodCommissionRemittance,
  } = useTransactions();

  const [activeTab, setActiveTab] = useState<'withdrawals' | 'cod-reconciliation'>('withdrawals');
  const [withdrawalFilter, setWithdrawalFilter] = useState<string>('all');
  const [codFilter, setCodFilter] = useState<string>('all');

  // Withdrawal action modal states
  const [processingWithdrawal, setProcessingWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'process' | 'complete' | 'reject' | null>(null);
  const [txReference, setTxReference] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // COD remittance recording state
  const [remittingOrder, setRemittingOrder] = useState<ProductOrder | null>(null);
  const [remittanceRef, setRemittanceRef] = useState('');
  const [remittanceNote, setRemittanceNote] = useState('');

  if (!isOpen) return null;

  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter((w) => {
    if (withdrawalFilter === 'all') return true;
    return w.status === withdrawalFilter;
  });

  // Filter COD orders
  const codOrders = orders.filter((o) => o.paymentMethod === 'cod');
  const filteredCodOrders = codOrders.filter((o) => {
    if (codFilter === 'all') return true;
    if (codFilter === 'pending') return o.codCommissionStatus === 'pending';
    if (codFilter === 'remitted') return o.codCommissionStatus === 'remitted';
    return true;
  });

  // COD Reconciliation Totals
  const totalCodSubtotal = codOrders.reduce((acc, o) => acc + (o.subtotal || 0), 0);
  const totalCodCommissionOwed = codOrders
    .filter((o) => o.codPaymentStatus === 'collected_by_seller')
    .reduce((acc, o) => acc + (o.platformCommissionAmount || 0), 0);
  const totalCodCommissionRemitted = codOrders
    .filter((o) => o.codCommissionStatus === 'remitted')
    .reduce((acc, o) => acc + (o.platformCommissionAmount || 0), 0);
  const totalCodCommissionOutstanding = totalCodCommissionOwed - totalCodCommissionRemitted;

  // Handle Withdrawal Workflow Action
  const handleExecuteWithdrawalAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingWithdrawal || !actionType) return;

    setIsSubmitting(true);
    setStatusMsg(null);

    let newStatus: WithdrawalStatus = 'pending';
    if (actionType === 'approve') newStatus = 'approved';
    else if (actionType === 'process') newStatus = 'processing';
    else if (actionType === 'complete') newStatus = 'completed';
    else if (actionType === 'reject') newStatus = 'rejected';

    const res = await updateWithdrawalStatus(processingWithdrawal.id, newStatus, {
      transactionReference: txReference.trim() || undefined,
      adminNotes: actionNotes.trim() || undefined,
      rejectionReason: rejectionReason.trim() || undefined,
      adminName: currentUser?.fullName || 'KayaNatinTo Admin',
    });

    setIsSubmitting(false);

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: `Matagumpay na binago ang estado ng Withdrawal #${processingWithdrawal.id} patungong "${newStatus}".`,
      });
      setProcessingWithdrawal(null);
      setActionType(null);
      setTxReference('');
      setActionNotes('');
      setRejectionReason('');
    } else {
      setStatusMsg({
        type: 'error',
        text: res.error || 'Hindi matagumpay ang pag-update.',
      });
    }
  };

  // Handle COD Commission Remittance Submit
  const handleExecuteRemittance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remittingOrder || !remittanceRef.trim()) return;

    setIsSubmitting(true);
    const res = await recordCodCommissionRemittance(
      remittingOrder.id,
      remittanceRef.trim(),
      remittanceNote.trim() || undefined
    );
    setIsSubmitting(false);

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: `Naitala ang remittance para sa Order #${remittingOrder.id} (Ref: ${remittanceRef}).`,
      });
      setRemittingOrder(null);
      setRemittanceRef('');
      setRemittanceNote('');
    } else {
      setStatusMsg({
        type: 'error',
        text: res.error || 'Nagkaroon ng problema sa pagtatala ng remittance.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-900 via-[#3B1376] to-purple-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight flex items-center gap-2">
                <span>Admin Financial & Settlement Portal</span>
                <span className="text-[10px] font-semibold bg-white/20 text-yellow-300 px-2 py-0.5 rounded-full">
                  Stage 8
                </span>
              </h2>
              <p className="text-xs text-purple-200 font-medium">
                Pangangasiwa ng Manual Withdrawals at COD Commission Reconciliation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMsg && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            <span>{statusMsg.text}</span>
            <button onClick={() => setStatusMsg(null)} className="underline text-[11px]">
              Alisin
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'withdrawals'
                ? 'text-purple-700 border-b-2 border-purple-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Manual Withdrawal Requests ({withdrawals.length})
          </button>
          <button
            onClick={() => setActiveTab('cod-reconciliation')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'cod-reconciliation'
                ? 'text-purple-700 border-b-2 border-purple-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            COD 3% Commission Reconciliation ({codOrders.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'withdrawals' ? (
            /* TAB 1: WITHDRAWAL REQUESTS */
            <div className="space-y-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['all', 'pending', 'under_review', 'processing', 'completed', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setWithdrawalFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-colors ${
                      withdrawalFilter === st
                        ? 'bg-purple-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Table / List */}
              {filteredWithdrawals.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  Walang kahilingan sa withdrawal sa ilalim ng napiling estado.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWithdrawals.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-200 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-purple-800">{req.id}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              req.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : req.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Isinumite: {new Date(req.submittedAt || req.createdAt).toLocaleDateString()} · {new Date(req.submittedAt || req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Nagtitinda (Seller)</span>
                          <span className="font-bold text-slate-900">{req.sellerName}</span>
                          <span className="text-purple-600 block text-[11px]">@{req.sellerUsername}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Halaga / Fee</span>
                          <span className="font-semibold text-slate-700">₱{req.amount.toLocaleString()}</span>
                          <span className="text-amber-700 block text-[11px]">-₱{req.fee.toFixed(2)} fixed fee</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Net Payout</span>
                          <span className="font-extrabold text-sm text-purple-700">₱{(req.netPayoutAmount ?? req.netAmount).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Destinasyon</span>
                          <span className="font-semibold text-slate-800 uppercase">{req.payoutChannel}</span>
                          <span className="text-slate-500 block text-[11px] font-mono">{req.payoutAccountNumberMasked || req.maskedAccountNumber}</span>
                        </div>
                      </div>

                      {req.transactionReference && (
                        <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs flex items-center justify-between">
                          <span>Disbursement Ref: <strong className="font-mono">{req.transactionReference}</strong></span>
                          {req.completedAt && (
                            <span className="text-[11px] text-emerald-600">
                              Natapos: {new Date(req.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}

                      {req.rejectionReason && (
                        <div className="bg-rose-50 text-rose-800 px-3 py-1.5 rounded-xl text-xs">
                          Dahilan ng Pagtanggi: <strong>{req.rejectionReason}</strong>
                        </div>
                      )}

                      {/* Admin Workflow Action Buttons */}
                      {req.status !== 'completed' && req.status !== 'rejected' && (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap">
                          {req.status === 'pending' && (
                            <button
                              onClick={() => {
                                setProcessingWithdrawal(req);
                                setActionType('approve');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs"
                            >
                              Aprubahan (Approve)
                            </button>
                          )}

                          {(req.status === 'pending' || req.status === 'approved') && (
                            <button
                              onClick={() => {
                                setProcessingWithdrawal(req);
                                setActionType('process');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs"
                            >
                              Mark Processing
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setProcessingWithdrawal(req);
                              setActionType('complete');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                          >
                            Mark Completed (Ipasok ang Ref)
                          </button>

                          <button
                            onClick={() => {
                              setProcessingWithdrawal(req);
                              setActionType('reject');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200"
                          >
                            Tanggihan (Reject & Refund)
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: COD 3% COMMISSION RECONCILIATION */
            <div className="space-y-5">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-left">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                    Kabuuang Benta sa COD
                  </span>
                  <span className="text-xl font-extrabold text-purple-950 mt-1 block">
                    ₱{totalCodSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-purple-600">{codOrders.length} transaksyon</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-left">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    3% Komisyon na Nakolekta
                  </span>
                  <span className="text-xl font-extrabold text-amber-950 mt-1 block">
                    ₱{totalCodCommissionOwed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-amber-600">Nasa kamay ng nagtitinda</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-left">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Na-remit sa Plataporma
                  </span>
                  <span className="text-xl font-extrabold text-emerald-950 mt-1 block">
                    ₱{totalCodCommissionRemitted.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-emerald-600">Kumpirmadong pumasok</span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-left">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                    Outstanding Balance
                  </span>
                  <span className="text-xl font-extrabold text-rose-950 mt-1 block">
                    ₱{totalCodCommissionOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-rose-600">Dapat i-remit ng sellers</span>
                </div>
              </div>

              {/* COD Orders Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mga Order sa Cash on Delivery
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs">
                    {['all', 'pending', 'remitted'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setCodFilter(st)}
                        className={`px-2.5 py-1 rounded-lg font-semibold capitalize ${
                          codFilter === st ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {filteredCodOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-700">{ord.id}</span>
                          <span className="text-slate-500">· {ord.productTitle}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            ord.codCommissionStatus === 'remitted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.codCommissionStatus === 'remitted' ? 'Remitted' : 'Pending Remittance'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Nagtitinda (Seller)</span>
                          <span className="font-bold text-slate-900">{ord.sellerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Total na Ibinayad ng Buyer</span>
                          <span className="font-semibold text-slate-800">₱{ord.totalAmount.toLocaleString()}</span>
                          <span className="text-slate-400 block text-[10px]">Subtotal: ₱{ord.subtotal.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">3% Platform Commission</span>
                          <span className="font-bold text-purple-700">₱{ord.platformCommissionAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Katayuan ng Bayad sa COD</span>
                          <span className={`font-semibold ${ord.codPaymentStatus === 'collected_by_seller' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {ord.codPaymentStatus === 'collected_by_seller' ? 'Kinumpirmang Natanggap' : 'Pending Collection'}
                          </span>
                        </div>
                      </div>

                      {ord.codCommissionRemittanceRef && (
                        <div className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl text-[11px] flex items-center justify-between">
                          <span>Remittance Settlement Ref: <strong>{ord.codCommissionRemittanceRef}</strong></span>
                          <span>{ord.codCommissionRemittedAt && new Date(ord.codCommissionRemittedAt).toLocaleDateString()}</span>
                        </div>
                      )}

                      {ord.codCommissionStatus !== 'remitted' && (
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => setRemittingOrder(ord)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
                          >
                            Itala ang Remittance (₱{ord.platformCommissionAmount.toLocaleString()})
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Modal for Processing Withdrawal */}
        {processingWithdrawal && actionType && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-base capitalize">
                  {actionType === 'complete' && 'Kumpletuhin ang Disbursement'}
                  {actionType === 'approve' && 'Aprubahan ang Kahilingan'}
                  {actionType === 'process' && 'Markahang Kasalukuyang Ipinapadala'}
                  {actionType === 'reject' && 'Tanggihan ang Withdrawal'}
                </h3>
                <button
                  onClick={() => {
                    setProcessingWithdrawal(null);
                    setActionType(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-purple-50 p-3 rounded-2xl text-xs space-y-1">
                <p>Withdrawal ID: <strong className="font-mono">{processingWithdrawal.id}</strong></p>
                <p>Seller: <strong>{processingWithdrawal.sellerName}</strong></p>
                <p>Net Payout: <strong className="text-purple-700 text-sm">₱{(processingWithdrawal.netPayoutAmount ?? processingWithdrawal.netAmount).toLocaleString()}</strong></p>
                <p>Channel: <strong className="uppercase">{processingWithdrawal.payoutChannel} ({processingWithdrawal.payoutAccountNumberMasked || processingWithdrawal.maskedAccountNumber})</strong></p>
              </div>

              <form onSubmit={handleExecuteWithdrawalAction} className="space-y-3 text-xs">
                {actionType === 'complete' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Bank / E-Wallet Reference Number (Kinakailangan)
                    </label>
                    <input
                      type="text"
                      value={txReference}
                      onChange={(e) => setTxReference(e.target.value)}
                      placeholder="Hal. GCASH-TX-998811 o BDO-REF-4421"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs outline-none focus:border-purple-600"
                      required
                    />
                  </div>
                )}

                {actionType === 'reject' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Dahilan ng Pagtanggi (Ipadadala sa Seller)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Hal. Hindi tugma ang pangalan ng account holder sa rehistradong ID..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-purple-600"
                      rows={3}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admin Notes (Opsyonal)</label>
                  <input
                    type="text"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Karagdagang tala ng admin..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-purple-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProcessingWithdrawal(null);
                      setActionType(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
                  >
                    Kanselahin
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    {isSubmitting ? 'Isinasagawa...' : 'I-kumpirma'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Action Modal for COD Remittance Recording */}
        {remittingOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-base">Itala ang COD Commission Remittance</h3>
                <button onClick={() => setRemittingOrder(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-purple-50 p-3 rounded-2xl text-xs space-y-1">
                <p>Order ID: <strong className="font-mono">{remittingOrder.id}</strong></p>
                <p>Seller: <strong>{remittingOrder.sellerName}</strong></p>
                <p>3% Platform Commission na I-re-remit: <strong className="text-purple-700 text-sm">₱{remittingOrder.platformCommissionAmount.toLocaleString()}</strong></p>
              </div>

              <form onSubmit={handleExecuteRemittance} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Settlement Reference / Resibo Number (Kinakailangan)
                  </label>
                  <input
                    type="text"
                    value={remittanceRef}
                    onChange={(e) => setRemittanceRef(e.target.value)}
                    placeholder="Hal. REM-2026-00912 o GCASH-TX-4412"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs outline-none focus:border-purple-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tala o Deskripsyon</label>
                  <input
                    type="text"
                    value={remittanceNote}
                    onChange={(e) => setRemittanceNote(e.target.value)}
                    placeholder="Hal. Na-settle via weekly bank transfer..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-purple-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRemittingOrder(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
                  >
                    Kanselahin
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    {isSubmitting ? 'Itinatala...' : 'I-kumpirma ang Remittance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
