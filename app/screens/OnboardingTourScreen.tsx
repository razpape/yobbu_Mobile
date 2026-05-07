import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../lib/storage';
import { NavigationContext } from './Navigation';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const PostIcon = () => (
  <Svg width={72} height={72} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="#0F7A4B" />
  </Svg>
);

const TravelerIcon = () => (
  <Svg width={72} height={72} viewBox="0 0 24 24" fill="none">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#0F7A4B" />
  </Svg>
);

const PriceIcon = () => (
  <Svg width={72} height={72} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1.5-13h-3v1.5h1.5v3h-1.5V15h3v-3h1.5v-3h-1.5z" fill="#0F7A4B" />
  </Svg>
);

const TrackIcon = () => (
  <Svg width={72} height={72} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#0F7A4B" />
  </Svg>
);

const slides = [
  {
    icon: PostIcon,
    title: 'Post Your Shipment',
    description: 'Choose your destination, add package details, and set your price. Travelers see your request within minutes.',
  },
  {
    icon: TravelerIcon,
    title: 'Pick a Trusted Traveler',
    description: 'Browse verified travelers going your way. Check ratings, reviews, and delivery history before confirming.',
  },
  {
    icon: PriceIcon,
    title: 'Save Big on Shipping',
    description: 'Pay up to 70% less than traditional courier services. No hidden fees, transparent pricing.',
  },
  {
    icon: TrackIcon,
    title: 'Track Everything',
    description: 'Real-time updates on your shipment. Message your traveler, track location, and confirm delivery.',
  },
];

const OnboardingTourScreen = () => {
  const navigation = useNavigation<any>();
  const context = useContext(NavigationContext);
  const [currentSlide, setCurrentSlide] = useState(0);

  const completeOnboarding = async () => {
    try {
      console.log('Completing onboarding...');
      await storage.setItem('onboardingComplete', 'true');
      console.log('Onboarding marked complete, navigating...');
      navigation.reset({ index: 0, routes: [{ name: 'AuthTabs' }] });
    } catch (e) {
      console.error('Failed to save onboarding state:', e);
      navigation.reset({ index: 0, routes: [{ name: 'AuthTabs' }] });
    }
  };

  const handleNext = () => {
    console.log('Next pressed, current slide:', currentSlide);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    console.log('Skip pressed');
    completeOnboarding();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
        <View style={styles.progressDots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <View style={styles.counter}>
          <Text style={styles.counterText}>{currentSlide + 1}/{slides.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} scrollEnabled={false}>
        <View style={styles.slideContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon />
          </View>

          {/* Title */}
          <Text style={styles.slideTitle}>{slide.title}</Text>

          {/* Description */}
          <Text style={styles.slideDescription}>{slide.description}</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {currentSlide > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentSlide(currentSlide - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  skipButton: {
    fontSize: 14,
    color: '#0F7A4B',
    fontWeight: '600',
  },

  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e5e5',
  },

  dotActive: {
    backgroundColor: '#0F7A4B',
  },

  counter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8f5',
    borderRadius: 8,
  },

  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F7A4B',
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  slideContainer: {
    alignItems: 'center',
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 122, 75, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },

  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },

  slideDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
  },

  nextButton: {
    backgroundColor: '#0F7A4B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },

  nextButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },

  backButton: {
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },

  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default OnboardingTourScreen;
