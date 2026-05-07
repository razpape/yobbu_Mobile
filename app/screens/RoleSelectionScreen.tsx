import React, { useContext } from 'react';
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
import { NavigationContext } from './Navigation';
import YobbuLogo from '../components/YobbuLogo';

const RoleSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const context = useContext(NavigationContext);

  const handleRoleSelection = (role: 'traveler' | 'sender') => {
    if (context?.setUserRole) {
      context.setUserRole(role);
    }
    navigation.navigate('LoginScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <YobbuLogo width={52} height={52} />
        </View>

        <Text style={styles.title}>Welcome to Yobbu</Text>
        <Text style={styles.subtitle}>Choose how you want to use Yobbu</Text>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelection('traveler')}
          activeOpacity={0.85}
        >
          <View style={styles.roleIconContainer}>
            <Text style={styles.roleIcon}>✈️</Text>
          </View>
          <View style={styles.roleContent}>
            <Text style={styles.roleName}>I'm a Traveler</Text>
            <Text style={styles.roleDescription}>
              Earn money by carrying packages on your trips
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelection('sender')}
          activeOpacity={0.85}
        >
          <View style={styles.roleIconContainer}>
            <Text style={styles.roleIcon}>📦</Text>
          </View>
          <View style={styles.roleContent}>
            <Text style={styles.roleName}>I'm a Sender</Text>
            <Text style={styles.roleDescription}>
              Send packages affordably through trusted travelers
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          You can switch roles anytime after signing up
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 32, paddingBottom: 60 },

  logoContainer: { alignItems: 'center', marginBottom: 40 },

  title: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 40, textAlign: 'center', lineHeight: 22 },

  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    gap: 16,
  },

  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f0f9f6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  roleIcon: { fontSize: 32 },

  roleContent: { flex: 1 },

  roleName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },

  roleDescription: { fontSize: 13, color: '#666', fontWeight: '500' },

  arrow: { fontSize: 20, color: '#0F7A4B', fontWeight: '700' },

  footerText: { fontSize: 12, color: '#bbb', textAlign: 'center', marginTop: 40, lineHeight: 18 },
});

export default RoleSelectionScreen;
