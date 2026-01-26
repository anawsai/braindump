import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

type GreetingCombo = {
  greeting: string;
  subtitle: string;
};

const morningGreetings: GreetingCombo[] = [
  { greeting: "Good morning", subtitle: "Let's clear your mind." },
  { greeting: "Good morning", subtitle: "A fresh start awaits." },
  { greeting: "Good morning", subtitle: "Time to unload your thoughts." },
  { greeting: "Rise and shine", subtitle: "Your mind will thank you." },
];

const afternoonGreetings: GreetingCombo[] = [
  { greeting: "Good afternoon", subtitle: "Take a moment for yourself." },
  { greeting: "Good afternoon", subtitle: "Let's declutter those thoughts." },
  { greeting: "Good afternoon", subtitle: "A clear mind is a happy mind." },
  { greeting: "Hey there", subtitle: "Ready to brain dump." },
];

const eveningGreetings: GreetingCombo[] = [
  { greeting: "Good evening", subtitle: "Unwind and let it all out." },
  { greeting: "Good evening", subtitle: "Release the day's thoughts." },
  { greeting: "Welcome back", subtitle: "Time to decompress." },
  { greeting: "Hey there", subtitle: "Let's end the day with clarity." },
];

const getTimeBasedGreetings = (): GreetingCombo[] => {
  const hour = new Date().getHours();
  if (hour < 12) return morningGreetings;
  if (hour < 17) return afternoonGreetings;
  return eveningGreetings;
};

const getRandomGreeting = (name: string): { greeting: string; subtitle: string } => {
  const greetings = getTimeBasedGreetings();
  const combo = greetings[Math.floor(Math.random() * greetings.length)];
  return {
    greeting: `${combo.greeting}, ${name}.`,
    subtitle: combo.subtitle,
  };
};

// Mascot images
const mascotWelcome = require('../../assets/mascot_welcome.png');
const mascotReg = require('../../assets/mascot_reg.png');
const mascotDump = require('../../assets/mascot_dump.png');

export default function Home() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState({ greeting: '', subtitle: '' });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userName) {
      setGreeting(getRandomGreeting(userName));
    }
  }, [userName]);

  async function loadUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = 
          user.user_metadata?.full_name?.split(' ')[0] ||
          user.user_metadata?.name?.split(' ')[0] ||
          user.user_metadata?.username ||
          user.email?.split('@')[0] ||
          'Friend';
        setUserName(name);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUserName('Friend');
    }
  }

  const bgColor = mode === 'dark' ? '#1A1A1A' : colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Scattered mascots */}
      <Image source={mascotReg} style={[styles.mascotScattered, styles.mascot1]} />
      <Image source={mascotWelcome} style={[styles.mascotScattered, styles.mascot2]} />
      <Image source={mascotDump} style={[styles.mascotScattered, styles.mascot3]} />
      <Image source={mascotReg} style={[styles.mascotScattered, styles.mascot4]} />
      <Image source={mascotWelcome} style={[styles.mascotScattered, styles.mascot5]} />
      <Image source={mascotDump} style={[styles.mascotScattered, styles.mascot6]} />
      <Image source={mascotReg} style={[styles.mascotScattered, styles.mascot7]} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Main center mascot */}
        <View style={styles.centerMascotContainer}>
          <Image
            source={mascotWelcome}
            style={styles.centerMascot}
          />
        </View>

        {/* Greeting section */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingText, { color: colors.text }]}>
            {greeting.greeting}
          </Text>
          <Text style={[styles.subtitleText, { color: mode === 'dark' ? colors.textSecondary : '#000000aa' }]}>
            {greeting.subtitle}
          </Text>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: mode === 'dark' ? colors.primary : '#FFFFFF' }]}
            onPress={() => router.push('/dump')}
            activeOpacity={0.8}
          >
            <Text style={[styles.ctaText, { color: colors.text }]}>Start Dumping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },

  // Scattered mascots
  mascotScattered: {
    position: 'absolute',
    width: 70,
    height: 70,
    resizeMode: 'contain',
    opacity: 0.9,
  },
  mascot1: {
    top: 20,
    left: 20,
    width: 60,
    height: 60,
    transform: [{ rotate: '-15deg' }],
  },
  mascot2: {
    top: 60,
    right: 30,
    width: 55,
    height: 55,
    transform: [{ rotate: '20deg' }],
  },
  mascot3: {
    top: '25%',
    left: -10,
    width: 65,
    height: 65,
    transform: [{ rotate: '10deg' }],
  },
  mascot4: {
    top: '35%',
    right: -5,
    width: 60,
    height: 60,
    transform: [{ rotate: '-25deg' }],
  },
  mascot5: {
    bottom: '25%',
    left: 15,
    width: 55,
    height: 55,
    transform: [{ rotate: '15deg' }],
  },
  mascot6: {
    bottom: '20%',
    right: 20,
    width: 65,
    height: 65,
    transform: [{ rotate: '-10deg' }],
  },
  mascot7: {
    bottom: 60,
    left: '40%',
    width: 50,
    height: 50,
    transform: [{ rotate: '25deg' }],
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Center mascot
  centerMascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  centerMascot: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },

  // Greeting
  greetingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },

  // CTA
  ctaSection: {
    alignItems: 'center',
  },
  ctaButton: {
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});