
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'si';

interface Translations {
  [key: string]: {
    en: string;
    si: string;
  };
}

const translations: Translations = {
  // Navbar
  home: { en: 'Home', si: 'මුල් පිටුව' },
  submitReport: { en: 'Submit Report', si: 'වාර්තාවක් යොමුකරන්න' },
  checkStatus: { en: 'Check Status', si: 'තත්ත්වය පරීක්ෂා කරන්න' },
  adminLogin: { en: 'Admin Login', si: 'පරිපාලක පිවිසුම' },
  dashboard: { en: 'Dashboard', si: 'පුවරුව' },
  profile: { en: 'Profile', si: 'පැතිකඩ' },
  logout: { en: 'Logout', si: 'පිටවෙන්න' },
  about: { en: 'About Us', si: 'අප ගැන' },
  contact: { en: 'Contact', si: 'සම්බන්ධ වන්න' },
  
  // Landing Page
  heroTitle: { en: 'Protecting Children, Empowering Citizens.', si: 'දරුවන් සුරකිමු, පුරවැසියන් සවිබල ගන්වමු.' },
  heroSubtitle: { en: 'Break the Silence. Protect the Future.', si: 'නිශ්ශබ්දතාව බිඳින්න. අනාගතය සුරකින්න.' },
  heroDesc: { en: 'The Child Harassment & Abuse Reporting System (CHARS) provides a secure, anonymous bridge to justice.', si: 'ළමා හිරිහැර සහ අපයෝජන වාර්තා කිරීමේ පද්ධතිය (CHARS) යුක්තිය ඉටුකිරීම සඳහා ආරක්ෂිත සහ නිර්නාමික පාලමක් සපයයි.' },
  fileReportBtn: { en: 'File a Report', si: 'වාර්තාවක් ගොනු කරන්න' },
  trackStatusBtn: { en: 'Track Status', si: 'තත්ත්වය පරීක්ෂා කරන්න' },
  anonymousTitle: { en: 'Full Anonymity', si: 'පූර්ණ නිර්නාමිකභාවය' },
  anonymousDesc: { en: 'We do not log IP addresses or personal metadata for anonymous reports.', si: 'නිර්නාමික වාර්තා සඳහා අපි IP ලිපින හෝ පුද්ගලික දත්ත සටහන් නොකරමු.' },
  voiceTitle: { en: 'Voice Assistant', si: 'කටහඬ සහායක' },
  voiceDesc: { en: 'Our AI Voice Guardian can guide you through the process step-by-step.', si: 'අපගේ AI කටහඬ සහායකයා ඔබට පියවරෙන් පියවර මග පෙන්වනු ඇත.' },
  
  // Onboarding
  onboardingTitle: { en: 'Welcome to CHARS', si: 'CHARS වෙත ඔබව සාදරයෙන් පිළිගනිමු' },
  getStarted: { en: 'Get Started', si: 'ආරම්භ කරන්න' },
  next: { en: 'Next', si: 'මීළඟ' },
  privacyTitle: { en: 'Your Privacy is Absolute', si: 'ඔබේ පෞද්ගලිකත්වය සුරක්ෂිතයි' },
  privacyDesc: { en: 'Report safely without revealing your identity. We use end-to-end encryption to protect all submissions.', si: 'ඔබේ අනන්‍යතාවය හෙළි නොකර ආරක්ෂිතව වාර්තා කරන්න. අපි සියලුම ඉදිරිපත් කිරීම් ආරක්ෂා කිරීමට අන්තයේ සිට අන්තයටම සංකේතනය භාවිතා කරමු.' },
  voiceGuardianTitle: { en: 'AI Voice Guardian', si: 'AI කටහඬ ආරක්ෂකයා' },
  voiceGuardianDesc: { en: 'Struggling to find words? Our AI assistant helps you describe incidents calmly in your own language.', si: 'වචන සොයා ගැනීමට අපහසුද? අපගේ AI සහායකයා ඔබේම භාෂාවෙන් සිදුවීම් සන්සුන්ව විස්තර කිරීමට උපකාරී වේ.' },
  vaultTitle: { en: 'The Evidence Vault', si: 'සාක්ෂි සුරක්ෂිතාගාරය' },
  vaultDesc: { en: 'Securely upload photos, videos, or documents directly to specialized law enforcement units.', si: 'ඡායාරූප, වීඩියෝ හෝ ලේඛන සෘජුවම විශේෂිත නීතිය ක්‍රියාත්මක කරන ඒකක වෙත ආරක්ෂිතව උඩුගත කරන්න.' },
  trackingTitle: { en: 'Anonymous Tracking', si: 'නිර්නාමික ලුහුබැඳීම' },
  trackingDesc: { en: 'Use your unique Case ID to monitor progress without ever needing an account or logging in.', si: 'ගිණුමක් හෝ ඇතුළු වීමක් අවශ්‍ය නොවී ප්‍රගතිය නිරීක්ෂණය කිරීමට ඔබේ අද්විතීය නඩු අංකය භාවිතා කරන්න.' },

  // Contact Redesign
  contactSub: { en: 'Professional Inquiries Only', si: 'වෘත්තීය විමසීම් සඳහා පමණි' },
  dangerWarning: { en: 'Immediate danger? Do not use this form.', si: 'ක්ෂණික අනතුරක්ද? මෙම පෝරමය භාවිතා නොකරන්න.' },
  callEmergency: { en: 'Call 911', si: '911 අමතන්න' },
  supportCategories: { en: 'Support Categories', si: 'සහාය වර්ග' },
  genInquiry: { en: 'General Inquiries', si: 'සාමාන්‍ය විමසීම්' },
  genInquiryDesc: { en: 'Partnerships & NGO questions', si: 'හවුල්කාරිත්වයන් සහ NGO ප්‍රශ්න' },
  techSupport: { en: 'Technical Support', si: 'තාක්ෂණික සහාය' },
  techSupportDesc: { en: 'File uploads & Case ID issues', si: 'උඩුගත කිරීම් සහ නඩු අංක ගැටළු' },
  mediaPress: { en: 'Media/Press', si: 'මාධ්‍ය/ප්‍රවෘත්ති' },
  mediaPressDesc: { en: 'Official government statements', si: 'නිල රජයේ ප්‍රකාශ' },
  locateBureau: { en: 'Locate a Bureau', si: 'කාර්යාලයක් සොයාගන්න' },
  viewLarger: { en: 'View larger', si: 'විශාලව බලන්න' },
  nearestBureau: { en: 'Nearest: Central Bureau (0.8mi)', si: 'ආසන්නතම: මධ්‍යම කාර්යාලය (සැ. 0.8)' },
  quickHelp: { en: 'Quick Help', si: 'ක්ෂණික සහාය' },
  viewAllFaqs: { en: 'View all FAQs', si: 'සියලුම නිතර අසන ප්‍රශ්න' },
  altMethods: { en: 'Alternative Methods', si: 'විකල්ප ක්‍රම' },
  officialEmail: { en: 'Official Email', si: 'නිල විද්‍යුත් තැපෑල' },
  secureFax: { en: 'Secure Fax', si: 'ආරක්ෂිත ෆැක්ස්' },
  connectAwareness: { en: 'Connect for awareness updates', si: 'යාවත්කාලීන කිරීම් සඳහා සම්බන්ධ වන්න' },

  // Contact (Old, for legacy or partial use)
  emergencyWarning: { en: 'EMERGENCY: If a child is in immediate danger, call 911 or your local emergency line immediately.', si: 'හදිසි අවස්ථාවක්: දරුවෙකු ක්ෂණික අනතුරකට ලක්ව ඇත්නම්, වහාම 911 හෝ ඔබේ දේශීය හදිසි ඇමතුම් අංකයට අමතන්න.' },
  contactTitle: { en: 'Contact Us', si: 'අප හා සම්බන්ධ වන්න' },
  inquiryLabel: { en: 'Inquiry Type', si: 'විමසීම් වර්ගය' },
  messageLabel: { en: 'Your Message', si: 'ඔබේ පණිවිඩය' },
  submitInquiry: { en: 'Submit Inquiry', si: 'විමසීම යොමු කරන්න' },

  // Admin Profile
  adminProfile: { en: 'Personnel Profile', si: 'කාර්ය මණ්ඩල පැතිකඩ' },
  officerDetails: { en: 'Officer Details', si: 'නිලධාරි තොරතුරු' },
  securityClearance: { en: 'Security Clearance', si: 'ආරක්ෂක අවසරය' },
  auditHistory: { en: 'Audit History', si: 'පරීක්ෂණ ඉතිහාසය' },
  action: { en: 'Action', si: 'ක්‍රියාව' },
  timestamp: { en: 'Timestamp', si: 'කාලමුද්‍රාව' },
  caseId: { en: 'Case ID', si: 'නඩු අංකය' },
  
  // Common
  loading: { en: 'Loading...', si: 'පූරණය වෙමින් පවතී...' },
  error: { en: 'Error occurred', si: 'දෝෂයක් සිදුවී ඇත' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Fix: Explicitly made children optional in Props to prevent TypeScript errors in consumers like App.tsx where the compiler might miss nested JSX as children
export const LanguageProvider = ({ children }: { children?: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('chars_lang') as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('chars_lang', lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within LanguageProvider');
  return context;
};
