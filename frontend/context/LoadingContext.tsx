import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from './ThemeContext';

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
    startAt.current = Date.now();
    setActive(true);
    setMessage(msg);
  }, []);

  const stop = useCallback(() => {
    const start = startAt.current ?? Date.now();
    const elapsed = Date.now() - start;
    // Keep 2 second minimum for your loading animation
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
      {active && <LoadingOverlay message={message} />}
    </LoadingContext.Provider>
  );
}

// Separate component so it can use theme
function LoadingOverlay({ message }: { message?: string }) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.loadingOverlay, { backgroundColor: colors.primary }]} pointerEvents="auto">
      <ActivityIndicator size="large" color={colors.text} />
      <Text style={[styles.loadingText, { color: colors.text }]}>{message ?? 'Loading...'}</Text>
    </View>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600'
  }
});

export default LoadingContext;