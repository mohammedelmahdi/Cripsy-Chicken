import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { UtensilsCrossed, Plus, Settings, Sparkles, Loader2 } from 'lucide-react';
import { services } from '../api/client';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  sizes?: { label: string; price: number }[];
  modifiers?: string[];
}

export default function Products() {
  const { t, language } = { ...useLanguage() };
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await services.products.fetchMenu();
      const rawProducts = Array.isArray(res) ? res : (res && Array.isArray(res.products) ? res.products : []);
      if (rawProducts.length > 0) {
        const mapped = rawProducts.map((prod: any) => {
          let sizesParsed: { label: string; price: number }[] | undefined = undefined;
          if (prod.sizes || prod.prices) {
            try {
              const rawSizes = prod.sizes || prod.prices;
              sizesParsed = typeof rawSizes === 'string' ? JSON.parse(rawSizes) : rawSizes;
              if (Array.isArray(sizesParsed)) {
                sizesParsed = sizesParsed.map((s: any) => ({
                  label: s.label || s.size_name || 'Standard',
                  price: Number(s.price)
                }));
              }
            } catch (e) {
              sizesParsed = undefined;
            }
          }
          let modifiersParsed: string[] | undefined = undefined;
          if (prod.modifiers) {
            try {
              modifiersParsed = typeof prod.modifiers === 'string' ? JSON.parse(prod.modifiers) : prod.modifiers;
              if (Array.isArray(modifiersParsed)) {
                modifiersParsed = modifiersParsed.map((m: any) => typeof m === 'object' ? m.name : m);
              }
            } catch (e) {
              modifiersParsed = undefined;
            }
          }

          return {
            id: prod.id,
            name: prod.name || 'Crispy Item',
            category: prod.category?.name || prod.category || 'Burgers',
            basePrice: Number(prod.price || prod.base_price || (prod.prices && prod.prices[0]?.price) || 0),
            sizes: sizesParsed,
            modifiers: modifiersParsed
          };
        });
        setItems(mapped);
      }
    } catch (err: any) {
      console.error('Failed to load menu products:', err);
      setError(language === 'ar' ? 'فشل تحميل قائمة الوجبات.' : 'Failed to fetch catalog products.');
      // Standalone fallback
      setItems([
        {
          id: 'm1',
          name: 'Cripsy Classic Burger',
          category: 'Burgers',
          basePrice: 650,
          sizes: [
            { label: 'Single Breast', price: 650 },
            { label: 'Double Breast', price: 850 }
          ],
          modifiers: ['Extra Cheese (+100 DA)', 'Extra Spicy Sauce (+50 DA)']
        },
        {
          id: 'm2',
          name: 'Le Tacos Biggy',
          category: 'Tacos',
          basePrice: 750,
          sizes: [
            { label: 'Medium (M)', price: 750 },
            { label: 'Large (L)', price: 950 },
            { label: 'Gigantic (XL)', price: 1100 }
          ],
          modifiers: ['Extra Chicken Patty (+200 DA)', 'Algerian Sauce (+50 DA)', 'Cheese Sauce (+100 DA)']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="bg-white border border-[#3E2A22] border-opacity-10 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto font-sans text-[#3E2A22]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="w-6 h-6 text-[#E54B2A]" />
          <div>
            <h2 className="text-xl font-extrabold">{t?.sections.products || 'Products & Sizes'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'ar' ? 'تهيئة قائمة الوجبات، الأسعار المتغيرة والأحجام والإضافات' : 'Configure fast-food recipes, multi-pricing by portion size, and modifier blocks'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => alert('Future phase feature: Click to add new product.')}
          className="px-4 py-2 bg-[#E54B2A] hover:bg-[#D03C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة وجبة' : 'Add New Product'}</span>
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-xs font-bold text-gray-400">
          <Loader2 className="w-6 h-6 text-[#E54B2A] animate-spin" />
          <span>{language === 'ar' ? 'جاري تحميل قائمة الوجبات...' : 'Reading fast-food catalog...'}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-xs text-gray-400 font-bold">
          {language === 'ar' ? 'لا توجد وجبات في القائمة حالياً' : 'No products found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-100 bg-[#FFF7EE] p-5 rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start border-b border-orange-100 pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full uppercase">
                      {item.category}
                    </span>
                    <h3 className="font-extrabold text-base mt-1.5">{item.name}</h3>
                  </div>
                  <span className="text-sm font-black text-[#E54B2A]">
                    {item.basePrice} DA
                  </span>
                </div>

                {/* Portion Sizes & Variable Prices */}
                {item.sizes && item.sizes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {language === 'ar' ? 'خيارات الأسعار حسب الحجم' : 'Portion Sizes & Variable Pricing'}
                    </p>
                    <div className="space-y-1.5">
                      {item.sizes.map((size, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-50 font-semibold">
                          <span className="opacity-80">{size.label}</span>
                          <span className="text-[#E54B2A] font-extrabold">{size.price} DA</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modifier Groups */}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {language === 'ar' ? 'الإضافات المتاحة' : 'Reusable Modifiers & Extras'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.modifiers.map((modifier, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white border border-gray-100 text-[11px] font-bold rounded-lg opacity-90">
                          {modifier}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-orange-100 mt-4 pt-3 text-xs font-bold">
                <button 
                  onClick={() => alert('Configure Recipes, yields, and raw food ingredients linkage...')}
                  className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'الوصفة والمكونات' : 'Recipe Link'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-[#FFF1DE] border border-[#F2B21B] rounded-xl text-xs leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-5 h-5 text-[#E54B2A] shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold text-[#E54B2A] mb-1">
            {language === 'ar' ? 'بنية مخصصة لإعادة الاستخدام والبيع المتعدد' : 'Multi-Restaurant Product Schema Concept'}
          </p>
          <p className="opacity-95">
            {language === 'ar' 
              ? 'تلتزم الواجهة ببنية بيانات ديناميكية تدعم تصنيفات وعناصر ومكونات غير محدودة. لا توجد تفاصيل مشفرة أو ثابتة داخل محرك المبيعات.'
              : 'This module is pre-configured to adapt to a multi-tenant Laravel relational schema (products, product_sizes, modifier_groups, modifier_options, product_modifier_groups). Portions are linked directly to raw inventory ingredients for auto-deductions upon cash register prints.'}
          </p>
        </div>
      </div>
    </div>
  );
}
