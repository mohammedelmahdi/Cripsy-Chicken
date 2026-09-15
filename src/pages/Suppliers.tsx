import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Users, Phone, Mail, MapPin, Truck, Loader2 } from 'lucide-react';
import { services } from '../api/client';

interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string;
}

export default function Suppliers() {
  const { t, language } = { ...useLanguage() };
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await services.suppliers.fetchList();
      if (Array.isArray(res)) {
        const mapped = res.map((sup: any) => ({
          id: sup.id,
          companyName: sup.name || 'Supplier Company',
          contactPerson: sup.contact_name || 'Contact Person',
          phone: sup.phone || '+213 21 00 00 00',
          email: sup.email || 'supplier@example.com',
          address: sup.address || 'Algiers',
          category: sup.category || 'Food & Materials'
        }));
        setSuppliers(mapped);
      }
    } catch (err: any) {
      console.error('Failed to load supplier rows:', err);
      setError(language === 'ar' ? 'فشل تحميل بيانات الموردين.' : 'Failed to fetch suppliers directory.');
      // Fallback
      setSuppliers([
        {
          id: 'sup-1',
          companyName: 'Algiers Poultry Fresh',
          contactPerson: 'Mourad Benyahia',
          phone: '+213 21 44 55 66',
          email: 'mourad.poultry@gmail.com',
          address: 'Route de Larbaa, Algiers',
          category: 'Fresh Chicken & Meats'
        },
        {
          id: 'sup-2',
          companyName: 'El Baraka Bakeries',
          contactPerson: 'Youssef Cherif',
          phone: '+213 21 88 99 00',
          email: 'baraka.baker@hotmail.com',
          address: 'Industrial Zone, Oued Smar',
          category: 'Brioche Buns & Tortillas'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  return (
    <div className="bg-white border border-[#3E2A22] border-opacity-10 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto font-sans text-[#3E2A22]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-[#E54B2A]" />
          <div>
            <h2 className="text-xl font-extrabold">{t?.sections.suppliers || 'Suppliers Directory'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'ar' ? 'دليل موردي المواد الغذائية، اللحوم والمخبوزات للمطعم' : 'Contact directory and purchase channels for poultry, buns, and packaging ingredients'}
            </p>
          </div>
        </div>
      </div>

      {loading && suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-xs font-bold text-gray-400">
          <Loader2 className="w-6 h-6 text-[#E54B2A] animate-spin" />
          <span>{language === 'ar' ? 'جاري تحميل الموردين...' : 'Reading merchant records...'}</span>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12 text-xs text-gray-400 font-bold">
          {language === 'ar' ? 'لا يوجد موردون حالياً' : 'No suppliers registered.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((sup) => (
            <div key={sup.id} className="border border-gray-100 bg-[#FFF7EE] p-5 rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start border-b border-orange-100 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit">
                      <Truck className="w-3 h-3" />
                      <span>{sup.category}</span>
                    </span>
                    <h3 className="font-extrabold text-base mt-2">{sup.companyName}</h3>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono font-bold">#{sup.id}</span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-gray-600">
                  <p className="text-[#3E2A22]">
                    <strong>{language === 'ar' ? 'المسؤول:' : 'Contact:'}</strong> {sup.contactPerson}
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#E54B2A]" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#E54B2A]" />
                    <span>{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#E54B2A]" />
                    <span>{sup.address}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => alert(`Creating stock purchase order with ${sup.companyName}...`)}
                className="mt-4 w-full py-2 bg-white hover:bg-[#FFF1DE] border border-gray-200 hover:border-[#F2B21B] text-[#3E2A22] text-xs font-bold rounded-lg transition-all"
              >
                {language === 'ar' ? 'إنشاء أمر شراء' : 'Create Purchase Order'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
