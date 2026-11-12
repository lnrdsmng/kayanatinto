import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  PackageCheck,
  Truck,
  MessageCircle,
  Ban,
  ArrowUpDown,
  RefreshCw,
  UserCheck,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { ProductOrder, ServiceBooking, ProductOrderStatus, ServiceBookingStatus } from '../types/transaction';

interface TransactionsDashboardPageProps {
  initialViewMode?: 'customer' | 'merchant';
  onSelectOrder: (order: ProductOrder) => void;
  onSelectBooking: (booking: ServiceBooking) => void;
  onOpenMessage?: (
    participant: { id: string; name: string; username: string; avatarUrl?: string; isSenior?: boolean },
    contextItem: { type: 'order' | 'booking'; id: string; title: string; priceOrRate?: string; imageUrl?: string }
  ) => void;
  onViewUserProfile?: (username: string) => void;
}

type TabCategory = 'all' | 'products' | 'services';
type StatusTab = 'all' | 'pending' | 'active' | 'completed' | 'cancelled';

export const TransactionsDashboardPage: React.FC<TransactionsDashboardPageProps> = ({
  initialViewMode = 'customer',
  onSelectOrder,
  onSelectBooking,
  onOpenMessage,
  onViewUserProfile,
}) => {
  const { currentUser } = useAuth();
  const {
    orders,
    bookings,
    updateOrderStatus,
    updateBookingStatus,
    pendingSellerOrdersCount,
    pendingProviderBookingsCount,
    pendingCustomerOrdersCount,
    pendingCustomerBookingsCount,
  } = useTransactions();

  const [viewMode, setViewMode] = useState<'customer' | 'merchant'>(initialViewMode);
  const [categoryFilter, setCategoryFilter] = useState<TabCategory>('all');
  const [statusFilter, setStatusFilter] = useState<StatusTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentUserId = currentUser?.id || 'user-maria-santos';
  const currentUsername = currentUser?.username || 'mariasantos';

  // Filter Orders
  const filteredOrders = useMemo(() => {
    let list = orders.filter((o) => {
      if (viewMode === 'customer') {
        return (
          o.customerId === currentUserId ||
          o.customerUsername.toLowerCase() === currentUsername.toLowerCase()
        );
      } else {
        return (
          o.sellerId === currentUserId ||
          o.sellerUsername.toLowerCase() === currentUsername.toLowerCase()
        );
      }
    });

    if (categoryFilter === 'services') return [];

    if (statusFilter === 'pending') {
      list = list.filter((o) => o.status === 'pending');
    } else if (statusFilter === 'active') {
      list = list.filter((o) => o.status === 'accepted' || o.status === 'preparing' || o.status === 'ready_or_out');
    } else if (statusFilter === 'completed') {
      list = list.filter((o) => o.status === 'completed');
    } else if (statusFilter === 'cancelled') {
      list = list.filter((o) => o.status === 'cancelled');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.productTitle.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.sellerName.toLowerCase().includes(q) ||
          o.customerUsername.toLowerCase().includes(q) ||
          o.sellerUsername.toLowerCase().includes(q)
      );
    }

    return list;
  }, [orders, viewMode, categoryFilter, statusFilter, searchQuery, currentUserId, currentUsername]);

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    let list = bookings.filter((b) => {
      if (viewMode === 'customer') {
        return (
          b.customerId === currentUserId ||
          b.customerUsername.toLowerCase() === currentUsername.toLowerCase()
        );
      } else {
        return (
          b.providerId === currentUserId ||
          b.providerUsername.toLowerCase() === currentUsername.toLowerCase()
        );
      }
    });

    if (categoryFilter === 'products') return [];

    if (statusFilter === 'pending') {
      list = list.filter((b) => b.status === 'pending' || b.status === 'schedule_proposed');
    } else if (statusFilter === 'active') {
      list = list.filter((b) => b.status === 'accepted' || b.status === 'confirmed' || b.status === 'in_progress');
    } else if (statusFilter === 'completed') {
      list = list.filter((b) => b.status === 'completed');
    } else if (statusFilter === 'cancelled') {
      list = list.filter((b) => b.status === 'cancelled');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.serviceTitle.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.providerName.toLowerCase().includes(q) ||
          b.customerUsername.toLowerCase().includes(q) ||
          b.providerUsername.toLowerCase().includes(q)
      );
    }

    return list;
  }, [bookings, viewMode, categoryFilter, statusFilter, searchQuery, currentUserId, currentUsername]);

  // Combined and sorted by updatedAt descending
  type CombinedItem =
    | { type: 'order'; data: ProductOrder; timestamp: number }
    | { type: 'booking'; data: ServiceBooking; timestamp: number };

  const combinedItems: CombinedItem[] = useMemo(() => {
    const orderItems: CombinedItem[] = filteredOrders.map((o) => ({
      type: 'order',
      data: o,
      timestamp: new Date(o.updatedAt || o.createdAt).getTime(),
    }));

    const bookingItems: CombinedItem[] = filteredBookings.map((b) => ({
      type: 'booking',
      data: b,
      timestamp: new Date(b.updatedAt || b.createdAt).getTime(),
    }));

    return [...orderItems, ...bookingItems].sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredOrders, filteredBookings]);

  const merchantPendingCount = pendingSellerOrdersCount + pendingProviderBookingsCount;
  const customerPendingCount = pendingCustomerOrdersCount + pendingCustomerBookingsCount;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4 sm:pt-6">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 space-y-6">
        {/* Page Top Banner */}
        <div className="bg-gradient-to-r from-[#3B1376] to-[#4F28D9] rounded-2xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-300 bg-white/10 px-2.5 py-1 rounded-md inline-block">
              KayaNatinTo Pamamahala ng Transaksyon
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {viewMode === 'customer' ? 'Aking mga Order at Booking' : 'Pamamahala ng Benta at Serbisyo'}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
              Direktang ugnayan sa pagitan ng mga mamimili, lokal na negosyante, at eksperto. Walang kinaltas na komisyon, protektado at transparent para sa buong komunidad.
            </p>
          </div>
          {/* Subtle background glow */}
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-10 -mb-10" />
        </div>

        {/* View Mode Toggle: Customer vs Merchant */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('customer')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              viewMode === 'customer'
                ? 'bg-[#3B1376] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Aking mga Binili at Na-book (Customer)</span>
            {customerPendingCount > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${viewMode === 'customer' ? 'bg-amber-400 text-slate-900' : 'bg-purple-100 text-[#3B1376]'}`}>
                {customerPendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('merchant')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              viewMode === 'merchant'
                ? 'bg-[#3B1376] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Papasok na Benta at Serbisyo (Seller / Provider)</span>
            {merchantPendingCount > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${viewMode === 'merchant' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-900'}`}>
                {merchantPendingCount} Bago
              </span>
            )}
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Maghanap ayon sa Reference ID, produkto, serbisyo, o pangalan..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#3B1376]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  categoryFilter === 'all'
                    ? 'bg-purple-100 text-[#3B1376]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Lahat
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('products')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                  categoryFilter === 'products'
                    ? 'bg-purple-100 text-[#3B1376]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Mga Produkto ({filteredOrders.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('services')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                  categoryFilter === 'services'
                    ? 'bg-purple-100 text-[#3B1376]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Mga Serbisyo ({filteredBookings.length})</span>
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Lahat ng Estado
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Nakabinbin / Bago (Pending)</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'active'
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Kasalukuyang Ginagawa (Active)</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Natapos (Completed)</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('cancelled')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'cancelled'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Nakansela</span>
            </button>
          </div>
        </div>

        {/* Transaction Cards List */}
        {combinedItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Walang transaksyong natagpuan
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery
                ? `Walang tugma sa paghahanap "${searchQuery}". Subukang tanggalin ang filter.`
                : viewMode === 'customer'
                ? 'Wala ka pang aktibong order o booking. Mag-explore sa Merkado o Serbisyo upang mag-order!'
                : 'Wala pang papasok na order o booking para sa iyong mga listing.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {combinedItems.map((item) => {
              if (item.type === 'order') {
                const order = item.data;
                const isSeller = viewMode === 'merchant';
                return (
                  <div
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-purple-300 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
                  >
                    {/* Top Row: Ref & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-purple-50 text-[#3B1376] px-2.5 py-0.5 rounded-md">
                          {order.id}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-purple-700" />
                          Order ng Produkto
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('fil-PH', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Status Tag */}
                      <div>
                        {order.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Nakabinbin (Pending)
                          </span>
                        )}
                        {order.status === 'accepted' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Tinanggap (Accepted)
                          </span>
                        )}
                        {order.status === 'preparing' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            Inihahanda (Preparing)
                          </span>
                        )}
                        {order.status === 'ready_or_out' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {order.fulfillmentType === 'pickup' ? 'Handa na sa Pickup' : 'Out for Delivery'}
                          </span>
                        )}
                        {order.status === 'completed' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Natapos na (Completed)
                          </span>
                        )}
                        {order.status === 'cancelled' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Nakansela
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Product Info & Pricing */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {order.productTitle}
                        </h4>
                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                          <span>
                            {isSeller ? `Customer: ${order.customerName}` : `Seller: ${order.sellerName}`}
                          </span>
                          <span>•</span>
                          <span>{order.quantity} {order.priceUnit || 'piraso'}</span>
                          <span>•</span>
                          <span className="font-bold text-[#3B1376]">₱{order.totalAmount.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600">
                          {order.fulfillmentType === 'pickup' ? (
                            <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              <MapPin className="w-3 h-3 text-purple-700" />
                              Pickup: {order.pickupLocation || 'Majayjay Town Center'}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              <Truck className="w-3 h-3 text-purple-700" />
                              Lokal na Delivery ({order.deliveryAddress?.city || 'Laguna'})
                            </span>
                          )}
                          {order.isPerishableFood && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                              Sariwang Pagkain
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row Actions & Quick Links */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-400">
                        I-click upang buksan ang buong detalye at timeline →
                      </span>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {isSeller && order.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, 'accepted', 'Tinanggap ang order.')}
                            className="py-1.5 px-3 rounded-lg bg-[#3B1376] hover:bg-[#2F106A] text-white font-bold text-xs"
                          >
                            Tanggapin
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelectOrder(order)}
                          className="py-1.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1"
                        >
                          <span>Tingnan</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const booking = item.data;
                const isProvider = viewMode === 'merchant';
                return (
                  <div
                    key={booking.id}
                    onClick={() => onSelectBooking(booking)}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-purple-300 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
                  >
                    {/* Top Row: Ref & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-md">
                          {booking.id}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          Booking sa Serbisyo
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(booking.createdAt).toLocaleDateString('fil-PH', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Status Tag */}
                      <div>
                        {booking.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Nakabinbin (Pending)
                          </span>
                        )}
                        {booking.status === 'accepted' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Tinanggap (Accepted)
                          </span>
                        )}
                        {booking.status === 'schedule_proposed' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
                            May Bagong Mungkahing Iskedyul
                          </span>
                        )}
                        {booking.status === 'confirmed' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            Kumpirmado (Confirmed)
                          </span>
                        )}
                        {booking.status === 'in_progress' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            Isinasagawa (In Progress)
                          </span>
                        )}
                        {booking.status === 'completed' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Natapos na (Completed)
                          </span>
                        )}
                        {booking.status === 'cancelled' && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Nakansela
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Service Info & Schedule */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={booking.serviceImage}
                        alt={booking.serviceTitle}
                        className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {booking.serviceTitle}
                        </h4>
                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                          <span>
                            {isProvider ? `Client: ${booking.customerName}` : `Provider: ${booking.providerName}`}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-[#3B1376]">{booking.estimatedPriceDisplay}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-purple-700" />
                            📅 {booking.proposedDate || booking.preferredDate} ({booking.proposedTimeSlot || booking.preferredTimeSlot})
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md capitalize">
                            {booking.arrangement === 'customer-location' ? 'Home Visit' : booking.arrangement}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-400">
                        I-click upang tingnan ang iskedyul at mensahe →
                      </span>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {isProvider && booking.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(booking.id, 'accepted', { note: 'Tinanggap ang booking.' })}
                            className="py-1.5 px-3 rounded-lg bg-[#3B1376] hover:bg-[#2F106A] text-white font-bold text-xs"
                          >
                            Tanggapin
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelectBooking(booking)}
                          className="py-1.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1"
                        >
                          <span>Tingnan</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};
