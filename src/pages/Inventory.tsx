import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Package, AlertTriangle, Sliders, History, Loader2 } from 'lucide-react';
import { services } from '../api/client';

interface Ingredient {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minLevel: number;
  status: 'GOOD' | 'LOW' | 'OUT';
}

export default function Inventory() {
  const { t, language } = { ...useLanguage() };
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStock = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await services.inventory.fetchStock();
      
      if (Array.isArray(res)) {
        const mapped: Ingredient[] = res.map((item: any) => {
          const stock = Number(item.stock_qty || item.quantity || 0);
          const minLevel = Number(item.min_level || 10);
          let status: 'GOOD' | 'LOW' | 'OUT' = 'GOOD';
          if (stock <= 0) {
            status = 'OUT';
          } else if (stock <= minLevel) {
            status = 'LOW';
          }
          return {
            id: item.id,
            name: item.name || 'Raw Ingredient',
            stock,
            unit: item.unit || 'KG',
            minLevel,
            status
          };
        });
        setIngredients(mapped);
      }
    } catch (err: any) {
      console.error('Failed to fetch stock levels from Laravel API:', err);
      setError(language === 'ar' ? 'فشل الاتصال بخادم المخزون.' : 'Failed to connect to inventory servers.');
      // Standalone demo fallback
      setIngredients([
        { id: 'i1', name: 'Fresh Chicken Breast', stock: 12.5, unit: 'KG', minLevel: 5.0, status: 'GOOD' },
        { id: 'i2', name: 'Brioche Burger Buns', stock: 18, unit: 'PCS', minLevel: 40, status: 'LOW' },
        { id: 'i3', name: 'Cheddar Cheese Slices', stock: 150, unit: 'PCS', minLevel: 100, status: 'GOOD' },
        { id: 'i4', name: 'Le Tacos Tortilla 30cm', stock: 24, unit: 'PCS', minLevel: 50, status: 'LOW' },
        { id: 'i5', name: 'Frying Oil Premium', stock: 0, unit: 'Liters', minLevel: 20, status: 'OUT' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const handleAdjust = async (id: string) => {
    const qtyStr = prompt(language === 'ar' ? 'أدخل كمية التعديل الجديدة:' : 'Enter adjustment quantity (use negative to reduce stock, e.g. -2.5):');
    if (!qtyStr || isNaN(Number(qtyStr))) return;
    
    const quantity = Number(qtyStr);
    const reason = prompt(language === 'ar' ? 'أدخل سبب التعديل (اختياري):' : 'Enter reason for change (optional):') || 'Manual POS adjustment';
    
    try {
      setLoading(true);
      await services.inventory.adjustStock({
        ingredient_id: id,
        quantity,
        type: quantity >= 0 ? 'PURCHASE' : 'WASTAGE',
        reason
      });
      alert(language === 'ar' ? 'تم تعديل المخزون بنجاح.' : 'Stock level modified successfully.');
      await loadStock();
    } catch (err) {
      console.error('Failed to post stock level adjustment:', err);
      alert(language === 'ar' ? 'فشل تعديل المخزون على السيرفر.' : 'Server stock modification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Compute stat counts
  const outCount = ingredients.filter(i => i.status === 'OUT').length;
  const lowCount = ingredients.filter(i => i.status === 'LOW').length;
  const healthyCount = ingredients.filter(i => i.status === 'GOOD').length;

  return (
    <div className="bg-white border border-[#3E2A22] border-opacity-10 rounded-2xl p-6 shadow-sm max-w-5xl mx-auto font-sans text-[#3E2A22]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-[#E54B2A]" />
          <div>
            <h2 className="text-xl font-extrabold">{t?.sections.inventory || 'Inventory & Stock'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'ar' ? 'إدارة المواد الأولية والمكونات ومستوى الهدر والحدود الدنيا للأمان' : 'Track raw food ingredients, recipe usages, and low-level safety thresholds'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-red-700 uppercase tracking-wider">{language === 'ar' ? 'نفدت بالكامل' : 'Out of Stock'}</p>
            <p className="text-2xl font-black text-[#E54B2A] mt-1">{outCount} {language === 'ar' ? 'مادة' : 'item'}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-[#E54B2A] opacity-70" />
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">{language === 'ar' ? 'تحت الحد الأدنى' : 'Low Stock Alert'}</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{lowCount} {language === 'ar' ? 'مواد' : 'items'}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500 opacity-70" />
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">{language === 'ar' ? 'في مستوى آمن' : 'Healthy Levels'}</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{healthyCount} {language === 'ar' ? 'مواد' : 'items'}</p>
          </div>
          <Package className="w-8 h-8 text-emerald-500 opacity-70" />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
              <th className="py-3 px-2">{language === 'ar' ? 'المادة الأولية' : 'Raw Ingredient'}</th>
              <th className="py-3 px-2">{language === 'ar' ? 'المستودع الحالي' : 'Stock Level'}</th>
              <th className="py-3 px-2">{language === 'ar' ? 'الحد الأدنى للأمان' : 'Safety Min'}</th>
              <th className="py-3 px-2">{language === 'ar' ? 'حالة التوفر' : 'Status'}</th>
              <th className="py-3 px-2 text-center">{language === 'ar' ? 'تعديل مخزون' : 'Manual Adjust'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs sm:text-sm font-semibold">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-[#E54B2A] animate-spin" />
                    <span>{language === 'ar' ? 'جاري تحميل المواد والمخزون...' : 'Syncing warehouse inventory logs...'}</span>
                  </div>
                </td>
              </tr>
            ) : ingredients.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">
                  {language === 'ar' ? 'لا توجد عناصر مخزون حالياً' : 'No inventory items recorded.'}
                </td>
              </tr>
            ) : (
              ingredients.map((ing) => {
              let statusBadge = <span className="px-2 py-0.5 rounded-lg text-[10px] bg-emerald-50 text-emerald-700 font-extrabold uppercase">OK</span>;
              if (ing.status === 'LOW') {
                statusBadge = <span className="px-2 py-0.5 rounded-lg text-[10px] bg-amber-50 text-amber-700 font-extrabold uppercase">LOW</span>;
              } else if (ing.status === 'OUT') {
                statusBadge = <span className="px-2 py-0.5 rounded-lg text-[10px] bg-red-50 text-[#E54B2A] font-extrabold uppercase">OUT</span>;
              }

              return (
                <tr key={ing.id} className="hover:bg-[#FFF7EE] transition-colors">
                  <td className="py-4 px-2">{ing.name}</td>
                  <td className="py-4 px-2 font-mono font-extrabold text-base">
                    {ing.stock} <span className="text-xs text-gray-400 font-bold">{ing.unit}</span>
                  </td>
                  <td className="py-4 px-2 font-mono text-gray-500">
                    {ing.minLevel} {ing.unit}
                  </td>
                  <td className="py-4 px-2">{statusBadge}</td>
                  <td className="py-4 px-2 text-center">
                    <button
                      onClick={() => handleAdjust(ing.id)}
                      className="p-1.5 rounded-lg bg-white text-[#E54B2A] border border-gray-200 hover:bg-[#FFF1DE] hover:border-[#F2B21B] transition-all inline-flex items-center justify-center active:scale-90"
                      title="Adjust Inventory Manual"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>

      {/* Historical Stock Logs concept */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-5 h-5 text-[#E54B2A]" />
          <h3 className="font-extrabold text-base">{language === 'ar' ? 'سجل الحركات الأخيرة' : 'Stock Movements History Log'}</h3>
        </div>
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-[#FFF7EE] rounded-xl flex justify-between items-center font-semibold">
            <div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-black rounded-lg text-[9px] uppercase mr-2">Inbound</span>
              <span>Purchased Fresh Chicken Breast from Supplier S1 (+50 KG)</span>
            </div>
            <span className="text-gray-400">1 hour ago</span>
          </div>
          <div className="p-3 bg-[#FFF7EE] rounded-xl flex justify-between items-center font-semibold">
            <div>
              <span className="px-2 py-0.5 bg-red-50 text-[#E54B2A] font-black rounded-lg text-[9px] uppercase mr-2">Wastage</span>
              <span>Discarded spoiled Brioche Burger Buns (-5 PCS)</span>
            </div>
            <span className="text-gray-400">Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
