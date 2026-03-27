import { createContext, useContext, useMemo, useState } from "react";
import { i18n } from "../lib/i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("aletrail_lang") || "en");

  const value = useMemo(() => {
    const t = (key) => i18n[lang]?.[key] ?? i18n.en[key] ?? key;

    return {
      lang,
      setLang: (nextLang) => {
        localStorage.setItem("aletrail_lang", nextLang);
        setLang(nextLang);
      },
      t,
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return value;
}
