"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  targetAddress: string | null;
  setTargetAddress: (address: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [targetAddress, setTargetAddressState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("targetAddress");
    }
    return null;
  });

  const setTargetAddress = (address: string | null) => {
    setTargetAddressState(address);
    if (typeof window !== "undefined") {
      if (address) {
        localStorage.setItem("targetAddress", address);
      } else {
        localStorage.removeItem("targetAddress");
      }
    }
  };

  return (
    <AppContext.Provider value={{ targetAddress, setTargetAddress }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
