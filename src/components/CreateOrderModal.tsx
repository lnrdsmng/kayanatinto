import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Phone,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Product } from '../types/product';
import { ProductOrder, DeliveryAddress } from '../types/transaction';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';

interface CreateOrderModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: ProductOrder) => void;
  onOpenLogin?: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  product,
  isOpen,
  onClose,
  onOrderSuccess,
  onOpenLogin,
}) => {
  const { currentUser } = useAuth();
  const { createProductOrder } = useTransactions();

  const [quantity, setQuantity] = useState(1);
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [onlineChannel, setOnlineChannel] = useState<'gcash' | 'maya' | 'maribank'>('gcash');
  const [onlinePaymentRef, setOnlinePaymentRef] = useState('');
  const [onlinePaymentProofUrl, setOnlinePaymentProofUrl] = useState('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [customerNote, setCustomerNote] = useState('');

  // Delivery Address form
  const [streetAddress, setStreetAddress] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState(product?.sellerLocation?.city || 'Majayjay');
  const [province, setProvince] = useState(product?.sellerLocation?.province || 'Laguna');
  const [landmark, setLandmark] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const isOwner = currentUser && (
    currentUser.id === product.sellerId ||
    currentUser.username.toLowerCase() === product.sellerUsername.toLowerCase()
  );

  const availableStock = product.stock || 0;
  const isPerishable = product.deliveryOptions?.isPerishableFood;
  const allowPickup = product.deliveryOptions?.allowPickup ?? true;
  const allowDelivery = product.deliveryOptions?.allowSellerDelivery ?? false;
  const deliveryFee = fulfillmentType === 'delivery' ? (product.deliveryOptions?.deliveryFee || 0) : 0;

  const subtotal = product.price * quantity;
  // Stage 8: Buyer-Paid Platform Commission (3% of subtotal)
  const platformCommissionRate = 0.03;
  const platformCommissionAmount = Math.round(subtotal * platformCommissionRate * 100) / 100;
  const totalAmount = subtotal + platformCommissionAmount + deliveryFee;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > availableStock) return availableStock;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      if (onOpenLogin) {
        onClose();
        onOpenLogin();
      } else {
        setErrorMessage('Kailangan munang mag-log in upang mag-order.');
      }
      return;
    }

    if (isOwner) {
      setErrorMessage('Hindi mo maaaring i-order ang iyong sariling produkto.');
      return;
    }

    if (availableStock <= 0) {
      setErrorMessage('Paumanhin, kasalukuyang out of stock ang produktong ito.');
      return;
    }

    if (quantity > availableStock) {
      setErrorMessage(`Hanggang ${availableStock} piraso lamang ang available ngayon.`);
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Pakilagay ang inyong numero ng telepono upang makontak kayo ng seller.');
      return;
    }

    let deliveryAddressObj: DeliveryAddress | undefined = undefined;
    if (fulfillmentType === 'delivery') {
      if (!streetAddress.trim() || !barangay.trim() || !city.trim()) {
        setErrorMessage('Kumpletuhin ang inyong address (Street, Barangay, Bayan/Lungsod) para sa delivery.');
        return;
      }
      deliveryAddressObj = {
        streetAddress: streetAddress.trim(),
        barangay: barangay.trim(),
        city: city.trim(),
        province: province.trim() || 'Laguna',
        landmark: landmark.trim() || undefined,
      };
    }

    if (paymentMethod === 'online' && !onlinePaymentRef.trim()) {
      setErrorMessage('Pakilagay ang Reference Number mula sa inyong GCash / Maya / MariBank transaction.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createProductOrder({
        productId: product.id,
        quantity,
        fulfillmentType,
        paymentMethod,
        deliveryAddress: deliveryAddressObj,
        customerPhone: phone.trim(),
        customerNote: customerNote.trim() || undefined,
        onlinePaymentRef: paymentMethod === 'online' ? onlinePaymentRef.trim() : undefined,
        onlinePaymentProofUrl: paymentMethod === 'online' ? onlinePaymentProofUrl : undefined,
      });

      if (res.success && res.order) {
        onOrderSuccess(res.order);
        onClose();
      } else {
        setErrorMessage(res.error || 'Nagkaroon ng problema sa pag-proseso ng inyong order.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'May naganap na error. Pakisubukang muli.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full my-6 overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3B1376] to-[#4F28D9] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Mag-order ng Produkto</h2>
              <p className="text-xs text-purple-200">
                Direktang order kay {product.sellerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Isara"
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Product Summary Card */}
          <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <img
              src={product.images[0] || '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png'}
              alt={product.title}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                {product.category}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate mt-1">
                {product.title}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Nagbebenta: <span className="font-semibold text-slate-700">{product.sellerName}</span>
                {product.sellerIsSenior && (
                  <span className="ml-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                    Senior Artisan
                  </span>
                )}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-base font-extrabold text-[#3B1376]">
                  ₱{product.price.toLocaleString()}
                </span>
                {product.priceUnit && (
                  <span className="text-xs text-slate-500">/{product.priceUnit}</span>
                )}
                <span className="text-xs text-slate-400">|</span>
                <span className={`text-xs font-semibold ${availableStock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {availableStock > 0 ? `${availableStock} piraso available` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>

          {/* Perishable Warning Banner */}
          {isPerishable && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Sariwang Pagkaing Lokal (Perishable Food)</p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Ito ay lutong-bahay o sariwang pagkain. Tanging lokal na lugar lamang sa Majayjay at karatig-bayan ang puwedeng i-deliver o i-pickup upang mapanatili ang kalidad.
                </p>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Dami o Quantity
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="px-3.5 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-slate-900 text-sm min-w-10 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= availableStock}
                  className="px-3.5 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-500">
                {product.priceUnit || 'piraso'} (Hanggang {availableStock} piraso)
              </span>
            </div>
          </div>

          {/* Fulfillment Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Paraan ng Pagkuha o Paghatid (Fulfillment)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allowPickup && (
                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    fulfillmentType === 'pickup'
                      ? 'border-[#3B1376] bg-purple-50/70 ring-2 ring-[#3B1376]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#3B1376]" />
                      Pickup sa Pwesto
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Libre (₱0)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {product.deliveryOptions?.pickupLocation || `${product.sellerLocation?.city || 'Majayjay'} Pickup Point`}
                  </p>
                </button>
              )}

              {allowDelivery && (
                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    fulfillmentType === 'delivery'
                      ? 'border-[#3B1376] bg-purple-50/70 ring-2 ring-[#3B1376]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#3B1376]" />
                      Lokal na Delivery ni Seller
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      ₱{(product.deliveryOptions?.deliveryFee || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {product.deliveryOptions?.deliveryArea || `Sakop na lugar: ${product.sellerLocation?.city || 'Lokal na Bayan'}`}
                  </p>
                </button>
              )}
            </div>

            {!allowDelivery && !allowPickup && (
              <p className="text-xs text-slate-500 italic mt-1">
                Kasalukuyang pickup lamang ang available ayon sa patakaran ng nagbebenta.
              </p>
            )}
          </div>

          {/* Delivery Address Fields (if delivery selected) */}
          {fulfillmentType === 'delivery' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-700" />
                Direksyon at Tirahan para sa Delivery
              </h4>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Bahay, Gusali, at Pangalan ng Kalye (Street Address) *
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Hal. 142 Rizal St., tapat ng tindahan"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3B1376]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Barangay *
                  </label>
                  <input
                    type="text"
                    required
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    placeholder="Hal. Brgy. San Roque"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3B1376]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Bayan / Lungsod *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Hal. Majayjay"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3B1376]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Landmark o Palatandaan (Opsyonal)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Hal. Kulay asul na gate o malapit sa kapilya"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3B1376]"
                />
              </div>
            </div>
          )}

          {/* Contact Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Numero ng Telepono o Cellphone (para sa komunikasyon) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Hal. 0917-123-4567"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#3B1376]"
              />
            </div>
          </div>

          {/* Optional Note for Seller */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Mensahe o Tagubilin sa Seller (Opsyonal)
            </label>
            <textarea
              rows={2}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Hal. Pakidagdagan po ng sauce o kung may espesyal na tagubilin..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#3B1376] resize-none"
            />
          </div>

          {/* STAGE 8: PAYMENT METHOD SELECTOR */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Paraan ng Pagbabayad (Payment Method) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Option A: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#7C3AED] bg-purple-50/70 ring-2 ring-[#7C3AED]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Cash on Delivery (COD)</span>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Magbayad kapag natanggap o kinuha na ang produkto. Kumpirmahin ng seller ang bayad sa order record.
                </p>
              </div>

              {/* Option B: Online Payment */}
              <div
                onClick={() => setPaymentMethod('online')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-[#7C3AED] bg-purple-50/70 ring-2 ring-[#7C3AED]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900">Online Payment (GCash / Maya / MariBank)</span>
                    <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                      Manual Verification
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Magbayad sa opisyal na KayaNatinTo receiving account gamit ang GCash, Maya, o MariBank at ilagay ang reference number.
                </p>
              </div>
            </div>

            {paymentMethod === 'online' && (
              <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl text-xs space-y-3">
                <div className="space-y-1">
                  <span className="font-bold text-purple-950 block">
                    Opisyal na Receiving Accounts ng KayaNatinTo:
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Ipadala ang eksaktong kabuuang halaga (<strong>₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>) sa alinman sa mga sumusunod:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div
                    onClick={() => setOnlineChannel('gcash')}
                    className={`p-2.5 rounded-xl border cursor-pointer ${
                      onlineChannel === 'gcash' ? 'bg-white border-blue-500 ring-2 ring-blue-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-blue-600 block">💙 GCash</span>
                    <span className="text-[11px] text-slate-800 font-mono font-bold">0917-555-KNT0</span>
                    <span className="text-[10px] text-slate-500 block">KNT PLATFORM PH</span>
                  </div>

                  <div
                    onClick={() => setOnlineChannel('maya')}
                    className={`p-2.5 rounded-xl border cursor-pointer ${
                      onlineChannel === 'maya' ? 'bg-white border-emerald-500 ring-2 ring-emerald-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-emerald-600 block">💚 Maya</span>
                    <span className="text-[11px] text-slate-800 font-mono font-bold">0917-555-KNT0</span>
                    <span className="text-[10px] text-slate-500 block">KNT PLATFORM PH</span>
                  </div>

                  <div
                    onClick={() => setOnlineChannel('maribank')}
                    className={`p-2.5 rounded-xl border cursor-pointer ${
                      onlineChannel === 'maribank' ? 'bg-white border-orange-500 ring-2 ring-orange-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-orange-600 block">🟠 MariBank</span>
                    <span className="text-[11px] text-slate-800 font-mono font-bold">1002-8849-0192</span>
                    <span className="text-[10px] text-slate-500 block">KayaNatinTo Hub Inc.</span>
                  </div>
                </div>

                {/* Reference Number Input */}
                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Payment Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={onlinePaymentRef}
                    onChange={(e) => setOnlinePaymentRef(e.target.value)}
                    placeholder="Hal. 100293847592 o MP-8849102"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Makikita ito sa resibo ng inyong GCash / Maya app pagkatapos magpadala.
                  </p>
                </div>

                {/* Simulated Proof Receipt */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                  <span>Patunay ng Resibo (Attached):</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleReceipts = [
                        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=80',
                      ];
                      setOnlinePaymentProofUrl(sampleReceipts[(sampleReceipts.indexOf(onlinePaymentProofUrl) + 1) % sampleReceipts.length]);
                    }}
                    className="text-purple-700 font-semibold hover:underline"
                  >
                    Magpalit ng sample screenshot resibo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Breakdown with 3% Buyer Commission */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({quantity} {product.priceUnit || 'piraso'})</span>
              <span className="font-semibold text-slate-900">₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-slate-600 items-center">
              <div className="flex items-center gap-1">
                <span>Komisyon ng Plataporma (3%)</span>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                  Buyer-Paid
                </span>
              </div>
              <span className="font-semibold text-purple-800">
                ₱{platformCommissionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Bayad sa Delivery (Lokal)</span>
              <span className="font-semibold text-slate-900">
                {fulfillmentType === 'delivery'
                  ? `₱${deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  : 'Libre (Pickup)'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="font-bold text-slate-900 text-sm block">Kabuuang Halaga</span>
                <span className="text-[10px] text-slate-500">
                  {paymentMethod === 'cod' ? 'Ibabayad sa Kaliwaan (COD)' : 'Online Payment'}
                </span>
              </div>
              <span className="font-extrabold text-[#7C3AED] text-lg">
                ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Community Rules Notice */}
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-[11px] text-purple-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-purple-950">Patas at Transparent na Transaksyon</p>
              <p className="text-purple-800 mt-0.5 leading-relaxed">
                Ang 3% komisyon ng plataporma ay ibinabayad ng mamimili sa checkout upang mapanatiling buo ang ₱{subtotal.toLocaleString()} kita ng nagtitinda para sa kanilang likha at produkto.
              </p>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableStock <= 0}
              className="flex-1 py-3 px-4 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Ipinoproseso...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kumpirmahin at Ipadala ang Order (₱{totalAmount.toLocaleString()})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
