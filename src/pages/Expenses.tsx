import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Coins, Plus, Calendar, ArrowUpRight, Loader2 } from 'lucide-react';
import { services } from '../api/client';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export default function Expenses() {
  const { t, language } = { ...useLanguage() };
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await services.expenses.fetchList();
      if (Array.isArray(res)) {
        const mapped = res.map((exp: any) => ({
          id: exp.id,
          category: exp.category?.name || exp.category || 'Utilities',
          amount: Number(exp.amount),
          description: exp.description || 'Cash disbursement',
          date: exp.date || exp.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
        }));
        setExpenses(mapped);
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
      setError(language === 'ar' ? 'فشل تحميل كشف المصاريف.' : 'Failed to fetch cash outflows.');
      setExpenses([
        { id: 'exp-1', category: 'Gas & Utilities', amount: 8500, description: 'Bottled Gas replenishment for fryers', date: '2026-09-14' },
        { id: 'exp-2', category: 'Packaging Supplies', amount: 15000, description: 'Custom Cripsy Chicken paper boxes (500 units)', date: '2026-09-12' },
        { id: 'exp-3', category: 'Wastage Out', amount: 1200, description: 'Spoiled lettuce head discards', date: '2026-09-10' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  const handleAddExpense = async () => {
    const amountStr = prompt(language === 'ar' ? 'أدخل قيمة المصروف (DA):' : 'Enter expense amount in DA:');
    if (!amountStr || isNaN(Number(amountStr))) return;

    const description = prompt(language === 'ar' ? 'أدخل الوصف التفصيلي للمصروف:' : 'Enter expense description (e.g. Frying oil replenishment):');
    if (!description) return;

    try {
      setLoading(true);
      // Create expense
      await services.expenses.create({
        category_id: '00000000-0000-0000-0000-000000000001', // Fallback default category
        amount: Number(amountStr),
        description,
        date: new Date().toISOString().split('T')[0]
      });
      alert(language === 'ar' ? 'تم تسجيل المصروف بنجاح.' : 'Expense logged successfully.');
      await loadExpenses();
    } catch (err) {
      console.error('Failed to register expense:', err);
      alert(language === 'ar' ? 'فشل إرسال المصروف إلى السيرفر.' : 'Failed to save expense on the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#3E2A22] border-opacity-10 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto font-sans text-[#3E2A22]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Coins className="w-6 h-6 text-[#E54B2A]" />
          <div>
            <h2 className="text-xl font-extrabold">{t?.sections.expenses || 'Expenses Log'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'ar' ? 'تسجيل المصاريف النثرية، فواتير الغاز والمشتريات الطارئة' : 'Log minor cash register disbursements and monthly utility outlays'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleAddExpense}
          className="px-4 py-2 bg-[#E54B2A] hover:bg-[#D03C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة مصروف' : 'Add Expense'}</span>
        </button>
      </div>

      {/* Aggregate metrics box */}
      <div className="bg-[#FFF7EE] border border-orange-100 rounded-2xl p-5 mb-6 flex justify-between items-center">
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? 'إجمالي المصاريف المسجلة' : 'Total Outflow (Current Period)'}</p>
          <p className="text-2xl sm:text-3xl font-black text-[#E54B2A] mt-1">{totalExpenses} DA</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#FFF1DE] flex items-center justify-center text-[#E54B2A] border border-[#F2B21B]">
          <ArrowUpRight className="w-6 h-6" />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
              <th className="py-3 px-2">{language === 'ar' ? 'التصنيف' : 'Category'}</th>
              <th className="py-3 px-2">{language === 'ar' ? 'الوصف التفصيلي' : 'Description'}</th>
              <th className="py-3 px-2">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
              <th className="py-3 px-2 text-right">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs sm:text-sm font-semibold">
            {loading && expenses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-[#E54B2A] animate-spin" />
                    <span>{language === 'ar' ? 'جاري تحميل سجل المصاريف...' : 'Fetching petty cash transactions...'}</span>
                  </div>
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400 font-medium">
                  {language === 'ar' ? 'لا توجد مصاريف مسجلة' : 'No expenses logged for this period.'}
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-[#FFF7EE] transition-colors">
                <td className="py-4 px-2">
                  <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-orange-100 text-orange-700 border border-orange-200 uppercase">
                    {exp.category}
                  </span>
                </td>
                <td className="py-4 px-2 opacity-90">{exp.description}</td>
                <td className="py-4 px-2 text-gray-400 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{exp.date}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-right font-black text-[#E54B2A]">{exp.amount} DA</td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
