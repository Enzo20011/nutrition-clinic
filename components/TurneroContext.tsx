"use client";

import React, { createContext, useContext, useState } from 'react';

interface TurneroContextType {
  isOpen: boolean;
  openTurnero: () => void;
  closeTurnero: () => void;
}

const TurneroContext = createContext<TurneroContextType | undefined>(undefined);

export function TurneroProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openTurnero = () => setIsOpen(true);
  const closeTurnero = () => setIsOpen(false);

  return (
    <TurneroContext.Provider value={{ isOpen, openTurnero, closeTurnero }}>
      {children}
    </TurneroContext.Provider>
  );
}

export function useTurnero() {
  const context = useContext(TurneroContext);
  if (context === undefined) {
    throw new Error('useTurnero must be used within a TurneroProvider');
  }
  return context;
}
