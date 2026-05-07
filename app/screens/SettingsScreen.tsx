import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Shipment updates and alerts</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#ccc', true: '#0F7A4B' }}
              thumbColor="#fff"
            />
          </View>

        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.settingDesc}>English</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Currency</Text>
              <Text style={styles.settingDesc}>USD ($)</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Default Location</Text>
              <Text style={styles.settingDesc}>New York, USA</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Help Center</Text>
              <Text style={styles.settingDesc}>FAQs and guides</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Contact Support</Text>
              <Text style={styles.settingDesc}>Get help from our team</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Report an Issue</Text>
              <Text style={styles.settingDesc}>Let us know about problems</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>App Version</Text>
              <Text style={styles.settingDesc}>1.0.0</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backButton: { fontSize: 14, color: '#0F7A4B', fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#999', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e5e5e5' },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  settingDesc: { fontSize: 12, color: '#999' },
  arrow: { fontSize: 14, color: '#0F7A4B', fontWeight: '600' },
});

export default SettingsScreen;


