import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi } from '../../services/api';
import { Colors, Fonts } from '../../constants/theme';
import GoogleSignInButton from '../../components/GoogleSignInButton';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ name, email, password });
      Alert.alert('Success', 'Registration successful! Please check your email for the OTP.');
      router.push({ pathname: '/(auth)/otp', params: { email } });
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to start booking spaces</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
        />
      </View>

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
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton label="Sign up with Google" />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: Colors.light.background, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: Colors.light.text, marginBottom: 8, fontFamily: Fonts.sans },
  subtitle: { fontSize: 16, color: Colors.light.icon, marginBottom: 32, fontFamily: Fonts.sans },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.light.text, marginBottom: 6, fontFamily: Fonts.sans },
  input: { height: 48, borderWidth: 1, borderColor: Colors.light.icon, borderRadius: 8, paddingHorizontal: 16, fontSize: 16, backgroundColor: Colors.light.background, fontFamily: Fonts.sans },
  button: { height: 48, backgroundColor: Colors.light.tint, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: Fonts.sans },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.light.icon, opacity: 0.3 },
  dividerText: { marginHorizontal: 12, color: Colors.light.icon, fontSize: 14, fontFamily: Fonts.sans },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: Colors.light.icon, fontFamily: Fonts.sans },
  footerLink: { color: Colors.light.tint, fontWeight: '600', fontFamily: Fonts.sans },
});
