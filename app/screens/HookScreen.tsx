import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const SaveIcon = () => (
  <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="#0F7A4B" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#0F7A4B" />
  </Svg>
);

const HookScreen = () => {
  const navigation = useNavigation<any>();

  const handleContinue = () => {
    navigation.navigate('LoginScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fff', '#f0f8f5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <SaveIcon />
        </View>

        {/* Main Headline */}
        <Text style={styles.headline}>
          Save <Text style={styles.highlight}>70%</Text>
        </Text>

        {/* Subheadline */}
        <Text style={styles.subheadline}>
          Ship to Africa at prices you'll love
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <CheckIcon />
            <Text style={styles.benefitText}>Trusted travelers from diaspora</Text>
          </View>
          <View style={styles.benefitRow}>
            <CheckIcon />
            <Text style={styles.benefitText}>Real-time tracking & updates</Text>
          </View>
          <View style={styles.benefitRow}>
            <CheckIcon />
            <Text style={styles.benefitText}>Safe & insured deliveries</Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleContinue}>
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },

  iconContainer: { marginBottom: 40, alignItems: 'center', justifyContent: 'center', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(15, 122, 75, 0.1)' },

  headline: { fontSize: 48, fontWeight: '900', color: '#1a1a1a', textAlign: 'center', marginBottom: 16, lineHeight: 56 },
  highlight: { color: '#0F7A4B' },

  subheadline: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 48, lineHeight: 24 },

  benefitsContainer: { width: '100%', gap: 16 },

  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitText: { fontSize: 14, color: '#1a1a1a', fontWeight: '500', flex: 1 },

  footer: { paddingHorizontal: 24, paddingVertical: 32 },

  ctaButton: { backgroundColor: '#0F7A4B', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

export default HookScreen;
