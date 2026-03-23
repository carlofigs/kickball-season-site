/// <reference types="vite/client" />

declare global {
  const lucide: {
    createIcons: (options?: { element?: Element | Document }) => void;
  };
  interface Window {
    toggleCard: (cardId: string) => void;
    switchView: (view: 'detailed' | 'simplified') => void;
    selectTeamFromDropdown: (val: string) => void;
  }
}

export {};
