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

export default function Signup() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  async function handleSignup() {
    if (!email || !password || !confirmPassword) {
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
          'Check Your Email! ',
          'We sent you a confirmation link. Please check your inbox and click the link to activate your account.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login')
            }
          ]
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

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        style={[styles.container, { backgroundColor: colors.primary }]}
      >
        <StatusBar barStyle={colors.background === '#FFFFFF' ? "dark-content" : "light-content"} />

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Top section with mascot */}
          <View style={[styles.topSection, { backgroundColor: colors.primary }]}>
            <View style={[styles.brainContainer, { backgroundColor: colors.primary }]}>
              <Image 
                source={require('../../assets/mascot.png')} 
                style={styles.mascotImage}
              />
            </View>
          </View>

          {/* Orange form section */}
          <View style={[styles.formSection, { backgroundColor: colors.primary }]}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Create Account</Text>

            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={colors.placeholder}
              placeholder="email@example.com"
            />

            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.background }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
                placeholder="At least 6 characters"
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

            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <View style={[styles.passwordContainer, { backgroundColor: colors.background }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
                placeholder="Re-enter password"
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

            <TouchableOpacity 
              style={[styles.signupButton, { backgroundColor: colors.text }]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={[styles.signupButtonText, { color: colors.primary }]}>
                {loading ? 'Creating Account...' : 'SIGN UP'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.text }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.loginLink, { color: colors.text }]}>Login here!</Text>
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
    height: 180,
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
  signupButton: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
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