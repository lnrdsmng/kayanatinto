import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  FileText,
  UserCheck,
  Camera,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GovernmentIdType, KycRecord } from '../types/auth';

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ID_OPTIONS: { id: GovernmentIdType; label: string; desc: string }[] = [
  { id: 'senior_citizen_id', label: 'Senior Citizen ID (OSCA)', desc: 'Tanggap para sa mga senior citizens (60+ years old)' },
  { id: 'philsys_national_id', label: 'PhilSys National ID (ePhilID / Card)', desc: 'Pambansang ID ng Republika ng Pilipinas' },
  { id: 'drivers_license', label: "Driver's License (LTO)", desc: 'Balidong lisensya mula sa LTO' },
  { id: 'umid', label: 'UMID Card (SSS / GSIS)', desc: 'Unified Multi-Purpose ID' },
  { id: 'passport', label: 'Philippine Passport (DFA)', desc: 'Pasaporte ng Pilipinas' },
  { id: 'postal_id', label: 'Postal ID (PhilPost)', desc: 'Digitized postal identification card' },
  { id: 'voters_id', label: "Voter's ID / Certificate (COMELEC)", desc: 'Sertipikasyon mula sa COMELEC' },
  { id: 'prc_id', label: 'PRC Professional ID', desc: 'Lisensya mula sa Professional Regulation Commission' },
];

