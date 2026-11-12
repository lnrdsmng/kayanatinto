import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Trash2, Package } from 'lucide-react';
import { Product, ProductCategory, ProductCondition, PRODUCT_CATEGORIES } from '../types/product';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { updateProduct, deleteProduct, toggleProductAvailability } = useProducts();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState(product?.title || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'food');
  const [price, setPrice] = useState(product ? String(product.price) : '100');
  const [priceUnit, setPriceUnit] = useState(product?.priceUnit || 'pack');
  const [stock, setStock] = useState(product ? String(product.stock) : '10');
  const [condition, setCondition] = useState<ProductCondition>(product?.condition || 'handcrafted');
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);

  // Delivery options
  const [allowPickup, setAllowPickup] = useState(product?.deliveryOptions.allowPickup ?? true);
  const [pickupLocation, setPickupLocation] = useState(product?.deliveryOptions.pickupLocation || '');
  const [allowSellerDelivery, setAllowSellerDelivery] = useState(
    product?.deliveryOptions.allowSellerDelivery ?? true
  );
  const [deliveryArea, setDeliveryArea] = useState(product?.deliveryOptions.deliveryArea || '');
  const [deliveryFee, setDeliveryFee] = useState(
    product?.deliveryOptions.deliveryFee ? String(product.deliveryOptions.deliveryFee) : '0'
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync state if product prop changes
  React.useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setCategory(product.category);
      setPrice(String(product.price));
      setPriceUnit(product.priceUnit || 'pack');
      setStock(String(product.stock));
      setCondition(product.condition);
      setIsAvailable(product.isAvailable);
      setAllowPickup(product.deliveryOptions.allowPickup);
      setPickupLocation(product.deliveryOptions.pickupLocation || '');
      setAllowSellerDelivery(product.deliveryOptions.allowSellerDelivery);
      setDeliveryArea(product.deliveryOptions.deliveryArea || '');
      setDeliveryFee(product.deliveryOptions.deliveryFee ? String(product.deliveryOptions.deliveryFee) : '0');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Strict ownership check
  const isOwner =
    currentUser &&
    (currentUser.id === product.sellerId ||
      currentUser.username.toLowerCase() === product.sellerUsername.toLowerCase());

  if (!isOwner) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Walang Pahintulot</h3>
          <p className="text-xs text-slate-500">
            Ang may-ari lamang ng listing na ito ang maaaring magbago o magbura ng produkto.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            Isara
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Pakilagay ang wastong presyo.');
      return;
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setError('Pakilagay ang wastong bilang ng stock.');
      return;
    }

    setIsSubmitting(true);
    const result = await updateProduct(product.id, {
      title: title.trim(),
      description: description.trim(),
      category,
      price: numPrice,
      priceUnit: priceUnit.trim(),
      stock: numStock,
      condition,
      isAvailable: numStock > 0 && isAvailable,
      isSoldOut: numStock === 0 || !isAvailable,
      deliveryOptions: {
        ...product.deliveryOptions,
        allowPickup,
        pickupLocation: allowPickup ? pickupLocation.trim() : undefined,
        allowSellerDelivery,
        deliveryArea: allowSellerDelivery ? deliveryArea.trim() : undefined,
        deliveryFee: allowSellerDelivery ? parseFloat(deliveryFee) || 0 : undefined,
      },
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 900);
    } else {
      setError(result.error || 'Nagkaroon ng aberya sa pag-save.');
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const result = await deleteProduct(product.id);
    setIsSubmitting(false);
    if (result.success) {
      setShowDeleteConfirm(false);
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(result.error || 'Hindi ma-delete ang produkto.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-purple-100 flex flex-col text-left max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-product-heading"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 id="edit-product-heading" className="text-base sm:text-lg font-bold font-display text-slate-900">
              I-edit ang Produkto (Manage Listing)
            </h2>
            <p className="text-xs text-slate-500">I-update ang presyo, stock, at mga detalye</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
            aria-label="Close"
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
              <span>Matagumpay na na-update ang listing!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pangalan ng Produkto
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376]"
              />
            </div>

            {/* Price & Stock Quick Update */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Presyo (₱)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kada / Unit
                </label>
                <input
                  type="text"
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Available Stock
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

            {/* Availability Toggle */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Katayuan ng Produkto (Availability)</p>
                <p className="text-[11px] text-slate-500">
                  {isAvailable ? 'Aktibong nakalista at mabibili sa marketplace' : 'Naka-marka bilang Sold Out o pansamantalang hindi available'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isAvailable
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {isAvailable ? 'Available' : 'Sold Out / Itago'}
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deskripsyon
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#3B1376] resize-none"
              />
            </div>

            {/* Delivery Terms */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Lokal na Pagkuha at Hatid
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowPickup}
                    onChange={(e) => setAllowPickup(e.target.checked)}
                    className="rounded text-[#3B1376]"
                  />
                  <span>Payagan ang Pickup</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowSellerDelivery}
                    onChange={(e) => setAllowSellerDelivery(e.target.checked)}
                    className="rounded text-[#3B1376]"
                  />
                  <span>Hatid ng Seller</span>
                </label>
              </div>
            </div>

            {/* Actions: Save & Delete */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Burahin ang Listing</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Kanselahin
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#3B1376] hover:bg-[#2F106A] text-white text-xs sm:text-sm font-bold shadow-md"
                >
                  {isSubmitting ? 'Sine-save...' : 'I-save ang Pagbabago'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-3">
            <Trash2 className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">
              Sigurado ka bang nais burahin ang produktong ito?
            </h3>
            <p className="text-xs text-slate-500">
              Mawawala ang listing na "{product.title}" sa marketplace. Hindi na ito maibabalik.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Huwag Burahin
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Oo, Burahin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
