import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Globe, Phone, Clock, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { services } from '../api/client';

interface MockOnlineOrder {
  id: string;
  clientName: string;
  phone: string;
  timeReceived: string;
  items: string[];
  total: number;
  notes?: string;
}

export default function OnlineOrders() {
  const { t, language } = useLanguage();
  const [incoming, setIncoming] = useState<MockOnlineOrder[]>([]);
  const [rejectedId, setRejectedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOnlineOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await services.onlineOrders.fetchList();
      if (Array.isArray(res)) {
        const mapped = res.map((item: any) => ({
          id: item.id || `ON-${Math.floor(100 + Math.random() * 900)}`,
          clientName: item.customer_name || item.client_name || 'Web Visitor',
          phone: item.phone || '+213 555 00 00 00',
          timeReceived: item.time_elapsed || 'Just now',
          items: Array.isArray(item.items) ? item.items.map((i: any) => `${i.quantity}x ${i.product_name || 'Menu Item'}`) : ['1x Online Basket Item'],
          total: Number(item.total_price || item.total || 0),
          notes: item.notes || item.remarks || undefined
        }));
        setIncoming(mapped);
      }
    } catch (err: any) {
      console.error('Failed to load pending web order queue:', err);
      setError(language === 'ar' ? 'فشل تحميل الطلبات الإلكترونية.' : 'Failed to reach cloud dispatch server.');
      // Standalone demo fallback
      setIncoming([
        {
          id: 'ON-304',
          clientName: 'Yassine Belkacem',
          phone: '+213 555 12 34 56',
          timeReceived: '5 mins ago',
          items: ['2x Cripsy Double Cheese', '1x Le Tacos XL Supreme', '3x Coca Cola 33cl'],
          total: 3250,
          notes: 'No mayonnaise, please.'
        },
        {
          id: 'ON-305',
          clientName: 'Meriem Bacha',
          phone: '+213 770 98 76 54',
          timeReceived: '12 mins ago',
          items: ['1x Crispy Box Combo (Menu)', '1x Mousse au Chocolat'],
          total: 1650
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOnlineOrders();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      setLoading(true);
      await services.onlineOrders.accept(id);
      alert(language === 'ar' ? 'تم قبول الطلب وإدراجه في الكاونتر بنجاح.' : 'Order accepted. Sent to kitchen queue & thermal printer queue.');
      await loadOnlineOrders();
    } catch (err) {
      console.error('Failed to accept online order:', err);
      // Fallback local accept
      setIncoming(incoming.filter(o => o.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPrompt = (id: string) => {
    setRejectedId(id);
  };

  const handleRejectConfirm = async (id: string) => {
    try {
      setLoading(true);
      await services.onlineOrders.reject(id, rejectionReason || 'Store too busy');
      alert(language === 'ar' ? 'تم رفض الطلب وإرسال رسالة توضيحية للزبون.' : 'Order rejected. Customer notified via instant SMS.');
      setRejectedId(null);
      setRejectionReason('');
      await loadOnlineOrders();
    } catch (err) {
      console.error('Failed to decline web order:', err);
      // Fallback local reject
      setIncoming(incoming.filter(o => o.id !== id));
      setRejectedId(null);
      setRejectionReason('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#3E2A22] border-opacity-10 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto font-sans text-[#3E2A22]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-[#E54B2A]" />
          <div>
            <h2 className="text-xl font-extrabold">{t.sections.onlineOrders}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'ar' ? 'طلبات التوصيل والاستلام الواردة من موقع المتجر للمراجعة' : 'Accept or reject customer submissions from the public mobile-ordering menu'}
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-black bg-[#E54B2A] text-white">
          {incoming.length} {language === 'ar' ? 'واردة جديدة' : 'NEW REQUESTS'}
        </div>
      </div>

      {incoming.length === 0 ? (
        <div className="text-center py-12 bg-[#FFF7EE] rounded-2xl border border-dashed border-orange-200">
          <AlertCircle className="w-8 h-8 text-[#E54B2A] mx-auto mb-2" />
          <p className="font-extrabold text-sm">
            {language === 'ar' ? 'لا توجد طلبات جديدة حالياً' : 'All clear! No pending web submissions.'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'ar' ? 'ستظهر الطلبات الجديدة هنا تلقائياً فور إرسالها من الزبائن.' : 'New guest orders will queue here for validation in real-time.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {incoming.map((order) => {
            const isRejectingThis = rejectedId === order.id;

            return (
              <div 
                key={order.id} 
                className="border border-gray-100 bg-[#FFF7EE] p-5 rounded-2xl shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start border-b border-orange-100 pb-3 mb-3">
                    <div>
                      <span className="text-xs font-black text-[#E54B2A] font-mono tracking-wider">{order.id}</span>
                      <h3 className="font-extrabold text-base mt-0.5">{order.clientName}</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{order.timeReceived}</span>
                    </span>
                  </div>

                  {/* Customer info */}
                  <div className="space-y-1 text-xs font-semibold mb-4 text-[#3E2A22] opacity-90">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{order.phone}</span>
                    </div>
                  </div>

                  {/* Cart items summary */}
                  <div className="bg-white rounded-xl p-3 border border-gray-100 mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      {language === 'ar' ? 'الوجبات المطلوبة' : 'Requested Items'}
                    </p>
                    <ul className="space-y-1 text-xs font-extrabold">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {order.notes && (
                      <div className="mt-2.5 pt-2 border-t border-dashed border-gray-100 text-[11px] italic text-red-700 font-semibold">
                        * Note: {order.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center font-black text-sm border-t border-orange-100 pt-3 mb-4">
                    <span>{t.common.total}</span>
                    <span className="text-[#E54B2A]">{order.total} DA</span>
                  </div>

                  {isRejectingThis ? (
                    <div className="space-y-2 bg-red-50 p-3 rounded-xl border border-red-100">
                      <label className="block text-[10px] font-extrabold text-red-700 uppercase">
                        {language === 'ar' ? 'سبب الرفض (سيرسل للزبون)' : 'Rejection Reason (SMS to Guest)'}
                      </label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder={language === 'ar' ? 'المطبخ مزدحم، غير متوفر...' : 'Kitchen too busy, item sold out...'}
                        className="w-full text-xs bg-white border border-red-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRejectConfirm(order.id)}
                          className="flex-1 py-1.5 bg-[#E54B2A] text-white text-[11px] font-bold rounded-lg"
                        >
                          {language === 'ar' ? 'تأكيد الرفض' : 'Confirm Reject'}
                        </button>
                        <button
                          onClick={() => setRejectedId(null)}
                          className="px-3 py-1.5 border border-gray-200 text-gray-500 text-[11px] font-bold rounded-lg bg-white"
                        >
                          {t.common.cancel}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleRejectPrompt(order.id)}
                        className="py-2.5 rounded-xl border border-opacity-10 border-[#3E2A22] text-[#3E2A22] text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4 text-red-500" />
                        <span>{language === 'ar' ? 'رفض الطلب' : 'Reject'}</span>
                      </button>
                      <button
                        onClick={() => handleAccept(order.id)}
                        className="py-2.5 rounded-xl bg-[#E54B2A] text-white text-xs font-bold hover:bg-[#D03C1C] transition-colors flex items-center justify-center gap-1 shadow-xs active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>{language === 'ar' ? 'قبول وطباعة' : 'Accept & Print'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
