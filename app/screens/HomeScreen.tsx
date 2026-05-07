import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Rect, Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Language Toggle */}
        <View style={styles.languageBar}>
          <TouchableOpacity style={[styles.langButton, styles.langButtonActive]}>
            <Text style={styles.langButtonActiveText}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.langButton}>
            <Text style={styles.langButtonInactiveText}>FR</Text>
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logo}>
            <Svg width={90} height={90} viewBox="0 0 100 100">
              <Rect width="100" height="100" rx="22" fill="#3B82F6" />
              <Path 
                d="M 30 22 L 50 52 L 50 76" 
                stroke="white" 
                strokeWidth="10" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <Path 
                d="M 70 22 L 50 52" 
                stroke="white" 
                strokeWidth="10" 
                strokeLinecap="round" 
              />
              <Circle cx="30" cy="22" r="6" fill="#1B5E54" />
              <Circle cx="70" cy="22" r="6" fill="#1B5E54" />
              <Circle cx="50" cy="76" r="6" fill="#1B5E54" />
            </Svg>
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.appTitle}>Yobbu</Text>
          <Text style={styles.appTagline}>Send anything, anywhere.</Text>
        </Animated.View>

        {/* Description */}
        <Animated.View
          style={[
            styles.descriptionContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.description}>
            Real travelers carry your packages — no couriers, no middlemen.
          </Text>
        </Animated.View>

        {/* Routes */}
        <Animated.View
          style={[
            styles.routesContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.routeFlow}>
            <View style={styles.routeTag}>
              <Text style={styles.routeText}>New York</Text>
            </View>
            <Text style={styles.routeArrow}>→</Text>
            <View style={styles.routeTag}>
              <Text style={styles.routeText}>Dakar</Text>
            </View>
          </View>
          <Text style={styles.routeStats}>+70,000 routes active</Text>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* CTA Buttons */}
        <Animated.View
          style={[
            styles.ctaContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SignUp', { role: 'both' })}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Text style={styles.primaryButtonSubtext}>Create your account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
            <Text style={styles.secondaryButtonSubtext}>Already have an account?</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
  },

  // Language Bar
  languageBar: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-end',
    marginBottom: 40,
  },
  langButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  langButtonActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  langButtonActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
  langButtonInactiveText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Title
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  appTagline: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Description
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 21,
    fontWeight: '400',
  },

  // Routes
  routesContainer: {
    alignItems: 'center',
  },
  routeFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  routeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  routeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  routeArrow: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  routeStats: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    fontWeight: '400',
  },

  // Spacer
  spacer: {
    height: 40,
  },

  // CTA Container
  ctaContainer: {
    gap: 12,
  },

  // Primary Button (Get Started)
  primaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  primaryButtonSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '400',
  },

  // Secondary Button (Sign In)
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 3,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  secondaryButtonSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '400',
  },
});

