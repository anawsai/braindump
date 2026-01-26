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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

export default function ForgotPassword() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleResetPassword() {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Use deep link that will open the app on mobile
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'braindump://reset-password',
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
        <StatusBar barStyle={colors.background === '#FFFFFF' ? "dark-content" : "light-content"} />
        
        <View style={[styles.successContainer, { backgroundColor: colors.primary }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
            <Ionicons name="mail" size={60} color={colors.primary} />
          </View>
          
          <Text style={[styles.successTitle, { color: colors.text }]}>Check Your Email</Text>
          
          <Text style={[styles.successText, { color: colors.text }]}>
            We've sent a password reset link to:
          </Text>
          <Text style={[styles.emailText, { color: colors.text }]}>{email}</Text>
          
          <Text style={[styles.instructionText, { color: colors.text }]}>
            Click the link in the email to reset your password. After resetting, come back here to log in with your new password.
          </Text>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.text }]}
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
            <Text style={[styles.resendText, { color: colors.text }]}>
              Didn't receive the email? Resend
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.container, { backgroundColor: colors.primary }]}
    >
      <StatusBar barStyle={colors.background === '#FFFFFF' ? "dark-content" : "light-content"} />

      {/* Top section with mascot */}
      <View style={[styles.topSection, { backgroundColor: colors.primary }]}>
        <View style={[styles.brainContainer, { backgroundColor: colors.primary }]}>
          <Image
            source={require('../../assets/mascot.png')}
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
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
        
        <Text style={[styles.subtitle, { color: colors.text }]}>
          No worries! Enter your email address and we'll send you a link to reset your password.
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={colors.placeholder}
          placeholder="Enter your email"
        />

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.text }]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={[styles.resetButtonText, { color: colors.primary }]}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: colors.text }]}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={[styles.loginLink, { color: colors.text }]}>Login here!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  brainContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  mascotImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  formSection: {
    flex: 0.7,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 20,
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