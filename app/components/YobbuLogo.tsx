import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';

interface YobbuLogoProps {
  width?: number;
  height?: number;
  color?: 'gradient' | 'white' | 'green';
}

const YobbuLogo: React.FC<YobbuLogoProps> = ({ width = 100, height = 100, color = 'gradient' }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="yobbuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0ea87a" stopOpacity="1" />
          <Stop offset="100%" stopColor="#0d8659" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Background rounded rect */}
      <Rect
        width="100"
        height="100"
        rx="18"
        fill={
          color === 'gradient'
            ? '#0ea87a'
            : color === 'white'
            ? 'white'
            : '#0ea87a'
        }
      />

      {/* Y shape - Left arm */}
      <Path
        d="M 35 25 L 50 50"
        stroke={color === 'white' ? '#0ea87a' : 'white'}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Y shape - Right arm */}
      <Path
        d="M 65 25 L 50 50"
        stroke={color === 'white' ? '#0ea87a' : 'white'}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Y shape - Stem */}
      <Path
        d="M 50 50 L 50 75"
        stroke={color === 'white' ? '#0ea87a' : 'white'}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

export default YobbuLogo;

