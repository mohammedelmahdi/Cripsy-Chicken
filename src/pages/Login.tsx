import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { KeyRound, Delete, Sparkles } from 'lucide-react';

export default function Login() {
  const { loginWithPin } = useAuth();
  const { t, language, setLanguage, dir } = useLanguage();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleKeyPress = (num: string) => {
    setError(null);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-submit when 4 digits are reached
      if (newPin.length === 4) {
        triggerLogin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setError(null);
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(null);
    setPin('');
  };

  const triggerLogin = async (finalPin: string) => {
    setIsSubmitting(true);
    try {
      await loginWithPin(finalPin);
      navigate('/');
    } catch (err) {
      setError(t.auth.invalidPin);
      setPin(''); // Reset PIN on error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-[#FFF7EE] text-[#3E2A22] p-4 font-sans" dir={dir}>
      {/* Brand & Guide Side */}
      <div className="w-full md:w-1/2 max-w-md p-8 flex flex-col justify-center text-center md:text-left mb-8 md:mb-0">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#E54B2A] flex items-center justify-center text-[#FFF7EE] font-bold text-2xl shadow-md border-2 border-[#F2B21B]">
            C
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#E54B2A]">
              Cripsy
            </h1>
            <p className="text-xs uppercase tracking-widest font-semibold text-[#3E2A22] opacity-80">
              Chicken POS
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">
          {language === 'ar' ? 'نظام المبيعات وإدارة المطعم' : 'Commercial POS Solution'}
        </h2>
        
        <p className="text-sm opacity-90 leading-relaxed mb-6">
          {language === 'ar' 
            ? 'نظام تشغيل وإدارة مطاعم Cripsy Chicken مع ميزات البيع المباشر، مخطط الطاولات والمستودع.' 
            : 'Operational system built specifically for fast-food, burger, and taco businesses with integrated offline safety and multi-role operations.'}
        </p>

        {/* PIN Code Quick Help Card */}
        <div className="bg-[#FFF1DE] border border-[#F2B21B] rounded-xl p-4 shadow-sm text-xs">
          <div className="flex items-center gap-2 mb-2 font-bold text-[#E54B2A]">
            <Sparkles className="w-4 h-4" />
            <span>{language === 'ar' ? 'رموز الموظفين التجريبية (PIN)' : 'Demo Staff PIN Codes'}</span>
          </div>
          <ul className="space-y-1 opacity-90">
            <li><strong>1234</strong> - {language === 'ar' ? 'كاشير (كريم)' : 'Cashier (Karim)'}</li>
            <li><strong>9999</strong> - {language === 'ar' ? 'مدير المطعم (أمين)' : 'Manager (Amine)'}</li>
            <li><strong>0000</strong> - {language === 'ar' ? 'المسؤول العام (صوفيا)' : 'System Admin (Sofia)'}</li>
            <li><strong>5555</strong> - {language === 'ar' ? 'المطبخ (ياسين)' : 'Kitchen / Chef (Yacine)'}</li>
          </ul>
        </div>

        {/* Language Selection Toggle */}
        <div className="mt-6 flex justify-center md:justify-start gap-4">
          <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-[#E54B2A] text-white shadow-sm' : 'border border-[#3E2A22] border-opacity-20 hover:bg-[#FFF1DE]'}`}
          >
            English (LTR)
          </button>
          <button 
            onClick={() => setLanguage('ar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'ar' ? 'bg-[#E54B2A] text-white shadow-sm' : 'border border-[#3E2A22] border-opacity-20 hover:bg-[#FFF1DE]'}`}
          >
            العربية (RTL)
          </button>
        </div>
      </div>

      {/* Terminal PIN Pad Side */}
      <div className="w-full md:w-1/2 max-w-sm bg-white border border-[#3E2A22] border-opacity-10 shadow-xl rounded-2xl p-6 md:p-8 flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-[#FFF1DE] flex items-center justify-center text-[#E54B2A] mb-3">
          <KeyRound className="w-5 h-5" />
        </div>
        
        <h3 className="text-lg font-bold text-[#3E2A22] mb-1 text-center">
          {t.auth.enterPin}
        </h3>
        <p className="text-xs opacity-70 mb-6 text-center">
          {language === 'ar' ? 'الرجاء إدخال الرمز السري للمتابعة' : 'Please type your security pin to enter'}
        </p>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 border-[#E54B2A] transition-all duration-150 ${
                pin.length > index ? 'bg-[#E54B2A]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 text-xs font-semibold text-[#E54B2A] bg-red-50 px-3 py-2 rounded-lg text-center w-full">
            {error}
          </div>
        )}

        {/* PIN Keyboard Pad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              disabled={isSubmitting}
              className="h-16 rounded-xl bg-[#FFF7EE] hover:bg-[#FFEBD4] text-[#3E2A22] font-bold text-xl flex items-center justify-center transition-all border border-[#3E2A22] border-opacity-5 active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            disabled={isSubmitting}
            className="h-16 rounded-xl text-xs font-bold text-[#E54B2A] hover:bg-red-50 flex items-center justify-center active:scale-95 uppercase tracking-wider"
          >
            {t.auth.clear}
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            disabled={isSubmitting}
            className="h-16 rounded-xl bg-[#FFF7EE] hover:bg-[#FFEBD4] text-[#3E2A22] font-bold text-xl flex items-center justify-center transition-all border border-[#3E2A22] border-opacity-5 active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="h-16 rounded-xl text-[#3E2A22] opacity-80 hover:bg-[#FFF7EE] flex items-center justify-center active:scale-95"
            aria-label="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
