import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { storage } from '../lib/storage';
import { routeConfig, allCities, getCityEmoji } from '../lib/routes';
import { useCallback } from 'react';
import Svg, { Path } from 'react-native-svg';

const PostTripScreen = () => {
  const navigation = useNavigation<any>();
  const [travelerEnabled, setTravelerEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkTravelerStatus = async () => {
        const traveler = await storage.getItem('travelerEnabled');
        setTravelerEnabled(traveler === 'true');
        setLoading(false);
      };
      checkTravelerStatus();
    }, [])
  );

  const currentDestinations = fromCity ? (routeConfig[fromCity] || []) : [];

  const handleBecomeTraveler = () => {
    navigation.navigate('TravelerOnboarding');
  };

  const handlePostTrip = async () => {
    if (!fromCity.trim() || !toCity.trim() || !departDate.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const userId = await storage.getItem('userId');
      const existingTrips = await storage.getItem('userTrips');
      const trips = existingTrips ? JSON.parse(existingTrips) : [];

      const newTrip = {
        id: Date.now(),
        fromCity,
        toCity,
        departDate,
        createdAt: new Date().toISOString(),
      };

      trips.push(newTrip);
      await storage.setItem('userTrips', JSON.stringify(trips));

      Alert.alert('Success', 'Trip posted! Senders can now request you.');
      setFromCity('');
      setToCity('');
      setDepartDate('');
    } catch (err) {
      Alert.alert('Error', 'Failed to post trip');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#0F7A4B" />
        </View>
      </SafeAreaView>
    );
  }

  if (!travelerEnabled) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Post Trip</Text>
        </View>

        <ScrollView contentContainerStyle={styles.emptyContent}>
          <View style={styles.emptyState}>
            <Svg width={72} height={72} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 20 }}>
              <Path d="M22 16.13v2.26a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h2.26a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.13Z" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.emptyTitle}>Become a Traveler</Text>
            <Text style={styles.emptySubtitle}>Post your trips and let senders know when you're traveling</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={handleBecomeTraveler}>
              <Text style={styles.emptyAddBtnText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Post Trip</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formSection}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>From</Text>
            <View style={styles.cityList}>
              {allCities.slice(0, 8).map(city => (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityOption, fromCity === city && styles.cityOptionSelected]}
                  onPress={() => {
                    setFromCity(city);
                    setToCity('');
                  }}
                >
                  <Text style={styles.cityEmoji}>{getCityEmoji(city)}</Text>
                  <Text style={[styles.cityName, fromCity === city && styles.cityNameSelected]}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {fromCity && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>To</Text>
              <View style={styles.cityList}>
                {currentDestinations.map(city => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.cityOption, toCity === city && styles.cityOptionSelected]}
                    onPress={() => setToCity(city)}
                  >
                    <Text style={styles.cityEmoji}>{getCityEmoji(city)}</Text>
                    <Text style={[styles.cityName, toCity === city && styles.cityNameSelected]}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {toCity && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Departure Date</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-05-15"
                placeholderTextColor="#bbb"
                value={departDate}
                onChangeText={setDepartDate}
              />
            </View>
          )}

          {fromCity && toCity && departDate && (
            <TouchableOpacity style={styles.submitBtn} onPress={handlePostTrip} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Post Trip</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  backButton: { fontSize: 16, color: '#0F7A4B', fontWeight: '600', marginRight: 16 },
  title: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },

  emptyContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  emptyState: { alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#666', marginBottom: 28, textAlign: 'center', lineHeight: 20 },
  emptyAddBtn: { backgroundColor: '#0F7A4B', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, alignItems: 'center' },
  emptyAddBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  content: { paddingHorizontal: 24, paddingVertical: 24 },
  formSection: { gap: 20 },
  formGroup: { gap: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },

  cityList: { gap: 8 },
  cityOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e5e5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fafafa', gap: 10 },
  cityOptionSelected: { borderColor: '#0F7A4B', backgroundColor: '#f0f8f5' },
  cityEmoji: { fontSize: 20 },
  cityName: { fontSize: 15, color: '#666', fontWeight: '500' },
  cityNameSelected: { color: '#0F7A4B', fontWeight: '700' },

  input: { borderWidth: 1.5, borderColor: '#e5e5e5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1a1a1a', backgroundColor: '#fafafa' },

  submitBtn: { backgroundColor: '#0F7A4B', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

export default PostTripScreen;
