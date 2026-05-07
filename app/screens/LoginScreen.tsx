import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { storage } from '../lib/storage';
import { useNavigation } from '@react-navigation/native';
import { NavigationContext } from './Navigation';
import YobbuLogo from '../components/YobbuLogo';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { FontAwesome } from '@expo/vector-icons';
import Svg, { Path, G } from 'react-native-svg';

WebBrowser.maybeCompleteAuthSession();

const GoogleLogo = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const context = useContext(NavigationContext);
  const [screen, setScreen] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneForOtp, setPhoneForOtp] = useState('');

  const API = 'http://192.168.1.178:3001';

  // Google OAuth
  const redirectUrl = Platform.OS === 'web'
    ? 'http://localhost:8081'
    : `https://auth.expo.io/@${process.env.EXPO_USERNAME}/yobbu`;

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    redirectUri: redirectUrl,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleSocialLogin('google', googleResponse);
    }
  }, [googleResponse]);

  const handleSendOTP = async () => {
    if (!phone.trim()) return;
    const fullPhone = `+1${phone.replace(/\D/g, '')}`;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      setPhoneForOtp(fullPhone);
      setScreen('otp');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/verify-otp-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneForOtp,
          otp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');

      // Save auth data
      await storage.setItem('userToken', data.sessionToken);
      await storage.setItem('userId', data.userId);
      await storage.setItem('authMethod', 'phone');
      await storage.setItem('phone_verified', 'true');
      await storage.setItem('phone', phoneForOtp);
      if (data.email) await storage.setItem('email', data.email);
      if (data.fullName) await storage.setItem('fullName', data.fullName);

      context?.setUserToken(data.sessionToken);
      navigation.reset({ index: 0, routes: [{ name: 'AuthTabs' }] });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string, response: any) => {
    try {
      setLoading(true);
      setError('');

      const idToken = response.params?.id_token;
      const accessToken = response.params?.access_token;

      if (!idToken && !accessToken) {
        throw new Error(`${provider} login was cancelled`);
      }

      const backendRes = await fetch(`${API}/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          idToken: idToken || '',
          accessToken: accessToken || '',
        }),
      });

      const data = await backendRes.json();
      if (!backendRes.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save auth data
      await storage.setItem('userToken', data.sessionToken);
      await storage.setItem('userId', data.userId);
      await storage.setItem('authMethod', provider);
      await storage.setItem('phone_verified', 'true');
      if (data.email) await storage.setItem('email', data.email);
      if (data.fullName) await storage.setItem('fullName', data.fullName);
      if (data.phone) await storage.setItem('phone', data.phone);

      context?.setUserToken(data.sessionToken);
      navigation.reset({ index: 0, routes: [{ name: 'AuthTabs' }] });
    } catch (e: any) {
      setError(e.message);
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSignIn = async () => {
    try {
      const testUserId = 'test-user-' + Date.now();
      const testToken = 'test-token-' + Date.now();

      console.log('Test sign in: saving data...');
      await storage.setItem('userId', testUserId);
      await storage.setItem('userToken', testToken);
      await storage.setItem('fullName', 'Test User');
      await storage.setItem('email', 'test@yobbu.com');
      await storage.setItem('phone_verified', 'true');
      await storage.setItem('photoUri', '');

      console.log('Test sign in: updating context...');
      if (!context) {
        console.error('Navigation context is null!');
        Alert.alert('Error', 'Navigation context is not available');
        return;
      }

      context.setUserToken(testToken);
      console.log('Test sign in: navigating...');

      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'AuthTabs' }] });
      }, 100);
    } catch (e: any) {
      console.error('Test sign in error:', e);
      Alert.alert('Error', e.message || 'Test sign in failed');
    }
  };

  // Phone Input Screen
  if (screen === 'phone') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <YobbuLogo width={52} height={52} />
          </View>
          <Text style={styles.title}>Welcome to Yobbu</Text>
          <Text style={styles.subtitle}>Enter your phone number to sign in or create an account</Text>

          <View style={styles.phoneRow}>
            <View style={styles.flagBox}>
              <Text style={styles.code}>+1</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="(555) 123-4567"
              placeholderTextColor="#bbb"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.continueBtn, !phone.trim() && styles.btnDisabled]}
            onPress={handleSendOTP}
            disabled={!phone.trim() || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.continueBtnText}>Send Code</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Options */}
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={async () => {
              try {
                await googlePromptAsync();
              } catch (e) {
                setError('Google login failed');
              }
            }}
            disabled={!googleRequest || loading}
          >
            <GoogleLogo size={20} />
            <Text style={styles.socialBtnText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => Alert.alert('Facebook', 'Facebook login coming soon')}
            disabled={loading}
          >
            <FontAwesome name="facebook" size={20} color="#1877F2" />
            <Text style={styles.socialBtnText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => Alert.alert('Apple', 'Apple login coming soon')}
            disabled={loading}
          >
            <FontAwesome name="apple" size={20} color="#000" />
            <Text style={styles.socialBtnText}>Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => Alert.alert('Email', 'Email login coming soon')}
            disabled={loading}
          >
            <FontAwesome name="envelope" size={20} color="#1a1a1a" />
            <Text style={styles.socialBtnText}>Email</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('TravelerWaitlist')}>
            <Text style={styles.travelerLink}>
              Not interested in shipping? <Text style={styles.travelerLinkBold}>Join as a traveler</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing you agree to our Terms and Privacy Policy
          </Text>
        </ScrollView>

        {/* Test Sign In */}
        <TouchableOpacity style={styles.testBtn} onPress={handleTestSignIn}>
          <Text style={styles.testBtnText}>Test Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // OTP Input Screen
  if (screen === 'otp') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
          <View style={styles.top}>
            <TouchableOpacity onPress={() => { setScreen('phone'); setOtp(''); setError(''); }}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Enter code</Text>
            <Text style={styles.subtitle}>We sent a 6-digit code to {phoneForOtp}</Text>

            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="#bbb"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.continueBtn, !otp.trim() && styles.btnDisabled]}
              onPress={handleVerifyOTP}
              disabled={!otp.trim() || loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.continueBtnText}>Verify</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSendOTP()} disabled={loading}>
              <Text style={styles.resendButton}>Didn't receive? Resend code</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 32 },
  inner: { flex: 1, paddingHorizontal: 24, paddingBottom: 32, justifyContent: 'center' },
  top: { flex: 1, justifyContent: 'center' },

  logoContainer: { alignItems: 'center', marginBottom: 40 },

  title: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 32, textAlign: 'center', lineHeight: 22 },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    marginBottom: 14,
    overflow: 'hidden',
  },
  flagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRightWidth: 1.5,
    borderRightColor: '#e5e5e5',
  },
  code: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  phoneInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 16, fontSize: 16, color: '#1a1a1a' },

  otpInput: {
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 8,
  },

  continueBtn: { backgroundColor: '#0F7A4B', borderRadius: 12, paddingVertical: 18, alignItems: 'center', marginTop: 20 },
  btnDisabled: { backgroundColor: '#e0e0e0' },
  continueBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1, backgroundColor: '#ebebeb' },
  dividerText: { marginHorizontal: 12, fontSize: 12, color: '#94A3B8', fontWeight: '500' },

  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  socialBtnText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },

  errorText: { fontSize: 13, color: '#ff4d4d', fontWeight: '500', marginBottom: 12 },

  backButton: { fontSize: 16, color: '#0F7A4B', fontWeight: '600', marginBottom: 24 },
  resendButton: { fontSize: 13, color: '#0F7A4B', fontWeight: '600', textAlign: 'center', marginTop: 16 },
  termsText: { fontSize: 12, color: '#bbb', textAlign: 'center', marginTop: 20, lineHeight: 18 },

  testBtn: { marginHorizontal: 24, marginVertical: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#0F7A4B', alignItems: 'center' },
  testBtnText: { fontSize: 13, color: '#0F7A4B', fontWeight: '600' },

  travelerLink: { fontSize: 13, color: '#666', textAlign: 'center', marginVertical: 16, lineHeight: 18 },
  travelerLinkBold: { fontWeight: '700', color: '#0F7A4B' },
});

export default LoginScreen;
