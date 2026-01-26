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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

const REMEMBER_ME_KEY = "@remember_me";
const REMEMBERED_EMAIL_KEY = "@remembered_email";
const REMEMBERED_PASSWORD_KEY = "@remembered_password";

export default function Login() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(true);

  // Load remembered credentials on mount
  useEffect(() => {
    loadRememberedCredentials();
  }, []);

  async function loadRememberedCredentials() {
    try {
      setIsLoadingCredentials(true);
      const [remembered, savedEmail, savedPassword] = await Promise.all([
        AsyncStorage.getItem(REMEMBER_ME_KEY),
        AsyncStorage.getItem(REMEMBERED_EMAIL_KEY),
        AsyncStorage.getItem(REMEMBERED_PASSWORD_KEY),
      ]);
      
      if (remembered === "true" && savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error("Error loading remembered credentials:", error);
    } finally {
      setIsLoadingCredentials(false);
    }
  }

  async function saveCredentials() {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_ME_KEY, "true");
        await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        await AsyncStorage.setItem(REMEMBERED_PASSWORD_KEY, password);
      } else {
        await clearCredentials();
      }
    } catch (error) {
      console.error("Error saving credentials:", error);
    }
  }

  async function clearCredentials() {
    try {
      await AsyncStorage.multiRemove([
        REMEMBER_ME_KEY,
        REMEMBERED_EMAIL_KEY,
        REMEMBERED_PASSWORD_KEY,
      ]);
    } catch (error) {
      console.error("Error clearing credentials:", error);
    }
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    dismissKeyboard();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
        setLoading(false);
        return;
      }
      
      // Only save credentials after successful login
      await saveCredentials();
      
      // If login successful, the auth state change handler in _layout.tsx will redirect
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Something went wrong');
      setLoading(false);
    }
  }

  async function handleRememberMeToggle() {
    const newValue = !rememberMe;
    setRememberMe(newValue);
    
    // If turning off, clear saved credentials immediately
    if (!newValue) {
      await clearCredentials();
    }
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

          {/* Orange form section */}
          <View style={[styles.formSection, { backgroundColor: colors.primary }]}>
            <Text style={[styles.welcomeTitle, { color: '#1A1A1A' }]}>Welcome Back!</Text>

            <Text style={[styles.label, { color: '#1A1A1A' }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: mode === 'dark' ? '#FFFFFF' : '#000000' }]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={colors.placeholder}
              placeholder="Enter your email"
              editable={!isLoadingCredentials}
            />

            <Text style={[styles.label, { color: '#1A1A1A' }]}>Password</Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.background }]}>
              <TextInput
                style={[styles.passwordInput, { color: mode === 'dark' ? '#FFFFFF' : '#000000' }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
                placeholder="Enter your password"
                editable={!isLoadingCredentials}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={handleRememberMeToggle}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox, 
                  { borderColor: '#1A1A1A', backgroundColor: '#FFFFFF' }, 
                  rememberMe && { backgroundColor: '#1A1A1A' }
                ]}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={[styles.rememberText, { color: '#1A1A1A' }]}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                <Text style={[styles.forgotText, { color: '#1A1A1A' }]}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: '#1A1A1A' }]}
              onPress={handleLogin}
              disabled={loading || isLoadingCredentials}
            >
              <Text style={[styles.loginButtonText, { color: colors.primary }]}>
                {loading ? 'Logging in...' : 'LOGIN'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: '#1A1A1A' }]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={[styles.signupLink, { color: '#1A1A1A' }]}>Sign up here!</Text>
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
    width: 140,
    height: 140,
    borderRadius: 70,
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
    paddingTop: 35,
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "bold",
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
    marginBottom: 18,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 13,
    fontSize: 15,
  },
  eyeButton: {
    padding: 13,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 14,
  },
  forgotText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});