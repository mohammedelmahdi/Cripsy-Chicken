import { useState, FormEvent } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Settings as SettingsIcon, Save, Sliders, Printer, Receipt } from 'lucide-react';

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const [restaurantName, setRestaurantName] = useState('Cripsy Chicken');
  const [address, setAddress] = useState('Didouche Mourad, Algiers, Algeria');
  const [phone, setPhone] = useState('+213 21 00 00 00');
  const [receiptFooter, setReceiptFooter] = useState('Merci pour votre visite / شكرا لزيارتكم');
  const [paperSize, setPaperSize] = useState('80mm');

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    alert('Settings compiled successfully! Saved state to memory.');
  };

  return (
    <div className="bg-white border border-[#3E2A22] border-opacity-10 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto font-sans text-[#3E2A22]">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <SettingsIcon className="w-6 h-6 text-[#E54B2A]" />
        <div>
          <h2 className="text-xl font-extrabold">{t?.sections.settings || 'POS Settings'}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {language === 'ar' ? 'تهيئة معلومات المطعم، إعدادات طابعة الفواتير واللغة الافتراضية' : 'Configure localized metadata, thermal paper widths, and header/footer receipt banners'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section: General Restaurant profile */}
        <div className="bg-[#FFF7EE] p-5 rounded-2xl border border-orange-100 space-y-4">
          <h3 className="font-extrabold text-base flex items-center gap-2 text-[#E54B2A]">
            <Sliders className="w-4 h-4" />
            <span>{language === 'ar' ? 'الملف التعريفي للمطعم' : 'Restaurant Identity Profile'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-85">
                {language === 'ar' ? 'اسم المطعم' : 'Restaurant Name'}
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-[#3E2A22] border-opacity-10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E54B2A] font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-85">
                {language === 'ar' ? 'رقم الهاتف' : 'Contact Phone'}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-[#3E2A22] border-opacity-10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E54B2A] font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1.5 opacity-85">
                {language === 'ar' ? 'العنوان الجغرافي' : 'Physical Address'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-[#3E2A22] border-opacity-10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E54B2A] font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section: Printing and paper sizes */}
        <div className="bg-[#FFF7EE] p-5 rounded-2xl border border-orange-100 space-y-4">
          <h3 className="font-extrabold text-base flex items-center gap-2 text-[#E54B2A]">
            <Printer className="w-4 h-4" />
            <span>{language === 'ar' ? 'طابعة الفواتير والباركود' : 'Thermal Receipt Printers Settings'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-85">
                {language === 'ar' ? 'حجم ورق الطابعة' : 'Thermal Paper Width'}
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-[#3E2A22] border-opacity-10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E54B2A] font-bold"
              >
                <option value="80mm">80mm (Standard POS Tape)</option>
                <option value="58mm">58mm (Handheld Mobile Terminal)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-85">
                {language === 'ar' ? 'عدد النسخ التلقائية عند الدفع' : 'Auto Print Copies'}
              </label>
              <input
                type="number"
                defaultValue={1}
                min={1}
                max={5}
                className="w-full text-xs sm:text-sm bg-white border border-[#3E2A22] border-opacity-10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E54B2A] font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section: Custom receipt messages */}
        <div className="bg-[#FFF7EE] p-5 rounded-2xl border border-orange-100 space-y-4">
          <h3 className="font-extrabold text-base flex items-center gap-2 text-[#E54B2A]">
            <Receipt className="w-4 h-4" />
            <span>{language === 'ar' ? 'تخصيص الفاتورة الورقية' : 'Printed Receipt Customization'}</span>
          </h3>

          <div>
            <label className="block text-xs font-bold mb-1.5 opacity-85">
              {language === 'ar' ? 'نص أسفل الفاتورة (ترحيب)' : 'Footer Thank-you Banner'}
            </label>
            <input
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white border border-[#3E2A22] border-opacity-10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E54B2A] font-bold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-[#E54B2A] hover:bg-[#D03C1C] text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{t?.common.save || 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
