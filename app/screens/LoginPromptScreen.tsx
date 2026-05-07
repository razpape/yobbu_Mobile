import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const LoginPromptScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const nextScreen = route.params?.screen || 'MessagesList';

  const getTitleAndSubtitle = () => {
    switch (nextScreen) {
      case 'MessagesList':
        return {
          title: 'Login to Message',
          subtitle: 'You need to log in to message travelers and coordinate package delivery',
        };
      case 'MyShipments':
        return {
          title: 'Login to View Shipments',
          subtitle: 'You need to log in to track your shipments and manage deliveries',
        };
      case 'PostRequest':
        return {
          title: 'Login to Post Request',
          subtitle: 'You need to log in to create a request and connect with travelers',
        };
      case 'SenderDashboard':
        return {
          title: 'Login to Request',
          subtitle: 'You need to log in to send a request to a traveler',
        };
      default:
        return {
          title: 'Login Required',
          subtitle: 'You need to log in to access this feature',
        };
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  const handleLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const handleBrowse = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>Go to Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.browseBtn} onPress={handleBrowse}>
          <Text style={styles.browseBtnText}>Continue Browsing</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#0F7A4B',
    borderRadius: 2,
    marginBottom: 32,
  },
  loginBtn: {
    backgroundColor: '#0F7A4B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  browseBtn: {
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  browseBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});

export default LoginPromptScreen;


