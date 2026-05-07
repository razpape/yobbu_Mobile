import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import { storage } from '../lib/storage';
import { NavigationContext } from './Navigation';

const supabase = createClient(
  'https://aglexdhpgbididmzdnvh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnbGV4ZGhwZ2JpZGlkbXpkbnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzU0NDAsImV4cCI6MjA5MjU1MTQ0MH0.4p4PVwGHdRSdWGxwsd_2hF7kGYfXSTSsuQRrFj_SpSE'
);

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const context = useContext(NavigationContext);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notifRequests, setNotifRequests] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(false);
  const [travelerEnabled, setTravelerEnabled] = useState(false);

  useFocusEffect(useCallback(() => {
    const loadUserData = async () => {
      const name = await storage.getItem('fullName');
      const userEmail = await storage.getItem('email');
      const photo = await storage.getItem('photoUri');
      const traveler = await storage.getItem('travelerEnabled');
      if (name) setFullName(name);
      if (userEmail) setEmail(userEmail);
      setPhotoUri(photo);
      setTravelerEnabled(traveler === 'true');
    };
    loadUserData();
  }, []));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access photos is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setUploading(true);
      try {
        const uri = result.assets[0].uri;
        const userId = await storage.getItem('userId');
        if (!userId) return;

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        const fileName = `${userId}-profile-${Date.now()}.jpg`;

        // Convert base64 to Uint8Array for upload
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, bytes, {
            contentType: 'image/jpeg',
          });

        if (error) {
          console.error('Upload error:', error);
          setUploading(false);
          return;
        }

        // Get public URL
        const { data } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
        const photoUrl = data.publicUrl;

        setPhotoUri(photoUrl);
        await storage.setItem('photoUri', photoUrl);
        setUploading(false);
      } catch (err) {
        console.error('Error uploading photo:', err);
        setUploading(false);
      }
    }
  };

  const handleLogout = async () => {
    await storage.removeItem('userToken');
    await storage.removeItem('userId');
    await storage.removeItem('fullName');
    await storage.removeItem('email');
    await storage.removeItem('photoUri');
    await storage.removeItem('onboarded');
    context?.setUserToken(null);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            await storage.removeItem('userToken');
            await storage.removeItem('userId');
            await storage.removeItem('fullName');
            await storage.removeItem('email');
            await storage.removeItem('photoUri');
            await storage.removeItem('userRole');
            await storage.removeItem('phone_verified');
            await storage.removeItem('onboarded');
            context?.setUserToken(null);
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Show login screen if not authenticated
  if (!context?.userToken) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Profile</Text>
          </View>

          {/* Login Section */}
          <View style={styles.loginSection}>
            <Text style={styles.sectionTitle}>Welcome to Yobbu</Text>
            <Text style={styles.sectionSubtitle}>Sign in to manage your shipments and messages</Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.primaryBtnText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('SignUpScreen')}>
              <Text style={styles.secondaryBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Settings & Help Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingSectionTitle}>Account & Settings</Text>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('SettingsScreen')}>
              <Text style={styles.settingLabel}>⚙️ Settings</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://yobbu.com/help')}>
              <Text style={styles.settingLabel}>❓ Get Help</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://yobbu.com/privacy')}>
              <Text style={styles.settingLabel}>📋 Privacy Policy</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://yobbu.com/terms')}>
              <Text style={styles.settingLabel}>⚖️ Terms of Service</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarLarge} onPress={pickImage} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator size="large" color="#0F7A4B" />
            ) : photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarPlaceholder}>Tap to add{'\n'}photo</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>Sender</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Shipments</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>$45</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Become a Traveler or Traveler Dashboard */}
        {!travelerEnabled ? (
          <TouchableOpacity
            style={styles.becomeTravemerBtn}
            onPress={() => {
              try {
                navigation.navigate('TravelerOnboarding');
              } catch (e) {
                console.error('Navigation error:', e);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.becomeTravelerIcon}>✈️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.becomeTravelerTitle}>Become a Traveler</Text>
              <Text style={styles.becomeTravelerDesc}>Earn money carrying packages on your trips</Text>
            </View>
            <Text style={styles.becomeTravelerArrow}>→</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.becomeTravemerBtn, styles.travelerDashboardBtn]}
            onPress={() => navigation.navigate('TravelerDashboard')}
          >
            <Text style={styles.becomeTravelerIcon}>📦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.becomeTravelerTitle}>My Traveler Dashboard</Text>
              <Text style={styles.becomeTravelerDesc}>View available shipments to deliver</Text>
            </View>
            <Text style={styles.becomeTravelerArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
            <View>
              <Text style={styles.menuItemLabel}>Edit Profile</Text>
              <Text style={styles.menuItemDesc}>Update your information</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Preferences')}>
            <View>
              <Text style={styles.menuItemLabel}>Preferences</Text>
              <Text style={styles.menuItemDesc}>Language, notifications</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Notifications</Text>
          <View style={styles.menuItem}>
            <View>
              <Text style={styles.menuItemLabel}>Shipment requests</Text>
              <Text style={styles.menuItemDesc}>When a traveler accepts your request</Text>
            </View>
            <Switch value={notifRequests} onValueChange={setNotifRequests} trackColor={{ true: '#0F7A4B' }} />
          </View>
          <View style={styles.menuItem}>
            <View>
              <Text style={styles.menuItemLabel}>Messages</Text>
              <Text style={styles.menuItemDesc}>New messages from travelers</Text>
            </View>
            <Switch value={notifMessages} onValueChange={setNotifMessages} trackColor={{ true: '#0F7A4B' }} />
          </View>
          <View style={styles.menuItem}>
            <View>
              <Text style={styles.menuItemLabel}>Promotions & updates</Text>
              <Text style={styles.menuItemDesc}>News and special offers</Text>
            </View>
            <Switch value={notifUpdates} onValueChange={setNotifUpdates} trackColor={{ true: '#0F7A4B' }} />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View>
              <Text style={styles.menuItemLabel}>Help & Support</Text>
              <Text style={styles.menuItemDesc}>FAQs and contact us</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View>
              <Text style={styles.menuItemLabel}>Terms & Privacy</Text>
              <Text style={styles.menuItemDesc}>Legal information</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backButton: { fontSize: 14, color: '#0F7A4B', fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },

  profileCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#e5e5e5' },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0f0f0', borderWidth: 1.5, borderColor: '#e0e0e0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden', alignSelf: 'center' },
  avatarImage: { width: 100, height: 100 },
  avatarPlaceholder: { fontSize: 12, color: '#999', fontWeight: '500', textAlign: 'center', lineHeight: 18 },
  name: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  email: { fontSize: 14, color: '#666', marginBottom: 12 },
  roleTag: { backgroundColor: '#E6F4ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleTagText: { fontSize: 12, fontWeight: '600', color: '#0F7A4B' },

  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e5e5e5' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '800', color: '#0F7A4B', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
  statDivider: { width: 1, height: 32, backgroundColor: '#e5e5e5' },

  menuSection: { marginBottom: 16 },
  menuSectionTitle: { fontSize: 12, fontWeight: '700', color: '#999', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e5e5e5' },
  menuItemLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  menuItemDesc: { fontSize: 12, color: '#999' },
  menuArrow: { fontSize: 14, color: '#0F7A4B', fontWeight: '600' },

  signOutButton: { borderWidth: 2, borderColor: '#ff6b6b', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  signOutButtonText: { fontSize: 16, fontWeight: '700', color: '#ff6b6b' },

  deleteAccountButton: { borderWidth: 2, borderColor: '#999', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 24 },
  deleteAccountButtonText: { fontSize: 14, fontWeight: '600', color: '#999' },

  becomeTravemerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F7A4B', borderRadius: 14, padding: 16, marginHorizontal: 0, marginBottom: 24, gap: 12 },
  becomeTravelerIcon: { fontSize: 28 },
  becomeTravelerTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  becomeTravelerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  becomeTravelerArrow: { fontSize: 18, color: '#fff', fontWeight: '700' },
  travelerDashboardBtn: { backgroundColor: '#2563eb' },

  // Unauthenticated state styles
  loginSection: {
    marginTop: 32,
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: '#0F7A4B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  settingsSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  settingSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginHorizontal: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderRadius: 10,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  settingArrow: {
    fontSize: 18,
    color: '#999',
  },
});

