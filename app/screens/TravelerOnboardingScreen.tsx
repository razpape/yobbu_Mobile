import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../lib/storage';
import { routeConfig, allCities, getCityEmoji } from '../lib/routes';

const API = 'http://192.168.1.178:3001';

const availableRoutes = [
  { id: 'NY-DAK', from: 'New York', to: 'Dakar' },
  { id: 'DAK-NY', from: 'Dakar', to: 'New York' },
  { id: 'LAG-ACC', from: 'Lagos', to: 'Accra' },
  { id: 'ACC-LAG', from: 'Accra', to: 'Lagos' },
  { id: 'PAR-LON', from: 'Paris', to: 'London' },
  { id: 'LON-PAR', from: 'London', to: 'Paris' },
  { id: 'ATL-DAK', from: 'Atlanta', to: 'Dakar' },
  { id: 'HOU-PAR', from: 'Houston', to: 'Paris' },
];

const TravelerOnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  const steps = [
    { title: 'Become a Traveler', subtitle: 'Earn money carrying packages on your trips', type: 'welcome' },
    { title: 'Your Routes', subtitle: 'Which routes do you travel?', type: 'routes' },
  ];

  const currentStep = steps[step];

  const handleNext = async () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (selectedRoutes.length === 0) {
        Alert.alert('Missing Info', 'Please select at least one route');
        return;
      }
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const routes = selectedRoutes.map(id => availableRoutes.find(r => r.id === id)).filter(Boolean);

      // Save locally - backend endpoint can be added later
      await storage.setItem('travelerEnabled', 'true');
      await storage.setItem('travelRoutes', JSON.stringify(routes));

      Alert.alert('Success', 'You are now a traveler! Start posting your trips.');
      navigation.reset({ index: 0, routes: [{ name: 'AuthTabs' }] });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        {/* Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressDots}>
            {steps.map((_, i) => (
              <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Welcome Step */}
          {step === 0 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>{currentStep.title}</Text>
              <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>What you'll need:</Text>
                <View style={styles.infoBullet}>
                  <Text style={styles.bulletDot}>✓</Text>
                  <Text style={styles.bulletText}>Travel regularly</Text>
                </View>
                <View style={styles.infoBullet}>
                  <Text style={styles.bulletDot}>✓</Text>
                  <Text style={styles.bulletText}>Post your routes & dates</Text>
                </View>
                <View style={styles.infoBullet}>
                  <Text style={styles.bulletDot}>✓</Text>
                  <Text style={styles.bulletText}>Senders will request you</Text>
                </View>
              </View>

              <View style={styles.earnBox}>
                <Text style={styles.earnTitle}>💰 Earn Money</Text>
                <Text style={styles.earnText}>Get paid for every package you deliver on your trips.</Text>
              </View>
            </View>
          )}

          {/* Routes Step */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>{currentStep.title}</Text>
              <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

              <View style={styles.routesList}>
                {availableRoutes.map(route => (
                  <TouchableOpacity
                    key={route.id}
                    style={[styles.routeOption, selectedRoutes.includes(route.id) && styles.routeOptionSelected]}
                    onPress={() => {
                      if (selectedRoutes.includes(route.id)) {
                        setSelectedRoutes(selectedRoutes.filter(id => id !== route.id));
                      } else {
                        setSelectedRoutes([...selectedRoutes, route.id]);
                      }
                    }}
                  >
                    <View style={styles.routeCheckbox}>
                      {selectedRoutes.includes(route.id) && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.routeContent}>
                      <Text style={styles.routeText}>
                        {route.from} → {route.to}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, loading || (step === 1 && selectedRoutes.length === 0) && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={loading || (step === 1 && selectedRoutes.length === 0)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextBtnText}>{step === 0 ? 'Next' : 'Become a Traveler'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1 },

  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backText: { fontSize: 24, color: '#1a1a1a', fontWeight: '300' },

  progressDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e0e0e0' },
  dotActive: { backgroundColor: '#0F7A4B' },

  content: { paddingHorizontal: 24, paddingBottom: 120 },

  stepContainer: { paddingVertical: 16 },

  title: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, lineHeight: 38 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32, lineHeight: 24 },

  infoBox: { backgroundColor: '#f0f8f5', borderRadius: 16, padding: 20, marginBottom: 24 },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  infoBullet: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  bulletDot: { fontSize: 18, color: '#0F7A4B', fontWeight: '700' },
  bulletText: { fontSize: 14, color: '#4a4a4a', flex: 1 },

  earnBox: { backgroundColor: '#fff3e0', borderRadius: 16, padding: 20 },
  earnTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  earnText: { fontSize: 14, color: '#4a4a4a', lineHeight: 20 },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },

  cityList: { gap: 8 },
  cityOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e5e5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fafafa', gap: 10 },
  cityOptionSelected: { borderColor: '#0F7A4B', backgroundColor: '#f0f8f5' },
  cityEmoji: { fontSize: 20 },
  cityName: { fontSize: 15, color: '#666', fontWeight: '500' },
  cityNameSelected: { color: '#0F7A4B', fontWeight: '700' },

  routesList: { gap: 10 },
  routeOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e5e5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: '#fafafa', gap: 12 },
  routeOptionSelected: { borderColor: '#0F7A4B', backgroundColor: '#f0f8f5' },
  routeCheckbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: '#e5e5e5', justifyContent: 'center', alignItems: 'center' },
  checkmark: { fontSize: 14, color: '#0F7A4B', fontWeight: '700' },
  routeContent: { flex: 1 },
  routeText: { fontSize: 15, color: '#1a1a1a', fontWeight: '500' },

  footer: { position: 'absolute', bottom: 32, left: 24, right: 24 },
  nextBtn: { backgroundColor: '#0F7A4B', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#e0e0e0' },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

export default TravelerOnboardingScreen;
