import { RestaurantConfig, TranslationSchema } from '../types';

/**
 * Default multi-restaurant-ready system configuration
 * Fully tailored to the Cripsy Chicken brand visual guidelines.
 */
export const DEFAULT_RESTAURANT_CONFIG: RestaurantConfig = {
  id: 'cripsy-chicken-algiers',
  name: 'Cripsy Chicken',
  address: 'Didouche Mourad, Algiers, Algeria',
  phone: '+213 21 00 00 00',
  currency: 'DA',
  defaultLanguage: 'en', // Supports switching to English or Arabic
  branding: {
    primaryColor: '#E54B2A',    // Crispy Orange
    accentColor: '#F2B21B',     // Golden Crunch
    backgroundColor: '#FFF7EE', // Cream White
    textColor: '#3E2A22',       // Dark Cocoa
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  receiptSettings: {
    showLogo: true,
    headerText: 'ALWAYS HOT. ALWAYS CRISPY.',
    footerText: 'Thank you for your visit! / شكرا لزيارتكم',
    showCashierName: true,
    printKitchenTicket: true
  },
  printerSettings: {
    paperWidth: '80mm',
    printCopies: 1
  }
};

/**
 * Localization translations supporting English (LTR) and Arabic (RTL).
 */
export const TRANSLATIONS: Record<'en' | 'ar', TranslationSchema> = {
  en: {
    common: {
      dashboard: 'Dashboard',
      login: 'Login',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      back: 'Back',
      search: 'Search...',
      status: 'Status',
      actions: 'Actions',
      total: 'Total',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Operation successful'
    },
    auth: {
      enterPin: 'Enter Staff PIN',
      invalidPin: 'Invalid security PIN code',
      authRequired: 'Authentication required',
      loginSuccess: 'Logged in successfully',
      clear: 'Clear'
    },
    pos: {
      title: 'Point of Sale',
      newOrder: 'New Order',
      cart: 'Current Cart',
      checkout: 'Pay & Print',
      selectCategory: 'Select Category',
      emptyCart: 'Cart is empty. Select products from the menu.',
      customerName: 'Customer Name / Table',
      paymentMethod: 'Payment Method',
      orderType: 'Order Type'
    },
    menu: {
      burgers: 'Burgers',
      tacos: 'Tacos',
      sandwiches: 'Sandwiches',
      pizza: 'Pizza',
      combos: 'Combos / Menus',
      drinks: 'Drinks',
      desserts: 'Desserts',
      extras: 'Extras',
      other: 'Other'
    },
    sections: {
      pos: 'POS & Ordering',
      tables: 'Tables Layout',
      orders: 'Order History',
      onlineOrders: 'Online Orders',
      products: 'Products & Sizes',
      inventory: 'Inventory & Stock',
      suppliers: 'Suppliers Directory',
      expenses: 'Expenses',
      reports: 'Business Reports',
      staff: 'Staff & PIN Codes',
      settings: 'POS Settings',
      auditLog: 'Audit Trail'
    }
  },
  ar: {
    common: {
      dashboard: 'لوحة التحكم',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      save: 'حفظ',
      cancel: 'إلغاء',
      back: 'رجوع',
      search: 'بحث...',
      status: 'الحالة',
      actions: 'الإجراءات',
      total: 'المجموع',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ غير متوقع',
      success: 'تمت العملية بنجاح'
    },
    auth: {
      enterPin: 'أدخل رمز PIN للموظف',
      invalidPin: 'رمز PIN غير صالح',
      authRequired: 'يتطلب تسجيل الدخول',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      clear: 'مسح'
    },
    pos: {
      title: 'نقطة البيع',
      newOrder: 'طلب جديد',
      cart: 'السلة الحالية',
      checkout: 'دفع وطباعة الفاتورة',
      selectCategory: 'اختر تصنيف',
      emptyCart: 'السلة فارغة. اختر وجبات من القائمة.',
      customerName: 'اسم الزبون / رقم الطاولة',
      paymentMethod: 'طريقة الدفع',
      orderType: 'نوع الطلب'
    },
    menu: {
      burgers: 'البرجر',
      tacos: 'التاكو',
      sandwiches: 'السندوتشات',
      pizza: 'البيتزا',
      combos: 'وجبات كومبو',
      drinks: 'المشروبات',
      desserts: 'التحلية',
      extras: 'الإضافات',
      other: 'أخرى'
    },
    sections: {
      pos: 'نقطة البيع والتسجيل',
      tables: 'مخطط الطاولات',
      orders: 'سجل الطلبات',
      onlineOrders: 'الطلبات أونلاين',
      products: 'الوجبات والأحجام',
      inventory: 'المخزون والمستودع',
      suppliers: 'قائمة الموردين',
      expenses: 'المصاريف النثرية',
      reports: 'التقارير المالية',
      staff: 'الموظفين ورموز الدخول',
      settings: 'إعدادات النظام',
      auditLog: 'سجل المراجعة والأمان'
    }
  }
};
