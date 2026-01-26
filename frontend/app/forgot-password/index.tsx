import * as Linking from 'expo-linking';
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";


export default function ForgotPassword() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  async function handleResetPassword() {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    dismissKeyboard();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://anawsai.github.io/braindump-redirect/',
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      setEmailSent(true);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <StatusBar barStyle="dark-content" />
        
        <View style={[styles.successContainer, { backgroundColor: colors.primary }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
            <Ionicons name="mail" size={60} color={colors.primary} />
          </View>
          
          <Text style={[styles.successTitle, { color: '#1A1A1A' }]}>Check Your Email</Text>
          
          <Text style={[styles.successText, { color: '#1A1A1A' }]}>
            We've sent a password reset link to:
          </Text>
          <Text style={[styles.emailText, { color: '#1A1A1A' }]}>{email}</Text>
          
          <Text style={[styles.instructionText, { color: '#1A1A1A' }]}>
            Click the link in the email to reset your password. After resetting, come back here to log in with your new password.
          </Text>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: '#1A1A1A' }]}
            onPress={() => router.replace('/login')}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              Back to Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => {
              setEmailSent(false);
              handleResetPassword();
            }}
          >
            <Text style={[styles.resendText, { color: '#1A1A1A' }]}>
              Didn't receive the email? Resend
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        style={[styles.container, { backgroundColor: colors.primary }]}
      >
        <StatusBar barStyle="dark-content" />

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Top section with mascot */}
          <View style={[styles.topSection, { backgroundColor: colors.primary }]}>
            <View style={[styles.brainContainer, { backgroundColor: colors.primary }]}>
              <Image
                source={require('../../assets/mascot_welcome.png')}
                style={styles.mascotImage}
              />
            </View>
          </View>

          {/* Form section */}
          <View style={[styles.formSection, { backgroundColor: colors.primary }]}>
            {/* Back button */}
            <TouchableOpacity 
              style={styles.backArrow} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>

            <Text style={[styles.title, { color: '#1A1A1A' }]}>Forgot Password?</Text>
            
            <Text style={[styles.subtitle, { color: '#1A1A1A' }]}>
              No worries! Enter your email address and we'll send you a link to reset your password.
            </Text>

            <Text style={[styles.label, { color: '#1A1A1A' }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: mode === 'dark' ? '#FFFFFF' : '#000000' }]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={colors.placeholder}
              placeholder="Enter your email"
            />

            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: '#1A1A1A' }]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={[styles.resetButtonText, { color: colors.primary }]}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: '#1A1A1A' }]}>Remember your password? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.loginLink, { color: '#1A1A1A' }]}>Login here!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    height: 280,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  brainContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  mascotImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  formSection: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backArrow: {
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 5,
  },
  input: {
    borderRadius: 8,
    padding: 13,
    fontSize: 15,
    marginBottom: 25,
  },
  resetButton: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resendButton: {
    padding: 10,
  },
  resendText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});