import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type LoadingContextType = {
  active: boolean;
  message?: string;
  start: (message?: string) => void;
  stop: () => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const startAt = useRef<number | null>(null);

  const start = useCallback((msg?: string) => {
    if (!active) {
      startAt.current = Date.now();
      setActive(true);
      setMessage(msg);
    } else {
      if (msg) setMessage(msg);
    }
  }, [active]);

  const stop = useCallback(() => {
    const start = startAt.current ?? Date.now();
    const elapsed = Date.now() - start;
    const wait = Math.max(0, 2000 - elapsed);
    setTimeout(() => {
      setActive(false);
      setMessage(undefined);
      startAt.current = null;
    }, wait);
  }, []);

  return (
    <LoadingContext.Provider value={{ active, message, start, stop }}>
      {children}
      {active && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <Text style={styles.loadingText}>{message ?? 'Loading...'}</Text>
        </View>
      )}
    </LoadingContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 176, 82)'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  }
});

export default LoadingContext;
