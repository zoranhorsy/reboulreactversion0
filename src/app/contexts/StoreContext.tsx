"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Store = "adult" | "kids";

interface StoreContextType {
  currentStore: Store;
  setCurrentStore: (store: Store) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentStore, setCurrentStore] = useState<Store>("adult");

  useEffect(() => {
    const savedStore = localStorage.getItem("currentStore") as Store;
    if (savedStore) {
      setCurrentStore(savedStore);
    }
  }, []);

  const updateStore = (store: Store) => {
    setCurrentStore(store);
    localStorage.setItem("currentStore", store);
  };

  return (
    <StoreContext.Provider
      value={{ currentStore, setCurrentStore: updateStore }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
