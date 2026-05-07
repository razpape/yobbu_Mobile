import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { storage } from '../lib/storage';
import { allCities, getCityEmoji, routeConfig } from '../lib/routes';

const OnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [homeCity, setHomeCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [loading, setLoading] = useState(false);

  const [showHomePicker, setShowHomePicker] = useState(false);
  const [showDestPicker, setShowDestPicker] = useState(false);
  const [homeSearch, setHomeSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  const isValid = firstName.trim() && lastName.trim() && email.trim() && homeCity && destCity;

  const filteredHome = allCities.filter(c => c.toLowerCase().includes(homeSearch.toLowerCase()));
  const filteredDest = homeCity
    ? (routeConfig[homeCity] || []).filter(c => c.toLowerCase().includes(destSearch.toLowerCase()))
    : allCities.filter(c => c !== homeCity && c.toLowerCase().includes(destSearch.toLowerCase()));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleContinue = async () => {
    if (!isValid) return;
    setLoading(true);
    await storage.setItem('fullName', `${firstName.trim()} ${lastName.trim()}`);
    await storage.setItem('email', email.trim());
    await storage.setItem('homeCity', homeCity);
    await storage.setItem('destCity', destCity);
    if (photoUri) await storage.setItem('photoUri', photoUri);
    await storage.setItem('onboarded', 'true');
    setLoading(false);
    navigation.reset({ index: 0, routes: [{ name: 'SenderDashboard' }] });
  };

  const CityPickerModal = ({
    visible, title, search, setSearch, cities, selected, onSelect, onClose,
  }: {
    visible: boolean; title: string; search: string;
    setSearch: (s: string) => void; cities: string[];
    selected: string; onSelect: (c: string) => void; onClose: () => void;
  }) => (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.pickerScreen}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.pickerBack}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pickerTitle}>{title}</Text>
        </View>
        <View style={styles.pickerSearch}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
            <Path d="M21 21L16.514 16.506M19 11C19 15.418 15.418 19 11 19C6.582 19 3 15.418 3 11C3 6.582 6.582 3 11 3C15.418 3 19 6.582 19 11Z" stroke="#999" strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <TextInput
            style={styles.pickerSearchInput}
            placeholder="Search city..."
            placeholderTextColor="#bbb"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ScrollView>
          {cities.map(city => (
            <TouchableOpacity
              key={city}
              style={[styles.pickerRow, selected === city && styles.pickerRowSelected]}
              onPress={() => { onSelect(city); onClose(); }}
            >
              <Text style={styles.pickerFlag}>{getCityEmoji(city)}</Text>
              <Text style={[styles.pickerCity, selected === city && styles.pickerCitySelected]}>{city}</Text>
              {selected === city && <Text style={styles.pickerCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <Text style={styles.title}>Let's set up{'\n'}your profile</Text>
            <Text style={styles.subtitle}>Just a few details to get you started</Text>
          </View>

          {/* Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoCircle} onPress={pickImage}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoHint}>Tap to add{'\n'}photo</Text>
              )}
            </TouchableOpacity>
            {photoUri && (
              <TouchableOpacity onPress={() => setPhotoUri(null)}>
                <Text style={styles.removePhoto}>Remove photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Name row */}
          <View style={styles.nameRow}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>First name</Text>
              <TextInput style={styles.input} placeholder="Mamadou" placeholderTextColor="#bbb" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Last name</Text>
              <TextInput style={styles.input} placeholder="Sall" placeholderTextColor="#bbb" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
            </View>
          </View>

          {/* Email */}
          <View style={styles.section}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#bbb" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          {/* Home city */}
          <View style={styles.section}>
            <Text style={styles.label}>Where do you ship from?</Text>
            <Text style={styles.hint}>Your usual departure city</Text>
            <TouchableOpacity style={[styles.cityPicker, homeCity && styles.cityPickerSelected]} onPress={() => setShowHomePicker(true)}>
              {homeCity ? (
                <View style={styles.cityPickerInner}>
                  <Text style={styles.cityPickerFlag}>{getCityEmoji(homeCity)}</Text>
                  <Text style={styles.cityPickerValue}>{homeCity}</Text>
                </View>
              ) : (
                <Text style={styles.cityPickerPlaceholder}>Select city</Text>
              )}
              <Text style={styles.cityPickerArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Destination */}
          <View style={styles.section}>
            <Text style={styles.label}>Where do you usually send to?</Text>
            <Text style={styles.hint}>Your most common destination</Text>
            <TouchableOpacity style={[styles.cityPicker, destCity && styles.cityPickerSelected]} onPress={() => setShowDestPicker(true)}>
              {destCity ? (
                <View style={styles.cityPickerInner}>
                  <Text style={styles.cityPickerFlag}>{getCityEmoji(destCity)}</Text>
                  <Text style={styles.cityPickerValue}>{destCity}</Text>
                </View>
              ) : (
                <Text style={styles.cityPickerPlaceholder}>{homeCity ? 'Select destination' : 'Select origin first'}</Text>
              )}
              <Text style={styles.cityPickerArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.btn, !isValid && styles.btnDisabled]} onPress={handleContinue} disabled={!isValid || loading}>
            <Text style={styles.btnText}>{loading ? 'Saving...' : 'Get started'}</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <CityPickerModal
        visible={showHomePicker}
        title="Ship from"
        search={homeSearch}
        setSearch={setHomeSearch}
        cities={filteredHome}
        selected={homeCity}
        onSelect={(c) => { setHomeCity(c); setDestCity(''); }}
        onClose={() => { setShowHomePicker(false); setHomeSearch(''); }}
      />
      <CityPickerModal
        visible={showDestPicker}
        title="Send to"
        search={destSearch}
        setSearch={setDestSearch}
        cities={filteredDest}
        selected={destCity}
        onSelect={setDestCity}
        onClose={() => { setShowDestPicker(false); setDestSearch(''); }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, paddingHorizontal: 24 },

  header: { paddingTop: 40, marginBottom: 32 },
  title: { fontSize: 34, fontWeight: '800', color: '#1a1a1a', lineHeight: 40, marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#999' },

  photoSection: { alignItems: 'center', marginBottom: 32 },
  photoCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#f0f0f0', borderWidth: 1.5, borderColor: '#d0d0d0', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8, overflow: 'hidden',
  },
  photoImage: { width: 96, height: 96 },
  photoHint: { fontSize: 11, color: '#999', fontWeight: '500', textAlign: 'center', lineHeight: 16 },
  removePhoto: { fontSize: 13, color: '#ff6b6b', fontWeight: '600' },

  nameRow: { flexDirection: 'row', marginBottom: 0 },
  section: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  hint: { fontSize: 12, color: '#94A3B8', marginBottom: 10 },

  input: {
    borderWidth: 1.5, borderColor: '#ebebeb', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#1a1a1a', backgroundColor: '#fafafa',
  },

  cityPicker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#ebebeb', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fafafa',
  },
  cityPickerSelected: { borderColor: '#0F7A4B', backgroundColor: '#E6F4ED' },
  cityPickerInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cityPickerFlag: { fontSize: 22 },
  cityPickerValue: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  cityPickerPlaceholder: { fontSize: 15, color: '#bbb' },
  cityPickerArrow: { fontSize: 11, color: '#999' },

  btn: { backgroundColor: '#0F7A4B', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#e0e0e0' },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // City picker modal
  pickerScreen: { flex: 1, backgroundColor: '#fff' },
  pickerHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  pickerBack: { fontSize: 14, color: '#0F7A4B', fontWeight: '600', marginBottom: 8 },
  pickerTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  pickerSearch: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 12,
    marginHorizontal: 20, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 12,
  },
  pickerSearchInput: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  pickerRowSelected: { backgroundColor: '#E6F4ED' },
  pickerFlag: { fontSize: 24, marginRight: 14 },
  pickerCity: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  pickerCitySelected: { fontWeight: '700', color: '#0F7A4B' },
  pickerCheck: { fontSize: 16, color: '#0F7A4B', fontWeight: '700' },
});

export default OnboardingScreen;
