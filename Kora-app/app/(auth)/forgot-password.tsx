import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi } from '../../services/api';
import { Colors, Fonts } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setStep(2);
      Alert.alert('OTP Sent', 'Check your email for the reset code.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not process request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, password: newPassword });
      Alert.alert('Success', 'Password has been reset successfully. You can now log in.');
      router.replace('/(auth)/login');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      
      {step === 1 ? (
        <>
          <Text style={styles.subtitle}>Enter your email to receive a reset code.</Text>
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
          <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Code</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Enter the code sent to {email} and your new password.</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Reset Code (OTP)</Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a new password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
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
  backButton: { alignItems: 'center' },
  backText: { color: Colors.light.icon, fontWeight: '500', fontFamily: Fonts.sans },
});
