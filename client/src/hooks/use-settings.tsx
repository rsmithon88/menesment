import React, { createContext, useContext, useState, useEffect } from "react";

interface SettingsContextType {
  madrasaName: string;
  setMadrasaName: (name: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [madrasaName, setMadrasaName] = useState(() => {
    // Try to get from localStorage on initial load
    const saved = localStorage.getItem("madrasaName");
    return saved || "দারুল জান্নাত মহিলা কওমী মাদ্রাসা";
  });

  useEffect(() => {
    // Persist to localStorage whenever it changes
    localStorage.setItem("madrasaName", madrasaName);
  }, [madrasaName]);

  return (
    <SettingsContext.Provider value={{ madrasaName, setMadrasaName }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
