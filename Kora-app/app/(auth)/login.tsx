import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Colors, Fonts } from '../../constants/theme';
import GoogleSignInButton from '../../components/GoogleSignInButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      await login(response.data.access_token, response.data.user);
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.needsVerification) {
         router.push({ pathname: '/(auth)/otp', params: { email } });
      } else {
         Alert.alert('Login Failed', err.response?.data?.message || 'Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotButton}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.footerLink}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    letterSpacing: 0.32,
    fontFamily: Fonts.sans,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.icon,
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: Fonts.sans,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.icon,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: Fonts.sans,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: Colors.light.icon,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
    fontFamily: Fonts.sans,
  },
  forgotButton: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  forgotText: {
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  button: {
    height: 56,
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.icon,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 12,
    color: Colors.light.icon,
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: Colors.light.icon,
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  footerLink: {
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
});
