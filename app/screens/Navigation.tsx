// screens/Navigation.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { storage } from '../lib/storage';
import Svg, { Circle, Path } from 'react-native-svg';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Import your screens
import SplashScreen from './SplashScreen';
import HookScreen from './HookScreen';
import LoginScreen from './LoginScreen';
import LoginPromptScreen from './LoginPromptScreen';
import PhoneVerificationScreen from './PhoneVerificationScreen';
import OnboardingTourScreen from './OnboardingTourScreen';
import ProfileScreen from './ProfileScreen';
import SignUpScreen from './SignUpScreen';
import SenderDashboard from './SenderDashboard';
import MyShipmentsScreen from './MyShipmentsScreen';
import MessagesScreen from './MessagesScreen';
import MessagesListScreen from './MessagesListScreen';
import ShipmentDetailsScreen from './ShipmentDetailsScreen';
import SettingsScreen from './SettingsScreen';
import PostRequestScreen from './PostRequestScreen';
import OTPScreen from './OTPScreen';
import OnboardingScreen from './OnboardingScreen';
import EditProfileScreen from './EditProfileScreen';
import PreferencesScreen from './PreferencesScreen';
import TravelerWaitlistScreen from './TravelerWaitlistScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeIcon = ({ color = '#0F7A4B', filled = false }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path d="M12 2L21 10V21H3V10L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={filled ? color : 'none'} />
    <Path d="M9 21V13H15V21" stroke={filled ? 'white' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ShipmentsIcon = ({ color = '#0F7A4B' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M9 2H15C15.5304 2 16.0391 2.21071 16.4142 2.58579C16.7893 2.96086 17 3.46957 17 4V9H7V4C7 3.46957 7.21071 2.96086 7.58579 2.58579C7.96086 2.21071 8.46957 2 9 2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 9H17V20C17 20.5304 16.7893 21.0391 16.4142 21.4142C16.0391 21.7893 15.5304 22 15 22H9C8.46957 22 7.96086 21.7893 7.58579 21.4142C7.21071 21.0391 7 20.5304 7 20V9Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 13H14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 17H14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MessagesIcon = ({ color = '#0F7A4B' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ProfileIcon = ({ color = '#0F7A4B' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PostTripIcon = ({ color = '#0F7A4B' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3 20L20 3M20 3L17 8M20 3L15 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ProfileTabIcon = ({ photoUri, fullName, color }) => {
  const initials = fullName ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'JD';

  return (
    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color === '#0F7A4B' ? '#0F7A4B' : '#e0e0e0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: 24, height: 24 }} />
      ) : (
        <Text style={{ fontSize: 10, fontWeight: '800', color: color === '#0F7A4B' ? '#fff' : '#999' }}>{initials}</Text>
      )}
    </View>
  );
};

const SenderTabNavigator = ({ photoUri, fullName }) => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#0F7A4B',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: { borderTopWidth: 1, borderTopColor: '#e5e5e5', height: 60, paddingBottom: 8 },
    }}
  >
    <Tab.Screen
      name="Home"
      component={SenderDashboard}
      options={{
        tabBarIcon: ({ color }) => <HomeIcon color={color} filled={color === '#0F7A4B'} />,
        tabBarLabel: 'Home',
      }}
    />

    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color }) => <ProfileTabIcon photoUri={photoUri} fullName={fullName} color={color} />,
        tabBarLabel: 'Profile',
      }}
    />
  </Tab.Navigator>
);


const Navigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await storage.getItem('userToken');
        const photo = await storage.getItem('photoUri');
        const name = await storage.getItem('fullName');
        const phoneVer = await storage.getItem('phone_verified');
        const onboarded = await storage.getItem('onboardingComplete');
        setUserToken(token);
        setPhotoUri(photo);
        setFullName(name || '');
        setPhoneVerified(phoneVer === 'true');
        setOnboardingComplete(onboarded === 'true');
      } catch (e) {
        console.error('Failed to restore token', e);
        setUserToken(null);
      }
    };

    // Show splash for 4 seconds minimum
    const timer = setTimeout(async () => {
      await bootstrapAsync();
      setIsLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Listen for token changes and profile updates
  useEffect(() => {
    const checkToken = async () => {
      const token = await storage.getItem('userToken');
      const photo = await storage.getItem('photoUri');
      const name = await storage.getItem('fullName');
      const phoneVer = await storage.getItem('phone_verified');
      setUserToken(token);
      setPhotoUri(photo);
      setFullName(name || '');
      setPhoneVerified(phoneVer === 'true');
    };

    const interval = setInterval(checkToken, 500);
    return () => clearInterval(interval);
  }, []);

  // While splash is loading, show splash screen
  if (isLoading) {
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="HookScreen" component={HookScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContext.Provider value={{ userToken, setUserToken }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!userToken ? (
            <>
              <Stack.Screen name="HookScreen" component={HookScreen} />
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="LoginPrompt" component={LoginPromptScreen} />
              <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
              <Stack.Screen name="OTP" component={OTPScreen} />
              <Stack.Screen name="TravelerWaitlist" component={TravelerWaitlistScreen} />
            </>
          ) : !phoneVerified ? (
            <>
              <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />
            </>
          ) : !onboardingComplete ? (
            <>
              <Stack.Screen name="OnboardingTour" component={OnboardingTourScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="AuthTabs" options={{ headerShown: false }}>
                {() => (
                  <SenderTabNavigator
                    photoUri={photoUri}
                    fullName={fullName}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="ShipmentDetails" component={ShipmentDetailsScreen} />
              <Stack.Screen name="Messages" component={MessagesScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="PostRequest" component={PostRequestScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Preferences" component={PreferencesScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationContext.Provider>
  );
};

const styles = StyleSheet.create({});

const NavigationContext = React.createContext<{
  userToken: string | null;
  setUserToken: (t: string | null) => void;
} | null>(null);

export { NavigationContext };

export default Navigation;

