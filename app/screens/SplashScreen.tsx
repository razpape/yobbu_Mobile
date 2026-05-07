import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const Plane = ({ size = 28, color = '#fff', opacity = 1 }: { size?: number; color?: string; opacity?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity={opacity}>
    <Path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
  </Svg>
);

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const usePlaneFlight = (config: {
  size: number;
  color: string;
  opacity: number;
  angle: number;
  speed: number;
  delay: number;
}) => {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fly = () => {
      const startX = rand(width * 0.05, width * 0.85);
      const startY = rand(height * 0.05, height * 0.75);
      x.setValue(startX);
      y.setValue(startY);
      fade.setValue(0);

      const rad = (config.angle * Math.PI) / 180;
      const dist = Math.max(width, height) * 0.8;
      const endX = startX + dist * Math.cos(rad);
      const endY = startY + dist * Math.sin(rad);
      const duration = (dist / config.speed) * 1000;

      Animated.sequence([
        Animated.timing(fade, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(x, { toValue: endX, duration, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(y, { toValue: endY, duration, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(duration * 0.65),
            Animated.timing(fade, { toValue: 0, duration: duration * 0.35, useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => setTimeout(fly, rand(200, 800)));
    };

    const t = setTimeout(fly, config.delay);
    return () => clearTimeout(t);
  }, []);

  return { x, y, fade, config };
};

const SplashScreen = () => {
  const logoScale     = useRef(new Animated.Value(0)).current;
  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const logoRotate    = useRef(new Animated.Value(0)).current;
  const textSlide     = useRef(new Animated.Value(30)).current;
  const textOpacity   = useRef(new Animated.Value(0)).current;
  const tagSlide      = useRef(new Animated.Value(20)).current;
  const tagOpacity    = useRef(new Animated.Value(0)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const floatAnim     = useRef(new Animated.Value(0)).current;
  const glowAnim      = useRef(new Animated.Value(0.6)).current;
  const dot1Opacity   = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity   = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity   = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 1, duration: 500, easing: Easing.out(Easing.elastic(1)), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textSlide, { toValue: 0, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(tagSlide, { toValue: 0, duration: 360, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(tagOpacity, { toValue: 1, duration: 360, useNativeDriver: true }),
      ]),
      Animated.timing(bottomOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -10, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.5, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    const waveDot = (anim: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        Animated.delay(800 - delay),
      ])).start();
    waveDot(dot1Opacity, 0);
    waveDot(dot2Opacity, 200);
    waveDot(dot3Opacity, 400);
  }, []);

  const spin = logoRotate.interpolate({ inputRange: [0, 1], outputRange: ['-15deg', '0deg'] });

  const planes = [
    usePlaneFlight({ size: 30, color: '#fff',    opacity: 0.95, angle: -20,  speed: 180, delay: 0    }),
    usePlaneFlight({ size: 24, color: '#F59E0B', opacity: 0.9,  angle: 160,  speed: 140, delay: 400  }),
    usePlaneFlight({ size: 20, color: '#D8F3DC', opacity: 0.85, angle: -45,  speed: 200, delay: 800  }),
    usePlaneFlight({ size: 22, color: '#fff',    opacity: 0.75, angle: 135,  speed: 160, delay: 200  }),
    usePlaneFlight({ size: 18, color: '#F59E0B', opacity: 0.8,  angle: 30,   speed: 220, delay: 1000 }),
  ];

  const rotationStyle = (angle: number) => `${angle + 90}deg`;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2D7D46', '#1B5E38']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobBottomRight]} />

      {planes.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.planeBase,
            {
              opacity: p.fade,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { rotate: rotationStyle(p.config.angle) },
              ],
            },
          ]}
        >
          <Plane size={p.config.size} color={p.config.color} opacity={p.config.opacity} />
        </Animated.View>
      ))}

      {/* Logo */}
      <Animated.View
        style={[styles.logoWrapper, {
          transform: [{ scale: logoScale }, { rotate: spin }, { translateY: floatAnim }],
          opacity: logoOpacity,
        }]}
      >
        <Animated.View style={[styles.logoCircle, { opacity: glowAnim }]} />
        <Text style={styles.logoLetter}>Y</Text>
      </Animated.View>

      <Animated.Text style={[styles.brandText, { opacity: textOpacity, transform: [{ translateY: textSlide }] }]}>
        Yobbu
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: tagOpacity, transform: [{ translateY: tagSlide }] }]}>
        Oh, shipping to Africa
      </Animated.Text>

      <Animated.View style={[styles.bottom, { opacity: bottomOpacity }]}>
        <Text style={styles.poweredBy}>Powered by community</Text>
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, styles.dotActive, { opacity: dot1Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, width, height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B5E38',
    overflow: 'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.15 },
  blobTopLeft: { width: 280, height: 280, backgroundColor: '#fff', top: -80, left: -80 },
  blobBottomRight: { width: 240, height: 240, backgroundColor: '#fff', bottom: -60, right: -60 },

  planeBase: { position: 'absolute' },

  logoWrapper: { marginBottom: 32, alignItems: 'center', justifyContent: 'center' },
  logoCircle: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
  },
  logoLetter: { fontSize: 90, fontWeight: '900', color: '#fff', letterSpacing: -2, zIndex: 1 },
  brandText: { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 10 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

  bottom: { position: 'absolute', bottom: 52, alignItems: 'center', gap: 16 },
  poweredBy: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 20, borderRadius: 3, backgroundColor: '#fff' },
});

export default SplashScreen;
