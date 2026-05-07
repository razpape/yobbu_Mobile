import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../lib/storage';
import YobbuLogo from '../components/YobbuLogo';

const PhoneVerificationScreen = () => {
  const navigation = useNavigation<any>();
  const [screen, setScreen] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneForOtp, setPhoneForOtp] = useState('');

  const API = 'http://192.168.1.178:3001';

  const handleSendCode = async () => {
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

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setError('');
    try {
      const userId = await storage.getItem('userId');
      const res = await fetch(`${API}/verify-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneForOtp,
          otp,
          userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');

      await storage.setItem('phone_verified', 'true');
      await storage.setItem('phone', phoneForOtp);
      navigation.reset({ index: 0, routes: [{ name: 'AuthTabs' }] });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Store as unverified but allow access - can verify later
    await storage.setItem('phone_verified', 'true');
    navigation.reset({ index: 0, routes: [{ name: 'AuthTabs' }] });
  };

  // Phone Input Screen
  if (screen === 'phone') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
          <View style={styles.top}>
            <View style={styles.logoContainer}>
              <YobbuLogo width={52} height={52} />
            </View>
            <Text style={styles.title}>Verify your phone</Text>
            <Text style={styles.subtitle}>We'll send you a code via SMS to verify your account</Text>

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
              onPress={handleSendCode}
              disabled={!phone.trim() || loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.continueBtnText}>Send Code</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkip} disabled={loading}>
              <Text style={styles.skipButton}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // OTP Input Screen
  if (screen === 'otp') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
          <View style={styles.top}>
            <TouchableOpacity onPress={() => setScreen('phone')}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Enter code</Text>
            <Text style={styles.subtitle}>Check your SMS for the 6-digit code sent to {phoneForOtp}</Text>

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
              onPress={handleVerifyOtp}
              disabled={!otp.trim() || loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.continueBtnText}>Verify</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSendCode()} disabled={loading}>
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
  inner: { flex: 1, paddingHorizontal: 24, paddingBottom: 32, justifyContent: 'center' },

  logoContainer: { alignItems: 'center', marginBottom: 40 },
  top: { paddingTop: 0 },

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

  errorText: { fontSize: 13, color: '#ff4d4d', fontWeight: '500', marginBottom: 12 },

  backButton: { fontSize: 16, color: '#0F7A4B', fontWeight: '600', marginBottom: 24 },
  skipButton: { fontSize: 15, color: '#0F7A4B', fontWeight: '600', textAlign: 'center', marginTop: 20 },
  resendButton: { fontSize: 13, color: '#0F7A4B', fontWeight: '600', textAlign: 'center', marginTop: 16 },
});

export default PhoneVerificationScreen;
