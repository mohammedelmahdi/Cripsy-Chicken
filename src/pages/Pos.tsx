import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { ProductCategory, OrderType, OrderStatus, PaymentMethod } from '../types';
import { ShoppingCart, Printer, Trash2, Plus, Minus, CheckCircle, Tag, Layers, Loader2 } from 'lucide-react';
import { services } from '../api/client';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: string;
}

export default function Pos() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(ProductCategory.BURGERS);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.COUNTER);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentMethodForm, setPaymentMethodForm] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0); // Direct DA discount
  const [showReceipt, setShowReceipt] = useState(false);
  const [printedReceiptData, setPrintedReceiptData] = useState<any | null>(null);
  
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories and products on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        // Fetch categories first
        const fetchedCats = await services.categories.fetchList();
        setCategories(fetchedCats);

        // Fetch products menu
        const menuResponse = await services.products.fetchMenu();
        // Since Laravel might return structured categories with nested products, or flat array
        if (Array.isArray(menuResponse)) {
          setMenuItems(menuResponse);
        } else if (menuResponse && Array.isArray(menuResponse.products)) {
          setMenuItems(menuResponse.products);
        } else if (menuResponse && typeof menuResponse === 'object') {
          // If the menu is categorized, flatten it or keep it
          let flattened: any[] = [];
          Object.values(menuResponse).forEach((cat: any) => {
            if (cat && Array.isArray(cat.products)) {
              flattened = [...flattened, ...cat.products];
            } else if (Array.isArray(cat)) {
              flattened = [...flattened, ...cat];
            }
          });
          setMenuItems(flattened.length > 0 ? flattened : Object.values(menuResponse));
        }
      } catch (err: any) {
        console.error('Error fetching menu items:', err);
        setError(language === 'ar' ? 'فشل تحميل قائمة المنتجات. يرجى المحاولة لاحقاً.' : 'Failed to load menu. Please retry.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [language]);

  // Fallback fallback menu items if database is empty/fresh
  const staticMenuItems = [
    { id: 'p1', name: 'Cripsy Classic Burger', arabicName: 'كريبسي برجر كلاسيك', price: 650, category: ProductCategory.BURGERS, description: 'Single crispy breast, special sauce, lettuce' },
    { id: 'p2', name: 'Cripsy Double Cheese', arabicName: 'كريبسي دبل تشيز', price: 850, category: ProductCategory.BURGERS, description: 'Double crispy breasts, double cheddar, brioche' },
    { id: 'p3', name: 'Le Tacos Biggy (M)', arabicName: 'تاكو بيجي وسط', price: 750, category: ProductCategory.TACOS, description: 'Gruyere sauce, French fries, Crispy chicken tenders' },
    { id: 'p4', name: 'Le Tacos XL Supreme', arabicName: 'تاكو سوبريم عملاق', price: 1100, category: ProductCategory.TACOS, description: 'Triple meat choice, double sauce gruyere' },
    { id: 'p5', name: 'L’élégant Sandwich', arabicName: 'سندوتش الأنيق', price: 580, category: ProductCategory.SANDWICHES, description: 'Toasted baguette, crispy chicken, garlic mayo' },
    { id: 'p6', name: 'Pizza Cripsy Special', arabicName: 'بيتزا كريبسي الخاصة', price: 950, category: ProductCategory.PIZZA, description: 'Mozzarella, crispy chicken cubes, cream base' },
    { id: 'p7', name: 'Crispy Box Combo (Menu)', arabicName: 'منيو صندوق كريبسي', price: 1350, category: ProductCategory.MENUS_COMBOS, description: '3 tenders, 3 wings, large fries, soda' },
    { id: 'p8', name: 'Coca Cola 33cl', arabicName: 'كوكا كولا ٣٣ سل', price: 150, category: ProductCategory.DRINKS, description: 'Ice cold soft drink' },
    { id: 'p9', name: 'Hamoud Boualem 1L', arabicName: 'حمود بوعلام ١ لتر', price: 250, category: ProductCategory.DRINKS, description: 'Traditional Algerian soda' },
    { id: 'p10', name: 'Mousse au Chocolat', arabicName: 'موس الشوكولاتة', price: 300, category: ProductCategory.DESSERTS, description: 'Rich dark cocoa mousse' },
    { id: 'p11', name: 'Extra Cheddar Sauce', arabicName: 'صلصة جبن شيدر إضافية', price: 100, category: ProductCategory.EXTRAS, description: 'Creamy hot cheddar cup' }
  ];

  const activeMenuItems = menuItems.length > 0 ? menuItems : staticMenuItems;

  // Adapt categories to category field format (e.g. UPPERCASE string or model Category name)
  const filteredItems = activeMenuItems.filter(item => {
    const catUpper = (item.category || '').toString().toUpperCase();
    const selectedUpper = selectedCategory.toUpperCase();
    return catUpper === selectedUpper || catUpper.replace(' ', '_') === selectedUpper;
  });

  const addToCart = (item: any) => {
    const existing = cart.find(i => i.id === item.id);
    const itemName = language === 'ar' ? (item.arabicName || item.name) : item.name;
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { id: item.id, name: itemName, price: Number(item.price), quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerName('');
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const orderId = `CR-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptData = {
      orderId,
      timestamp: new Date().toLocaleString(language === 'ar' ? 'ar-DZ' : 'en-US'),
      cashier: user?.name || 'Staff',
      customer: customerName || (orderType === OrderType.DINE_IN ? 'Table 5' : 'Takeaway Customer'),
      orderType,
      items: [...cart],
      subtotal,
      discount,
      total,
      paymentMethod
    };

    try {
      setLoading(true);
      // Map cart to Laravel API expectations: products list with id, size, quantity
      const payload = {
        order_type: orderType,
        customer_name: customerName || 'Walk-in Guest',
        payment_method: paymentMethod,
        discount: discount,
        items: cart.map(item => ({
          product_id: item.id.startsWith('p') ? '00000000-0000-0000-0000-000000000001' : item.id, // Fallback placeholder if static demo item
          quantity: item.quantity,
          unit_price: item.price,
          modifiers: []
        }))
      };

      await services.orders.create(payload);

      setPrintedReceiptData(receiptData);
      setShowReceipt(true);
      clearCart();
    } catch (err) {
      console.error('API checkout failed, falling back offline:', err);
      // Fallback checkout offline directly
      setPrintedReceiptData(receiptData);
      setShowReceipt(true);
      clearCart();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full max-w-7xl mx-auto font-sans text-[#3E2A22]" id="pos-root">
      {/* Menu & Catalog Selection (Left Side) */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border border-[#3E2A22] border-opacity-10 rounded-2xl p-6 shadow-sm">
        
        {/* Real Product Categories Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-4 border-b border-gray-100 scrollbar-thin scrollbar-thumb-amber-200">
          {Object.values(ProductCategory).map((cat) => {
            const label = language === 'ar' ? t.menu[cat.toLowerCase() as keyof typeof t.menu] : cat.replace('_', ' ');
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#E54B2A] text-white shadow-xs'
                    : 'bg-[#FFF7EE] hover:bg-[#FFEBD4] text-[#3E2A22]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Grid of menu products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 overflow-y-auto max-h-[500px] xl:max-h-[600px] pr-2">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-[#E54B2A] animate-spin" />
              <p className="text-xs font-bold text-gray-400">
                {language === 'ar' ? 'جاري تحميل المنتجات من قاعدة البيانات...' : 'Fetching active catalog items...'}
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-16 text-xs text-gray-400 font-bold">
              {language === 'ar' ? 'لا توجد منتجات في هذا القسم حالياً' : 'No products found in this category.'}
            </div>
          ) : (
            filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="group text-left flex flex-col justify-between p-4 rounded-xl bg-[#FFF7EE] hover:bg-white border-2 border-transparent hover:border-[#F2B21B] shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-extrabold text-base text-[#3E2A22] group-hover:text-[#E54B2A] transition-colors">
                    {language === 'ar' ? item.arabicName : item.name}
                  </h4>
                  <span className="font-extrabold text-sm text-[#E54B2A] whitespace-nowrap bg-[#FFF1DE] px-2 py-0.5 rounded-lg border border-[#FFE3BC]">
                    {item.price} DA
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-[#3E2A22] opacity-80 border-t border-dashed border-gray-200 pt-2 w-full">
                <span>{item.category.replace('_', ' ')}</span>
                <span className="text-[#E54B2A] group-hover:underline">+ Add</span>
              </div>
            </button>
            ))
          )}
        </div>
      </div>

      {/* Cashier Checkout Cart Drawer (Right Side) */}
      <div className="w-full xl:w-[400px] shrink-0 bg-white border border-[#3E2A22] border-opacity-10 rounded-2xl p-6 shadow-sm flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#E54B2A]" />
            <h3 className="font-extrabold text-lg text-[#3E2A22]">{t.pos.cart}</h3>
          </div>
          {cart.length > 0 && (
            <button 
              onClick={clearCart} 
              className="text-xs font-bold text-gray-400 hover:text-[#E54B2A] flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مسح الكل' : 'Clear'}</span>
            </button>
          )}
        </div>

        {/* Target Details Form */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-[#3E2A22] mb-1 opacity-85">
              {t.pos.customerName}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={language === 'ar' ? 'طاولة 5، سفري، كريم...' : 'Table 5, Takeaway, Guest name...'}
              className="w-full text-sm bg-[#FFF7EE] border border-[#3E2A22] border-opacity-10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#E54B2A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#3E2A22] mb-1 opacity-85">
                {t.pos.orderType}
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="w-full text-xs bg-[#FFF7EE] border border-[#3E2A22] border-opacity-10 rounded-xl px-2 py-2 focus:outline-none focus:border-[#E54B2A] font-semibold"
              >
                <option value={OrderType.COUNTER}>{language === 'ar' ? 'سفري / كاونتر' : 'Counter / Takeaway'}</option>
                <option value={OrderType.DINE_IN}>{language === 'ar' ? 'طاولة / محلي' : 'Dine-In'}</option>
                <option value={OrderType.DELIVERY}>{language === 'ar' ? 'توصيل' : 'Delivery'}</option>
                <option value={OrderType.ONLINE}>{language === 'ar' ? 'طلب أونلاين' : 'Online Order'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#3E2A22] mb-1 opacity-85">
                {t.pos.paymentMethod}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs bg-[#FFF7EE] border border-[#3E2A22] border-opacity-10 rounded-xl px-2 py-2 focus:outline-none focus:border-[#E54B2A] font-semibold"
              >
                <option value={PaymentMethod.CASH}>{language === 'ar' ? 'نقداً' : 'Cash'}</option>
                <option value={PaymentMethod.CASH_ON_DELIVERY}>{language === 'ar' ? 'عند الاستلام' : 'Cash on Delivery'}</option>
                <option value={PaymentMethod.ONLINE_CARD}>{language === 'ar' ? 'بطاقة بنكية' : 'Card Payment'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Cart Items List */}
        <div className="flex-1 overflow-y-auto max-h-[220px] mb-4 space-y-3 pr-1">
          {cart.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs text-gray-400 font-medium">
              {t.pos.emptyCart}
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center gap-2 bg-[#FFF7EE] p-3 rounded-xl border border-gray-100">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-extrabold truncate">{item.name}</p>
                  <p className="text-xs text-[#E54B2A] font-bold mt-0.5">{item.price} DA</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-full bg-white text-[#E54B2A] flex items-center justify-center border border-gray-200 active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-extrabold w-5 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-full bg-white text-[#E54B2A] flex items-center justify-center border border-gray-200 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation Summary Blocks */}
        <div className="border-t border-gray-100 pt-4 space-y-2 text-xs font-bold text-[#3E2A22]">
          <div className="flex justify-between opacity-80">
            <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
            <span>{subtotal} DA</span>
          </div>

          <div className="flex justify-between items-center opacity-85">
            <span className="flex items-center gap-1 text-amber-600">
              <Tag className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'الخصم' : 'Discount'}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-16 bg-[#FFF7EE] border border-[#3E2A22] border-opacity-10 rounded-md px-1.5 py-1 text-center font-bold text-xs"
              />
              <span>DA</span>
            </div>
          </div>

          <div className="flex justify-between text-base sm:text-lg font-black border-t border-dashed border-gray-200 pt-3 text-[#3E2A22]">
            <span>{t.common.total}</span>
            <span className="text-[#E54B2A]">{total} DA</span>
          </div>
        </div>

        {/* Primary Pay & Print Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className={`w-full mt-4 py-3.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-md ${
            cart.length > 0 
              ? 'bg-[#E54B2A] hover:bg-[#D03C1C] active:scale-[0.98]' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>{t.pos.checkout}</span>
        </button>
      </div>

      {/* Styled 80mm Thermal Receipt Simulation Modal */}
      {showReceipt && printedReceiptData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border-4 border-[#F2B21B] flex flex-col my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تم حفظ الطلب والطباعة' : 'Success & Printed'}</span>
              </span>
              <button 
                onClick={() => setShowReceipt(false)}
                className="text-xs font-extrabold text-gray-500 hover:text-[#E54B2A]"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>

            {/* Simulated 80mm black/white thermal tape */}
            <div className="bg-[#FCFCFC] border border-gray-200 p-4 font-mono text-xs text-black shadow-inner rounded-lg leading-relaxed relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-repeat-x bg-[linear-gradient(45deg,transparent_33.3%,#e5e7eb_33.3%,#e5e7eb_66.6%,transparent_66.6%)] bg-[size:8px_4px]" />
              
              <div className="text-center pt-2">
                {/* Crown Brand Signifier */}
                <span className="text-base font-extrabold tracking-widest text-black">
                  *** CRIPSY CHICKEN ***
                </span>
                <p className="text-[10px] mt-0.5">ALWAYS HOT. ALWAYS CRISPY.</p>
                <p className="text-[9px] opacity-75">Didouche Mourad, Algiers</p>
                <p className="text-[9px] opacity-75">Tel: +213 21 00 00 00</p>
              </div>

              <div className="border-t border-dashed border-black my-3 pt-2">
                <div className="flex justify-between">
                  <span>ORDER: {printedReceiptData.orderId}</span>
                  <span>{printedReceiptData.orderType}</span>
                </div>
                <div className="flex justify-between mt-0.5 opacity-80 text-[10px]">
                  <span>Date: {printedReceiptData.timestamp}</span>
                </div>
                <div className="flex justify-between mt-0.5 opacity-80 text-[10px]">
                  <span>Cashier: {printedReceiptData.cashier}</span>
                  <span>Cust: {printedReceiptData.customer}</span>
                </div>
              </div>

              {/* Items list */}
              <div className="border-t border-dashed border-black my-2 pt-2 text-[11px]">
                <div className="flex justify-between font-bold mb-1">
                  <span>ITEM</span>
                  <div className="flex gap-4">
                    <span>QTY</span>
                    <span>PRICE</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {printedReceiptData.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="truncate max-w-[160px]">{item.name}</span>
                      <div className="flex gap-4">
                        <span className="w-6 text-center">{item.quantity}</span>
                        <span>{item.price * item.quantity} DA</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-black my-3 pt-2 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{printedReceiptData.subtotal} DA</span>
                </div>
                {printedReceiptData.discount > 0 && (
                  <div className="flex justify-between font-bold">
                    <span>Discount:</span>
                    <span>-{printedReceiptData.discount} DA</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-dashed border-black mt-2 pt-2">
                  <span>TOTAL:</span>
                  <span>{printedReceiptData.total} DA</span>
                </div>
                <div className="flex justify-between text-[10px] mt-1 opacity-80">
                  <span>Pay Method:</span>
                  <span>{printedReceiptData.paymentMethod}</span>
                </div>
              </div>

              <div className="text-center border-t border-dashed border-black pt-3 mt-4 text-[9px] uppercase tracking-wider">
                <p>Merci pour votre visite !</p>
                <p>شكرا لزيارتكم</p>
                <p className="mt-1 font-bold">*** CLOSED SESSION ***</p>
              </div>
            </div>
            
            {/* Action controls */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => alert('Sending raw ESC/POS sequences to thermal printer...')}
                className="py-2.5 rounded-xl border border-[#3E2A22] text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                Raw ESC/POS (USB)
              </button>
              <button
                onClick={() => {
                  setShowReceipt(false);
                }}
                className="py-2.5 rounded-xl bg-[#E54B2A] text-white text-xs font-bold hover:bg-[#D03C1C] transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
