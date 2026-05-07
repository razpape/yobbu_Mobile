import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import YobbuLogo from '../components/YobbuLogo';
import { allCities, getCityEmoji, routeConfig } from '../lib/routes';
import { storage } from '../lib/storage';

type SignUpScreenNavigationProp = any;

const PackageIcon = ({ color = '#0F7A4B', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4C4 2.89543 4.89543 2 6 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 6H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M9 10H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M9 14H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TravelerIcon = ({ color = '#666', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 7V12C2 18.627 7.373 24 12 24C16.627 24 22 18.627 22 12V7L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 11V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 17L15 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const SignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [step, setStep] = useState<'role' | 'city'>('role');
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const filteredCities = allCities.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleSelect = (selectedRole: 'sender' | 'traveler') => {
    if (selectedRole === 'sender') {
      setStep('city');
    } else {
      navigation.navigate('SenderDashboard');
    }
  };

  const handleCityConfirm = async () => {
    if (!selectedCity) return;
    await storage.setItem('homeCity', selectedCity);
    navigation.navigate('SenderDashboard');
  };

  if (step === 'city') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.cityScreen}>
          <TouchableOpacity onPress={() => setStep('role')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.cityTitle}>Where do you usually ship from?</Text>
          <Text style={styles.citySubtitle}>We'll use this as your default location every time you open the app</Text>

          {/* Search */}
          <View style={styles.searchBar}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
              <Path d="M21 21L16.514 16.506M19 11C19 15.418 15.418 19 11 19C6.582 19 3 15.418 3 11C3 6.582 6.582 3 11 3C15.418 3 19 6.582 19 11Z" stroke="#999" strokeWidth="2" strokeLinecap="round" />
            </Svg>
            <TextInput
              style={styles.searchInput}
              placeholder="Search city..."
              placeholderTextColor="#bbb"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* City list */}
          <ScrollView style={styles.cityList} showsVerticalScrollIndicator={false}>
            {filteredCities.map(city => (
              <TouchableOpacity
                key={city}
                style={[styles.cityRow, selectedCity === city && styles.cityRowSelected]}
                onPress={() => setSelectedCity(city)}
              >
                <Text style={styles.cityFlag}>{getCityEmoji(city)}</Text>
                <Text style={[styles.cityName, selectedCity === city && styles.cityNameSelected]}>{city}</Text>
                {selectedCity === city && (
                  <Text style={styles.cityCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.confirmBtn, !selectedCity && styles.confirmBtnDisabled]}
            onPress={handleCityConfirm}
            disabled={!selectedCity}
          >
            <Text style={styles.confirmBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <YobbuLogo width={60} height={60} />
            <Text style={styles.title}>YOBBU</Text>
            <Text style={styles.subtitle}>Choose your role to continue</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>What brings you to Yobbu?</Text>
            <Text style={styles.stepSubtitle}>Select to continue</Text>

            <TouchableOpacity style={styles.roleCard} onPress={() => handleRoleSelect('sender')}>
              <View style={styles.roleIconContainer}>
                <PackageIcon color="#0F7A4B" size={28} />
              </View>
              <View style={styles.roleContent}>
                <Text style={styles.roleName}>I want to send packages</Text>
                <Text style={styles.roleDescription}>Save 75% on shipping to Africa</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.roleCard} onPress={() => handleRoleSelect('traveler')}>
              <View style={styles.roleIconContainer}>
                <TravelerIcon color="#0F7A4B" size={28} />
              </View>
              <View style={styles.roleContent}>
                <Text style={styles.roleName}>I'm a traveler</Text>
                <Text style={styles.roleDescription}>Earn money delivering packages</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>By signing up, you agree to our</Text>
          <View style={styles.linkContainer}>
            <TouchableOpacity><Text style={styles.link}>Terms of Service</Text></TouchableOpacity>
            <Text style={styles.footerText}> & </Text>
            <TouchableOpacity><Text style={styles.link}>Privacy Policy</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  contentWrapper: { flex: 1, justifyContent: 'center' },

  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: '#0F7A4B', marginTop: 12, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },

  formContainer: { marginBottom: 40 },
  stepTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  stepSubtitle: { fontSize: 13, color: '#666', marginBottom: 24, lineHeight: 18 },

  roleCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 14,
    padding: 16, marginBottom: 12, backgroundColor: '#fafafa',
  },
  roleIconContainer: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#E6F4ED', justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  roleContent: { flex: 1 },
  roleName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  roleDescription: { fontSize: 13, color: '#666' },

  footer: { alignItems: 'center', paddingBottom: 20 },
  footerText: { fontSize: 12, color: '#999' },
  linkContainer: { flexDirection: 'row', marginTop: 4 },
  link: { fontSize: 12, color: '#0F7A4B', fontWeight: '600' },

  // City picker step
  cityScreen: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 },
  backBtn: { marginBottom: 24 },
  backBtnText: { fontSize: 14, color: '#0F7A4B', fontWeight: '600' },
  cityTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  citySubtitle: { fontSize: 14, color: '#999', lineHeight: 20, marginBottom: 24 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1a1a1a' },

  cityList: { flex: 1, marginBottom: 16 },
  cityRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 12, marginBottom: 6,
    backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#ebebeb',
  },
  cityRowSelected: { backgroundColor: '#E6F4ED', borderColor: '#0F7A4B' },
  cityFlag: { fontSize: 24, marginRight: 12 },
  cityName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  cityNameSelected: { color: '#0F7A4B' },
  cityCheck: { fontSize: 16, color: '#0F7A4B', fontWeight: '700' },

  confirmBtn: {
    backgroundColor: '#0F7A4B', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#ccc' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default SignUpScreen;
