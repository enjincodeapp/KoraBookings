import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Colors, Fonts } from '../../constants/theme';

export default function OtpScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string || '';
  const { login } = useAuth();

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOtp({ email, otp });
      await login(response.data.access_token, response.data.user);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendOtp({ email });
      Alert.alert('Success', 'A new OTP has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.message || 'Could not resend OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          textAlign="center"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Account</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
        <Text style={styles.resendText}>Didn't receive a code? Resend</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: Colors.light.background, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: Colors.light.text, marginBottom: 8, textAlign: 'center', fontFamily: Fonts.sans },
  subtitle: { fontSize: 16, color: Colors.light.icon, marginBottom: 32, textAlign: 'center', fontFamily: Fonts.sans },
  inputContainer: { marginBottom: 24 },
  input: { height: 56, borderWidth: 1, borderColor: Colors.light.icon, borderRadius: 8, fontSize: 24, letterSpacing: 8, backgroundColor: Colors.light.background, width: '100%', fontFamily: Fonts.sans },
  button: { height: 48, backgroundColor: Colors.light.tint, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: Fonts.sans },
  resendButton: { alignItems: 'center' },
  resendText: { color: Colors.light.tint, fontWeight: '500', fontFamily: Fonts.sans },
});
