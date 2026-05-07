import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import YobbuLogo from '../components/YobbuLogo';
import Svg, { Circle, Path } from 'react-native-svg';

type IntroScreenNavigationProp = any;

const PhoneIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#0F7A4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#4285F4" strokeWidth="2" />
    <Path d="M8 12C8 14.76 9.79 17.13 12.31 18.36" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 8V7C10.34 7 9 8.34 9 10" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const FacebookIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.3005 6.29289C14.4956 6.10536 14.7478 6 15 6H18V2Z" stroke="#1877F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const AppleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M17 12a5 5 0 0 0-5-5 5 5 0 0 0-5 5m7 8c.55 0 1 .45 1 1v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h4zM9 3c3-1 6-1 9 0m3 8c-.5 2-2 3.5-4 3.5s-3.5-1.5-4-3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IntroScreen = () => {
  const navigation = useNavigation<IntroScreenNavigationProp>();
  const [language, setLanguage] = useState<'EN' | 'FR'>('EN');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Toggle */}
        <View style={styles.languageToggle}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'EN' && styles.languageButtonActive,
            ]}
            onPress={() => setLanguage('EN')}
          >
            <Text
              style={[
                styles.languageText,
                language === 'EN' && styles.languageTextActive,
              ]}
            >
              EN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'FR' && styles.languageButtonActive,
            ]}
            onPress={() => setLanguage('FR')}
          >
            <Text
              style={[
                styles.languageText,
                language === 'FR' && styles.languageTextActive,
              ]}
            >
              FR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logo and Title */}
        <View style={styles.header}>
          <YobbuLogo width={80} height={80} />
          <Text style={styles.title}>Yobbu</Text>
          <Text style={styles.tagline}>Send anything, anywhere.</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Real travelers carry your packages — no couriers, no middlemen.
          </Text>
        </View>

        {/* Location Pills */}
        <View style={styles.locationsContainer}>
          <TouchableOpacity style={styles.locationPill}>
            <Text style={styles.locationText}>New York</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationPill}>
            <Text style={styles.locationText}>Dakar</Text>
          </TouchableOpacity>
        </View>

        {/* Routes Active */}
        <View style={styles.routesContainer}>
          <Text style={styles.routesText}>+70,000 routes active</Text>
        </View>

        {/* Buttons Container */}
        <View style={styles.buttonsContainer}>
          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('SignUpScreen')}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
            <Text style={styles.getStartedSubtext}>Create your account</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
            <Text style={styles.signInSubtext}>Already have an account?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  languageToggle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40,
    gap: 12,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 50,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#3B82F6',
  },
  languageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  languageTextActive: {
    color: 'white',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: 'white',
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  descriptionContainer: {
    marginBottom: 32,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  locationsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  locationPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  locationText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  routesContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  routesText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  buttonsContainer: {
    gap: 12,
  },
  getStartedButton: {
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  getStartedSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  signInButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  signInSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});

export default IntroScreen;


