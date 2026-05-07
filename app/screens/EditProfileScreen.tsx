import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../lib/storage';

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [homeBase, setHomeBase] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const name = await storage.getItem('fullName');
      const userEmail = await storage.getItem('email');
      const base = await storage.getItem('homeBase');
      const photo = await storage.getItem('photoUri');
      if (name) {
        const parts = name.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      }
      if (userEmail) setEmail(userEmail);
      if (base) setHomeBase(base);
      if (photo) setPhotoUri(photo);
    };
    load();
  }, []);

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

  const getInitials = () => {
    return ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || 'YO';
  };

  const handleSave = async () => {
    if (!firstName.trim()) return;
    setSaving(true);
    await storage.setItem('fullName', `${firstName.trim()} ${lastName.trim()}`);
    await storage.setItem('email', email.trim());
    await storage.setItem('homeBase', homeBase.trim());
    if (photoUri) await storage.setItem('photoUri', photoUri);
    else await storage.removeItem('photoUri');
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
          </View>

          {/* Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoCircle} onPress={pickImage}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoInitials}>{getInitials()}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.changePhoto}>Change photo</Text>
            </TouchableOpacity>
            {photoUri && (
              <TouchableOpacity onPress={() => setPhotoUri(null)}>
                <Text style={styles.removePhoto}>Remove photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Fields */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>First name</Text>
              <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Last name</Text>
              <TextInput style={styles.input} value={lastName} onChangeText={setLastName} autoCapitalize="words" />
            </View>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Home base</Text>
          <View style={styles.homeBases}>
            {['New York', 'Dakar', 'Other'].map(city => (
              <TouchableOpacity
                key={city}
                style={[styles.chip, homeBase === city && styles.chipSelected]}
                onPress={() => setHomeBase(city)}
              >
                <Text style={[styles.chipText, homeBase === city && styles.chipTextSelected]}>{city}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !firstName.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!firstName.trim() || saving}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Savingâ€¦' : 'Save changes'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  header: { paddingTop: 20, marginBottom: 32 },
  back: { fontSize: 14, color: '#0F7A4B', fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },

  photoSection: { alignItems: 'center', marginBottom: 32, gap: 8 },
  photoCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#0F7A4B', overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
  },
  photoImage: { width: 96, height: 96 },
  photoInitials: { fontSize: 32, fontWeight: '800', color: '#fff' },
  changePhoto: { fontSize: 14, fontWeight: '600', color: '#0F7A4B' },
  removePhoto: { fontSize: 13, color: '#ff6b6b', fontWeight: '500' },

  nameRow: { flexDirection: 'row', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: '#ebebeb', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#1a1a1a', backgroundColor: '#fafafa', marginBottom: 16,
  },

  homeBases: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  chip: {
    flex: 1, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#ebebeb', borderRadius: 14,
    paddingVertical: 13, backgroundColor: '#fafafa',
  },
  chipSelected: { backgroundColor: '#0F7A4B', borderColor: '#0F7A4B' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  chipTextSelected: { color: '#fff' },

  saveBtn: { backgroundColor: '#0F7A4B', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#e0e0e0' },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});