export const KycVerificationModal: React.FC<KycVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, submitKycVerification, checkDuplicateIdNumber } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.kycRecord?.legalFullName || currentUser?.kycRecord?.fullName || currentUser?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.kycRecord?.dateOfBirth || currentUser?.dateOfBirth || '1985-06-15');
  const [addressLine, setAddressLine] = useState(currentUser?.kycRecord?.streetAddress || currentUser?.kycRecord?.addressLine || currentUser?.location?.city || 'Barangay San Antonio');
  const [city, setCity] = useState(currentUser?.kycRecord?.city || currentUser?.location?.city || 'Pasig City');
  const [province, setProvince] = useState(currentUser?.kycRecord?.province || currentUser?.location?.province || 'Metro Manila');
  const [contactNumber, setContactNumber] = useState(currentUser?.kycRecord?.contactNumber || currentUser?.phone || '0917-123-4567');
  const [idType, setIdType] = useState<GovernmentIdType>(currentUser?.kycRecord?.idType || 'philsys_national_id');
  const [idNumber, setIdNumber] = useState(currentUser?.kycRecord?.idNumber || '');
  const [idPhotoUrl, setIdPhotoUrl] = useState(currentUser?.kycRecord?.idPhotoUrl || currentUser?.kycRecord?.idFrontUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80');
  const [selfiePhotoUrl, setSelfiePhotoUrl] = useState(currentUser?.kycRecord?.selfiePhotoUrl || currentUser?.kycRecord?.selfieUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  if (!isOpen || !currentUser) return null;

  const currentStatus = currentUser.kycStatus || 'not_submitted';

  const calculateAge = (dobString: string): number => {
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation: Age check (18+)
    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      setErrorMessage('Paumanhin: Kailangan ay 18 taong gulang pataas upang makapag-withdraw ng earnings sa KayaNatinTo.');
      return;
    }

    if (!fullName.trim() || !idNumber.trim() || !contactNumber.trim() || !addressLine.trim()) {
      setErrorMessage('Pakipunan ang lahat ng kinakailangang impormasyon.');
      return;
    }

    // 2. One Person, One Account duplicate ID safeguard
    const isDuplicate = checkDuplicateIdNumber(idNumber.trim(), currentUser.id);
    if (isDuplicate) {
      setErrorMessage(
        'PANSIN: Ang ID Number na ito ay nakarehistro na sa ibang account. Mahigpit na ipinagbabawal ang duplicate accounts sa KayaNatinTo alinsunod sa ating "One Person, One Account" policy.'
      );
      return;
    }

    setIsSubmitting(true);

    const record: KycRecord = {
      legalFullName: fullName.trim(),
      fullName: fullName.trim(),
      dateOfBirth,
      streetAddress: addressLine.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      province: province.trim(),
      contactNumber: contactNumber.trim(),
      idType,
      idNumber: idNumber.trim(),
      idFrontUrl: idPhotoUrl,
      idPhotoUrl,
      selfieUrl: selfiePhotoUrl,
      selfiePhotoUrl,
      submittedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      submitKycVerification(record);
      setIsSubmitting(false);
      setSuccessSubmitted(true);
      if (onSuccess) onSuccess();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-left max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">KayaNatinTo Account Verification (KYC)</h3>
              <p className="text-xs text-purple-200">
                Seguridad ng iyong Pitaka at Pag-withdraw ng Earnings
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Indicator Banner */}
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Kasalukuyang Status:{' '}
              <strong className="uppercase font-bold tracking-wide">
                {currentStatus === 'approved' && '✅ Approved (Na-verify na)'}
                {currentStatus === 'pending_review' && '⏳ Nakapila para sa Pagsusuri (Under Review)'}
                {currentStatus === 'under_review' && '🔍 Sinusuri ng Compliance Team'}
                {currentStatus === 'rejected' && '❌ Hindi Naaprubahan (Rejected)'}
                {currentStatus === 'resubmission_required' && '⚠️ Kailangan ng Bagong Dokumento'}
                {currentStatus === 'not_submitted' && 'Hindi Pa Naisusumite'}
              </strong>
            </span>
          </div>
          <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full">
            1 Person, 1 Account
          </span>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 dark:text-slate-100">
          
          {/* Senior friendly notice */}
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-xs sm:text-sm leading-relaxed text-purple-950 dark:text-purple-200">
              <p className="font-semibold mb-1">Bakit kailangan ang KYC Verification?</p>
              <p className="text-purple-900/80 dark:text-purple-300/80">
                Upang maprotektahan ang mga kinikita ng mga sellers, service providers, at creators, kinakailangan ang isang (1) lehitimong government ID bago mag-withdraw ng pera. Tanggap ang <strong>Senior Citizen ID (OSCA)</strong> at <strong>PhilSys National ID</strong>.
              </p>
            </div>
          </div>

          {currentStatus === 'approved' && !successSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                Verified ang Iyong Account!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Maaari ka nang malayang mag-request ng payout mula sa iyong KayaNatinTo Earnings Wallet diretso sa iyong GCash, Maya, o Bank Account.
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-left max-w-md mx-auto space-y-1">
                <div><strong>Buong Pangalan:</strong> {currentUser.kycRecord?.legalFullName || currentUser.kycRecord?.fullName || currentUser.fullName}</div>
                <div><strong>Uri ng ID:</strong> {currentUser.kycRecord?.idType || 'PhilSys'}</div>
                <div><strong>ID Number:</strong> {currentUser.kycRecord?.idNumber || '••••••••'}</div>
                <div><strong>Petsa ng Pagkaka-verify:</strong> {currentUser.kycRecord?.verifiedAt ? new Date(currentUser.kycRecord.verifiedAt).toLocaleDateString() : 'Kamakailan'}</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-colors"
              >
                Isara ang Bintana
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {successSubmitted && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Matagumpay na Naisumite ang Dokumento!</strong>
                    <p className="mt-0.5 text-xs">
                      Sinusuri na ngayon ng KayaNatinTo Verification Officers ang iyong dokumento. Karaniwang natatapos ito sa loob ng ilang minuto para sa demo showcase.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 1: Personal Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  1. Personal na Impormasyon (Personal Details)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Buong Pangalan sa ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Hal. Juan Dela Cruz"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Petsa ng Kapanganakan (18+ taong gulang) *
                    </label>
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tirahan (Street, Barangay) *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="Hal. 123 Sampaguita St., Brgy. San Jose"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Lungsod o Munisipyo *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Hal. Quezon City"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Lalawigan / Rehiyon *
                    </label>
                    <input
                      type="text"
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="Hal. Metro Manila o Laguna"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Numero ng Telepono / Mobile No. *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="0917-000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Government ID */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  2. Impormasyon ng Government ID
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pumili ng Uri ng ID *
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value as GovernmentIdType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {ID_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Hal. 1234-5678-9012 o OSCA-09876"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Mahalaga: Ang bawat ID number ay maaari lamang gamitin sa iisang (1) account.
                  </p>
                </div>

                {/* Simulated photo previews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
                      Larawan ng ID (Harap / Front)
                    </label>
                    <div className="p-3 border-2 border-dashed border-purple-200 dark:border-purple-800/60 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 text-center">
                      <img
                        src={idPhotoUrl}
                        alt="ID Photo Preview"
                        className="w-full h-28 object-cover rounded-xl mb-2 border border-slate-200 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const demoPhotos = [
                            'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
                            'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
                            'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600&auto=format&fit=crop&q=80',
                          ];
                          const next = demoPhotos[(demoPhotos.indexOf(idPhotoUrl) + 1) % demoPhotos.length];
                          setIdPhotoUrl(next);
                        }}
                        className="text-xs font-medium text-purple-700 dark:text-purple-300 hover:underline inline-flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Mag-palit ng sample ID photo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                      Selfie Verification (Hawak ang ID)
                    </label>
                    <div className="p-3 border-2 border-dashed border-purple-200 dark:border-purple-800/60 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 text-center">
                      <img
                        src={selfiePhotoUrl}
                        alt="Selfie Preview"
                        className="w-full h-28 object-cover rounded-xl mb-2 border border-slate-200 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const demoSelfies = [
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
                          ];
                          const next = demoSelfies[(demoSelfies.indexOf(selfiePhotoUrl) + 1) % demoSelfies.length];
                          setSelfiePhotoUrl(next);
                        }}
                        className="text-xs font-medium text-purple-700 dark:text-purple-300 hover:underline inline-flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Mag-palit ng sample selfie
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Privacy Consent */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="consentCheckbox"
                  required
                  defaultChecked
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="consentCheckbox" className="leading-snug">
                  Pinatutunayan ko na ang lahat ng impormasyong aking ibinigay ay totoo at tama. Sumasang-ayon ako sa mga patakaran ng KayaNatinTo alinsunod sa Data Privacy Act ng Pilipinas.
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Kanselahin
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Isinusumite...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Isumite para sa Verification
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          KayaNatinTo Community Safety &bull; 100% Protektadong Datos &bull; Libre ang Verification
        </div>

      </div>
    </div>
  );
};
