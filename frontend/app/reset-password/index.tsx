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

export default function ResetPassword() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

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

  useEffect(() => {
    // Validate password as user types
    setValidations({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  async function handleResetPassword() {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    dismissKeyboard();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      setResetSuccess(true);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (resetSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <StatusBar barStyle="dark-content" />
        
        <View style={[styles.successContainer, { backgroundColor: colors.primary }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
          </View>
          
          <Text style={[styles.successTitle, { color: '#1A1A1A' }]}>Password Reset!</Text>
          
          <Text style={[styles.successText, { color: '#1A1A1A' }]}>
            Your password has been successfully reset. You can now log in with your new password.
          </Text>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: '#1A1A1A' }]}
            onPress={async () => {
              // Sign out to clear the recovery session
              await supabase.auth.signOut();
              router.replace('/login');
            }}
          >
            <Text style={[styles.loginButtonText, { color: colors.primary }]}>
              Go to Login
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
            <Text style={[styles.title, { color: '#1A1A1A' }]}>Reset Password</Text>
            
            <Text style={[styles.subtitle, { color: '#1A1A1A' }]}>
              Create a new password for your account.
            </Text>

            {/* New Password */}
            <Text style={[styles.label, { color: '#1A1A1A' }]}>New Password</Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.background }]}>
              <TextInput
                style={[styles.passwordInput, { color: mode === 'dark' ? '#FFFFFF' : '#000000' }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
                placeholder="Enter new password"
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

            {/* Password Requirements */}
            <View style={[styles.rulesBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.rulesTitle, { color: mode === 'dark' ? '#FFFFFF' : '#000000' }]}>Password must contain:</Text>
              <Text style={[styles.rule, { color: validations.minLength ? '#4CAF50' : colors.textSecondary }]}>
                {validations.minLength ? '✓' : '✗'} At least 8 characters
              </Text>
              <Text style={[styles.rule, { color: validations.hasUppercase ? '#4CAF50' : colors.textSecondary }]}>
                {validations.hasUppercase ? '✓' : '✗'} One uppercase letter
              </Text>
              <Text style={[styles.rule, { color: validations.hasLowercase ? '#4CAF50' : colors.textSecondary }]}>
                {validations.hasLowercase ? '✓' : '✗'} One lowercase letter
              </Text>
              <Text style={[styles.rule, { color: validations.hasNumber ? '#4CAF50' : colors.textSecondary }]}>
                {validations.hasNumber ? '✓' : '✗'} One number
              </Text>
              <Text style={[styles.rule, { color: validations.hasSpecial ? '#4CAF50' : colors.textSecondary }]}>
                {validations.hasSpecial ? '✓' : '✗'} One special character
              </Text>
            </View>

            {/* Confirm Password */}
            <Text style={[styles.label, { color: '#1A1A1A' }]}>Confirm New Password</Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.background }]}>
              <TextInput
                style={[styles.passwordInput, { color: mode === 'dark' ? '#FFFFFF' : '#000000' }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
                placeholder="Re-enter new password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Password match indicator */}
            {confirmPassword.length > 0 && (
              <Text style={[
                styles.matchText,
                { color: password === confirmPassword ? '#4CAF50' : '#FF5500' }
              ]}>
                {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: '#1A1A1A' }]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={[styles.resetButtonText, { color: colors.primary }]}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
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
    height: 220,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },
  brainContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
  },
  mascotImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  formSection: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 25,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 5,
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
  rulesBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
  },
  rulesTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 8,
  },
  rule: {
    fontSize: 13,
    marginBottom: 3,
  },
  matchText: {
    fontSize: 13,
    marginBottom: 15,
    marginTop: -10,
  },
  resetButton: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
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
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});