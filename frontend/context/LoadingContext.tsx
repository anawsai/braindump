import React, { createContext, useCallback, useContext, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
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
  const safetyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback((msg?: string) => {
    // Clear any existing safety timeout
    if (safetyTimeout.current) {
      clearTimeout(safetyTimeout.current);
    }
    
    startAt.current = Date.now();
    setActive(true);
    setMessage(msg);
    
    // Safety timeout - auto-stop after 10 seconds no matter what
    safetyTimeout.current = setTimeout(() => {
      console.warn('Loading safety timeout triggered - auto-stopping');
      setActive(false);
      setMessage(undefined);
      startAt.current = null;
    }, 10000);
  }, []);

  const stop = useCallback(() => {
    // Clear safety timeout
    if (safetyTimeout.current) {
      clearTimeout(safetyTimeout.current);
      safetyTimeout.current = null;
    }
    
    const startTime = startAt.current ?? Date.now();
    const elapsed = Date.now() - startTime;
    // Keep 2 second minimum for your loading animation to be visible
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
      {active && <LoadingOverlay />}
    </LoadingContext.Provider>
  );
}

// Separate component so it can use theme
function LoadingOverlay() {
  const { colors } = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;
  const directionRef = useRef(Math.random() > 0.5 ? 1 : -1);
  
  useEffect(() => {
    // Create continuous rotation animation with random direction
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: directionRef.current,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();
    
    return () => spinAnimation.stop();
  }, [spinValue]);
  
  const spin = spinValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-360deg', '0deg', '360deg'],
  });
  
  return (
    <View style={[styles.loadingOverlay, { backgroundColor: colors.primary }]} pointerEvents="auto">
      <Animated.Image
        source={require('../assets/loading_logo.jpg')}
        style={[
          styles.loadingImage,
          { transform: [{ rotate: spin }] }
        ]}
        resizeMode="contain"
      />
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
  loadingImage: {
    width: 500,
    height: 500,
  },
});

export default LoadingContext;