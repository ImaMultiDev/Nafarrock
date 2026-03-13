"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallPromptContextValue = {
  /** true si el navegador puede mostrar el prompt nativo de instalación */
  canPrompt: boolean;
  /** Dispara el prompt nativo. Si no hay prompt, retorna false */
  triggerInstall: () => Promise<boolean>;
};

const InstallPromptContext = createContext<InstallPromptContextValue | null>(
  null,
);

export function InstallPromptProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      return outcome === "accepted";
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  return (
    <InstallPromptContext.Provider
      value={{
        canPrompt: !!deferredPrompt,
        triggerInstall,
      }}
    >
      {children}
    </InstallPromptContext.Provider>
  );
}

export function useInstallPrompt() {
  const ctx = useContext(InstallPromptContext);
  return ctx ?? { canPrompt: false, triggerInstall: async () => false };
}
