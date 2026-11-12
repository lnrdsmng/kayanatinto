import React, { useState } from 'react';
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { ProductCategory, ProductCondition, PRODUCT_CATEGORIES } from '../types/product';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Preset photo selections for authentic Filipino products
const SAMPLE_IMAGE_PRESETS = [
  {
    id: 'lumpia-food',
    label: 'Lumpia / Ulam',
    url: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
  },
  {
    id: 'pottery-clay',
    label: 'Paso / Pottery',
    url: '/assets/aistudio/file_000000004b488207b1abfb715d178615_88e42f5b.png',
  },
  {
    id: 'pastries-bakes',
    label: 'Pastries / Bakes',
    url: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
  },
  {
    id: 'craft-wood',
    label: 'Gawang-Kamay',
    url: '/assets/aistudio/file_00000000f26082078ed9ec1d1d45c30d_b43fd100.png',
  },
];

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { addProduct } = useProducts();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>('food');
  const [price, setPrice] = useState<string>('');
  const [priceUnit, setPriceUnit] = useState('pack');
  const [stock, setStock] = useState<string>('10');
  const [condition, setCondition] = useState<ProductCondition>('handcrafted');
  const [city, setCity] = useState(currentUser?.location.city || 'Majayjay');
  const [province, setProvince] = useState(currentUser?.location.province || 'Laguna');
  const [barangay, setBarangay] = useState(currentUser?.location.barangay || '');
  const [selectedImage, setSelectedImage] = useState(SAMPLE_IMAGE_PRESETS[0].url);

  // Delivery & Pickup State
  const [allowPickup, setAllowPickup] = useState(true);
  const [pickupLocation, setPickupLocation] = useState(
    currentUser?.location.city ? `Sa bahay / workshop sa ${currentUser.location.city}` : 'Sa tindahan o bahay'
  );
  const [allowSellerDelivery, setAllowSellerDelivery] = useState(true);
  const [deliveryArea, setDeliveryArea] = useState('Sa loob ng bayan o kalapit na barangay');
  const [deliveryFee, setDeliveryFee] = useState('30');
  const [isPerishableFood, setIsPerishableFood] = useState(category === 'food');
  const [deliveryLimitations, setDeliveryLimitations] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat);
    if (newCat === 'food') {
      setIsPerishableFood(true);
      setPriceUnit('pack');
    } else if (newCat === 'clothing') {
      setIsPerishableFood(false);
      setPriceUnit('piraso');
    } else {
      setIsPerishableFood(false);
      setPriceUnit('piraso');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Kailangan munang mag-log in upang makapag-post ng produkto.');
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      setError('Pakilagay ang buong pangalan o pamagat ng produkto (minimum 3 characters).');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Pakilagay ang wastong presyo ng produkto (halimbawa: 100).');
      return;
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setError('Pakilagay ang bilang ng available na stock.');
      return;
    }

    if (!description.trim()) {
      setError('Pakisulat ang deskripsyon ng produkto upang malaman ng mamimili ang kwento at detalye nito.');
      return;
    }

    if (!allowPickup && !allowSellerDelivery) {
      setError('Pumili ng kahit isa sa Paraan ng Pagkuha (Pickup o Hatid ng Seller).');
      return;
    }

    setIsSubmitting(true);

    const result = await addProduct({
      title: title.trim(),
      description: description.trim(),
      category,
      price: numPrice,
      priceUnit: priceUnit.trim() || 'piece',
      stock: numStock,
      condition,
      images: [selectedImage],
      deliveryOptions: {
        allowPickup,
        pickupLocation: allowPickup ? pickupLocation.trim() : undefined,
        allowSellerDelivery,
        deliveryFee: allowSellerDelivery ? parseFloat(deliveryFee) || 0 : undefined,
        deliveryArea: allowSellerDelivery ? deliveryArea.trim() : undefined,
        isPerishableFood,
        deliveryLimitations: deliveryLimitations.trim() || undefined,
      },
      sellerId: currentUser.id,
      sellerName: currentUser.fullName,
      sellerUsername: currentUser.username,
      sellerAvatarUrl: currentUser.avatarUrl,
      sellerIsSenior: currentUser.isSenior,
      sellerAge: currentUser.age,
      sellerLocation: {
        city: city.trim(),
        province: province.trim(),
        barangay: barangay.trim() || undefined,
      },
      isAvailable: numStock > 0,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } else {
      setError(result.error || 'Nagkaroon ng aberya sa pag-post.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-purple-100 flex flex-col text-left max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-product-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 id="create-product-title" className="text-base sm:text-lg font-bold font-display text-slate-900">
              Magtinda ng Bagong Produkto (List a Product)
            </h2>
            <p className="text-xs text-slate-500">Ibahagi ang iyong likha o lutong bahay sa komunidad</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
            aria-label="Isara"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Matagumpay na nai-post ang iyong produkto sa marketplace!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Basic Product Information */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pangalan ng Produkto (Product Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Hal. Sariwang Lumpia Shanghai o Hand-thrown Clay Planter"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376]"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kategorya (Category) *
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376]"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.tagalogName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kondisyon (Condition)
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ProductCondition)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376]"
                >
                  <option value="handcrafted">Gawang-Kamay (Handcrafted)</option>
                  <option value="made-to-order">Bago / Made-to-Order</option>
                  <option value="brand-new">Brand New (Bago)</option>
                  <option value="pre-owned">Pre-owned (Nagamit na ngunit maayos)</option>
                </select>
              </div>
            </div>

            {/* Price, Unit & Stock */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Presyo (₱) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Hal. 150"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kada / Yunit
                </label>
                <input
                  type="text"
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  placeholder="hal. pack, piraso, box"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Available Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376]"
                />
              </div>
            </div>

            {/* Product Photo Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Larawan ng Produkto (Product Photo)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedImage(preset.url)}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${
                      selectedImage === preset.url
                        ? 'border-[#3B1376] ring-2 ring-purple-500/30 scale-102'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 inset-x-1 bg-black/60 backdrop-blur-2xs text-[9px] text-white font-bold rounded truncate px-1 py-0.5">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deskripsyon ng Produkto *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ilarawan ang sangkap, sukat, paraan ng paggawa, at bakit ito espesyal..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#3B1376] resize-none"
              />
            </div>

            {/* Local Delivery and Pickup Rules Section (Stage 3 Requirement) */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B1376] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-700" />
                <span>Paraan ng Pagkuha o Delivery (Lokal Lamang)</span>
              </h3>

              {/* Perishable Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <input
                  type="checkbox"
                  checked={isPerishableFood}
                  onChange={(e) => setIsPerishableFood(e.target.checked)}
                  className="mt-0.5 rounded text-[#3B1376] focus:ring-[#3B1376] w-4 h-4"
                />
                <span className="text-xs text-amber-950 font-medium leading-snug">
                  <strong>Perishable Food / Sariwang Pagkain:</strong> Lagyan ng tsek kung ito ay lutong ulam, kakanin, o pastry na kailangang kunin o ihatid agad sa parehong araw.
                </span>
              </label>

              {/* Pickup Option */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={allowPickup}
                    onChange={(e) => setAllowPickup(e.target.checked)}
                    className="rounded text-[#3B1376] w-4 h-4"
                  />
                  <span>Payagan ang Buyer Pickup (Kukunin ng Mamimili)</span>
                </label>
                {allowPickup && (
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Lugar ng pickup (Hal. Sa bahay sa Brgy. Talojong, Majayjay)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                )}
              </div>

              {/* Seller Delivery Option */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={allowSellerDelivery}
                    onChange={(e) => setAllowSellerDelivery(e.target.checked)}
                    className="rounded text-[#3B1376] w-4 h-4"
                  />
                  <span>Mag-alok ng Lokal na Hatid / Seller Delivery</span>
                </label>
                {allowSellerDelivery && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={deliveryArea}
                      onChange={(e) => setDeliveryArea(e.target.value)}
                      placeholder="Saklaw na bayan o lugar"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      placeholder="Delivery fee (₱)"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Additional Delivery Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Karagdagang Paalala o Limitasyon sa Delivery (Opsyonal)
                </label>
                <input
                  type="text"
                  value={deliveryLimitations}
                  onChange={(e) => setDeliveryLimitations(e.target.value)}
                  placeholder="Halimbawa: Available lamang tuwing Sabado at Linggo sa plaza..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Kanselahin
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Ina-upload...' : 'I-publish ang Produkto'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
