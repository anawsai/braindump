<<<<<<< Updated upstream
// Login form here
=======
// Login Form here
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

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    if (error) {
      Alert.alert('Login Failed', error.message);
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      {/* Top section with mascot */}
      <View style={styles.topSection}>
        <View style={styles.brainContainer}>
          <Image 
            source={require('../../assets/mascot.png')} 
            style={styles.mascotImage}
          />
        </View>
      </View>

      {/* Orange form section */}
      <View style={styles.formSection}>
        <Text style={styles.welcomeTitle}>Welcome Back!</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={22} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsRow}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>
          
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Logging in...' : 'LOGIN'}
          </Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>Sign up here!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFB052",
  },
  topSection: {
    flex: 0.35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFB052",
  },
  brainContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFB052",
    justifyContent: "center",
    alignItems: "center",
  },
  mascotImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  formSection: {
    flex: 0.65,
    backgroundColor: "#FFB052",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 35,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    marginTop: 5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 13,
    fontSize: 15,
    marginBottom: 18,
    color: "#000000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 13,
    fontSize: 15,
    color: "#000000",
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
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 3,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#000000",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  rememberText: {
    fontSize: 14,
    color: "#000000",
  },
  forgotText: {
    fontSize: 14,
    color: "#000000",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#000000",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
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
    color: "#000000",
  },
  signupLink: {
    fontSize: 14,
    color: "#000000",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
>>>>>>> Stashed changes
