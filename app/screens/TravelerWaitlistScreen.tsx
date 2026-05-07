import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../lib/storage';

const TravelerWaitlistScreen = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [routes, setRoutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !whatsapp.trim() || !routes.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const waitlistEntry = {
        id: Date.now(),
        name,
        phone,
        whatsapp,
        routes,
        submittedAt: new Date().toISOString(),
      };

      const existingWaitlist = await storage.getItem('travelerWaitlist');
      const waitlist = existingWaitlist ? JSON.parse(existingWaitlist) : [];
      waitlist.push(waitlistEntry);
      await storage.setItem('travelerWaitlist', JSON.stringify(waitlist));

      setSubmitted(true);
    } catch (e) {
      console.error('Failed to submit waitlist:', e);
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>You're on the waitlist!</Text>
          <Text style={styles.successMessage}>
            We'll review your information and contact you on WhatsApp when we're ready to onboard travelers.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Become a Traveler</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Earn money by carrying packages on your trips</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. +1 (555) 123-4567"
            placeholderTextColor="#bbb"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>WhatsApp Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. +1 (555) 123-4567"
            placeholderTextColor="#bbb"
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Routes You Travel</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="e.g. New York to Dakar, Lagos to Accra"
            placeholderTextColor="#bbb"
            value={routes}
            onChangeText={setRoutes}
            multiline
            numberOfLines={4}
            editable={!loading}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.infoText}>
          We'll review your information and contact you on WhatsApp when we're ready to onboard travelers.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Join Waitlist</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  backArrow: { fontSize: 24, color: '#1a1a1a', marginRight: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },

  content: { paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 120 },

  subtitle: { fontSize: 15, color: '#666', marginBottom: 32, lineHeight: 22 },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },

  input: {
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },

  textarea: { height: 100, paddingTop: 12 },

  infoText: { fontSize: 12, color: '#999', lineHeight: 18, marginTop: 16 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingVertical: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e5e5' },

  submitButton: { backgroundColor: '#0F7A4B', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#e0e0e0' },
  submitButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  successIcon: { fontSize: 60, color: '#0F7A4B', marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 16, textAlign: 'center' },
  successMessage: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  backButton: { backgroundColor: '#0F7A4B', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, alignItems: 'center' },
  backButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

export default TravelerWaitlistScreen;
