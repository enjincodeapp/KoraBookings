import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { authApi, configApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Fonts } from '../constants/theme';

WebBrowser.maybeCompleteAuthSession();

type GoogleAuthConfig = {
  webClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
  expoClientId?: string;
};

export default function GoogleSignInButton({ label = 'Continue with Google' }: { label?: string }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleAuth, setGoogleAuth] = useState<GoogleAuthConfig>({});
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleAuth.expoClientId,
    iosClientId: googleAuth.iosClientId,
    androidClientId: googleAuth.androidClientId,
    webClientId: googleAuth.webClientId,
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await configApi.getConfig();
        setGoogleAuth(res.data?.google ?? {});
      } catch (error) {
        console.error('Failed to load Google auth config:', error);
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const idToken = response.params?.id_token ?? response.authentication?.idToken;
      if (idToken) {
        authenticate(idToken);
      } else {
        setLoading(false);
        Alert.alert('Google Sign-In', 'No identity token returned. Please try again.');
      }
    } else if (response.type === 'error') {
      setLoading(false);
      Alert.alert('Google Sign-In', 'Authentication failed. Please try again.');
    } else {
      setLoading(false);
    }
  }, [response]);

  const authenticate = async (idToken: string) => {
    try {
      const res = await authApi.googleLogin(idToken);
      await login(res.data.access_token, res.data.user);
    } catch (err: any) {
      Alert.alert('Google Sign-In', err.response?.data?.message || 'Could not sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async () => {
    setLoading(true);
    try {
      await promptAsync();
    } catch {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} disabled={!request || loading}>
      {loading ? (
        <ActivityIndicator color={Colors.light.onSurface} />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.icon} />
          <Text style={styles.text}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.icon,
    backgroundColor: Colors.light.background,
    marginBottom: 24,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    color: Colors.light.onSurface,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
});
