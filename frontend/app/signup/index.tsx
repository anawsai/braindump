import React, { useState, useEffect } from "react";
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

export default function Signup() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation states
  const [validations, setValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Validate password as user types
  useEffect(() => {
    setValidations({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  // Check if all validations pass
  const isPasswordValid = Object.values(validations).every(v => v);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  async function handleSignup() {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!isPasswordValid) {
      Alert.alert('Error', 'Please make sure your password meets all requirements');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    dismissKeyboard();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      
      if (error) {
        Alert.alert('Signup Failed', error.message);
        return;
      }
  
      if (data.user && !data.session) {
        Alert.alert(
          'Check Your Email!',
          'We sent you a confirmation link. Please check your inbox and click the link to activate your account.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      } else if (data.session) {
        Alert.alert('Success', 'Account created successfully!');
        router.replace('/home');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const ValidationItem = ({ valid, label }: { valid: boolean; label: string }) => (
    <View style={styles.ruleItem}>
      <Ionicons 
        name={valid ? "checkmark-circle" : "close-circle"} 
        size={16} 
        color={valid ? '#4CAF50' : '#999'} 
      />
      <Text style={[styles.ruleText, { color: valid ? '#4CAF50' : '#666' }]}>{label}</Text>
    </View>
  );

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
            <Image 
              source={require('../../assets/mascot_welcome.png')} 
              style={styles.mascotImage}
            />
          </View>

          {/* Form section */}
          <View style={[styles.formSection, { backgroundColor: colors.primary }]}>
            <Text style={[styles.welcomeTitle, { color: '#1A1A1A' }]}>Create Account</Text>

            {/* Email */}
            <Text style={[styles.label, { color: '#1A1A1A' }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: mode === 'dark' ? '#FFFFFF' : '#000000' }]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={colors.placeholder}
              placeholder="email@example.com"
            />

            {/* Password */}
            <Text style={[styles.label, { color: '#1A1A1A' }]}>Password</Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.background }]}>
              <TextInput
                style={[styles.passwordInput, { color: mode === 'dark' ? '#FFFFFF' : '#000000' }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
                placeholder="Create a strong password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Password Rules - 2 columns */}
            <View style={[styles.rulesBox, { backgroundColor: colors.background }]}>
              <View style={styles.rulesColumns}>
                <View style={styles.rulesColumn}>
                  <ValidationItem valid={validations.minLength} label="8+ characters" />
                  <ValidationItem valid={validations.hasUppercase} label="Uppercase" />
                  <ValidationItem valid={validations.hasLowercase} label="Lowercase" />
                </View>
                <View style={styles.rulesColumn}>
                  <ValidationItem valid={validations.hasNumber} label="Number" />
                  <ValidationItem valid={validations.hasSpecial} label="Special (!@#$)" />
                  {confirmPassword.length > 0 && (
                    <ValidationItem valid={passwordsMatch} label="Passwords match" />
                  )}
                </View>
              </View>
            </View>

            {/* Confirm Password */}
            <Text style={[styles.label, { color: '#1A1A1A' }]}>Confirm Password</Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.background }]}>
              <TextInput
                style={[styles.passwordInput, { color: mode === 'dark' ? '#FFFFFF' : '#000000' }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
                placeholder="Re-enter password"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity 
              style={[
                styles.signupButton, 
                { backgroundColor: '#1A1A1A' },
                (!isPasswordValid || !passwordsMatch || !email) && styles.signupButtonDisabled
              ]}
              onPress={handleSignup}
              disabled={loading || !isPasswordValid || !passwordsMatch || !email}
            >
              <Text style={[styles.signupButtonText, { color: colors.primary }]}>
                {loading ? 'Creating Account...' : 'SIGN UP'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: '#1A1A1A' }]}>Already have an account? </Text>
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
    height: 240,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 15,
  },
  mascotImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 30,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  eyeButton: {
    padding: 12,
  },
  rulesBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  rulesColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rulesColumn: {
    flex: 1,
    gap: 6,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleText: {
    fontSize: 12,
  },
  signupButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 18,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
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
});