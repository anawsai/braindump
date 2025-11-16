import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  CheckBox,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";

export default function Login() {
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      {/* top "logo" block */}
      <View style={styles.logoBox}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>LOGO</Text>
        </View>
      </View>

      {/* orange panel */}
      <View style={styles.formBox}>
        <Text style={styles.title}>Welcome Back!</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter your password"
          secureTextEntry
          style={styles.input}
          value={pw}
          onChangeText={setPw}
        />

        {/* remember/forgot row */}
        <View style={styles.optionRow}>
          <View style={styles.checkboxRow}>
            <CheckBox value={remember} onValueChange={setRemember} />
            <Text style={styles.optionText}>Remember me</Text>
          </View>

          <Pressable onPress={() => {}}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>
        </View>

        {/* login button */}
        <TouchableOpacity style={styles.loginBtn}>
          <Text style={styles.loginText}>LOGIN</Text>
        </TouchableOpacity>

        {/* sign up link */}
        <View style={styles.signupRow}>
          <Text style={styles.optionText}>Don’t have an account? </Text>
          <Pressable>
            <Text style={styles.signupLink}>Sign up here!</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// styles based on figma (orange: #FFB052)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  logoBox: {
    height: "25%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#D3D3D3",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { fontWeight: "bold", color: "gray" },

  formBox: {
    flex: 1,
    backgroundColor: "#FFB052",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "black",
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    color: "black",
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 8,
  },

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    color: "black",
    fontSize: 14,
  },
  forgot: {
    color: "black",
    textDecorationLine: "underline",
    fontSize: 14,
  },

  loginBtn: {
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 10,
  },
  loginText: {
    color: "white",
    fontWeight: "700",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  signupLink: {
    color: "black",
    textDecorationLine: "underline",
  },
});
