import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Svg, Path } from 'react-native-svg';

interface TravelSearchCardProps {
  fromCity?: string;
  toCity?: string;
  greeting?: string;
  onFromPress?: () => void;
  onToPress?: () => void;
  onSwap?: () => void;
}

export default function TravelSearchCard({
  fromCity = 'New York',
  toCity = 'Dakar',
  greeting = '',
  onFromPress,
  onToPress,
  onSwap,
}: TravelSearchCardProps) {
  return (
    <View style={styles.hero}>
      {/* Blobs */}
      <View style={styles.blobBottom} />
      <View style={styles.blobTop} />

      {/* Greeting */}
      <Text style={styles.greeting}>{greeting || 'Welcome back'}</Text>
      <Text style={styles.headline}>Send a package</Text>

      {/* Route Box */}
      <View style={styles.routeBox}>
        {/* From Row */}
        <TouchableOpacity style={[styles.rrow, styles.rrowFrom]} onPress={onFromPress} activeOpacity={0.7}>
          <View style={styles.rind}>
            <View style={styles.rdot} />
            <View style={styles.rline} />
          </View>
          <View style={styles.rtext}>
            <Text style={styles.rsub}>From</Text>
            <Text style={styles.rcity}>{fromCity}</Text>
          </View>
        </TouchableOpacity>

        {/* To Row */}
        <TouchableOpacity style={styles.rrow} onPress={onToPress} activeOpacity={0.7}>
          <View style={styles.rind}>
            <View style={styles.rdotEmpty} />
          </View>
          <View style={styles.rtext}>
            <Text style={styles.rsub}>To</Text>
            <Text style={styles.rcity}>{toCity}</Text>
          </View>
          <TouchableOpacity style={styles.swapBtn} onPress={onSwap} activeOpacity={0.8}>
            <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
              <Path d="M8 2v12M4 10l4 4 4-4M4 6l4-4 4 4" stroke="#f0c84a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#0F7A4B',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 20 : 20,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },

  blobBottom: {
    position: 'absolute',
    bottom: -50, right: -30,
    width: 150, height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  blobTop: {
    position: 'absolute',
    top: -10, right: 50,
    width: 70, height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
  },

  greeting: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
    fontWeight: '500',
  },

  headline: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 20,
  },

  routeBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },

  rrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  rrowFrom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },

  rind: {
    width: 12,
    alignItems: 'center',
    gap: 2,
  },

  rdot: {
    width: 9, height: 9,
    borderRadius: 5,
    backgroundColor: '#fff',
  },

  rdotEmpty: {
    width: 9, height: 9,
    borderRadius: 5,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },

  rline: {
    width: 1.5,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  rtext: {
    flex: 1,
  },

  rsub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 1,
  },

  rcity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.3,
  },

  swapBtn: {
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(212,160,23,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
