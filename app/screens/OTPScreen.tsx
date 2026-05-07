import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useContext } from 'react';
import { storage } from '../lib/storage';
import { NavigationContext } from './Navigation';

const API = 'http://192.168.1.178:3001';
const OTP_LENGTH = 6;

const OTPScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const context = useContext(NavigationContext);
  const { phone } = route.params || { phone: '' };

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer === 0) { setCanResend(true); return; }
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    setError('');
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid code'); return; }
      const token = 'otp_' + Date.now();
      await storage.setItem('userToken', token);
      context?.setUserToken(token);
      const onboarded = await storage.getItem('onboarded');
      navigation.reset({ index: 0, routes: [{ name: onboarded ? 'SenderDashboard' : 'Onboarding' }] });
    } catch {
      setError('Could not connect to server. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setCanResend(false);
    setResendTimer(30);
    inputs.current[0]?.focus();
    try {
      await fetch(`${API}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
    } catch {
      setError('Could not resend code. Check your connection.');
    }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>

        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify your{'\n'}phone number</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.phone}>{phone || '+1 (555) 000-0000'}</Text>
          </Text>
        </View>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={r => { inputs.current[i] = r; }}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
                error ? styles.otpBoxError : null,
              ]}
              value={digit}
              onChangeText={t => handleChange(t, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              caretHidden
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive it? </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
          )}
        </View>

        {/* Verify Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.verifyBtn, filled < OTP_LENGTH && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={filled < OTP_LENGTH}
            activeOpacity={0.85}
          >
            <Text style={styles.verifyBtnText}>Verify</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, paddingHorizontal: 28 },

  backBtn: { marginTop: 12, marginBottom: 32, alignSelf: 'flex-start' },
  backText: { fontSize: 24, color: '#1a1a1a', fontWeight: '300' },

  header: { marginBottom: 44 },
  title: {
    fontSize: 34, fontWeight: '800', color: '#1a1a1a',
    lineHeight: 40, marginBottom: 14, letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, color: '#888', lineHeight: 24, fontWeight: '400' },
  phone: { color: '#1a1a1a', fontWeight: '700' },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  otpBoxFilled: {
    borderColor: '#0F7A4B',
    backgroundColor: '#fff',
  },
  otpBoxError: {
    borderColor: '#ff4d4d',
    backgroundColor: '#fff5f5',
  },

  errorText: {
    fontSize: 13, color: '#ff4d4d', fontWeight: '500',
    textAlign: 'center', marginBottom: 16,
  },

  resendRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  resendLabel: { fontSize: 14, color: '#888' },
  resendLink: { fontSize: 14, fontWeight: '700', color: '#0F7A4B' },
  resendTimer: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },

  footer: { position: 'absolute', bottom: 32, left: 28, right: 28 },
  verifyBtn: {
    backgroundColor: '#0F7A4B',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  verifyBtnDisabled: { backgroundColor: '#e0e0e0' },
  verifyBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
});

export default OTPScreen;


