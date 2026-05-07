import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function PreferencesScreen() {
  const navigation = useNavigation<any>();
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const languages = ['English', 'Français', 'Wolof'];
  const currencyOptions = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'XOF', symbol: 'F', name: 'West African Franc' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Preferences</Text>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          {languages.map(lang => (
            <TouchableOpacity
              key={lang}
              style={styles.optionRow}
              onPress={() => setLanguage(lang)}
            >
              <Text style={styles.optionLabel}>{lang}</Text>
              {language === lang && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Currency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          {currencyOptions.map(cur => (
            <TouchableOpacity
              key={cur.code}
              style={[styles.optionRow, currency === cur.code && styles.optionRowSelected]}
              onPress={() => setCurrency(cur.code)}
            >
              <View>
                <Text style={styles.optionLabel}>{cur.symbol} {cur.code}</Text>
                <Text style={styles.optionDesc}>{cur.name}</Text>
              </View>
              {currency === cur.code && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          <View style={styles.optionRow}>
            <View>
              <Text style={styles.optionLabel}>Dark mode</Text>
              <Text style={styles.optionDesc}>{darkMode ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: '#0F7A4B', false: '#e5e5e5' }} thumbColor={darkMode ? '#0F7A4B' : '#fff'} />
          </View>
          <View style={styles.optionRow}>
            <View>
              <Text style={styles.optionLabel}>Email notifications</Text>
              <Text style={styles.optionDesc}>Receive updates by email</Text>
            </View>
            <Switch value={emailNotifs} onValueChange={setEmailNotifs} trackColor={{ true: '#0F7A4B' }} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  header: { paddingTop: 20, marginBottom: 32 },
  back: { fontSize: 14, color: '#0F7A4B', fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#999', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },

  optionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 14,
    backgroundColor: '#fafafa', borderRadius: 12,
    borderWidth: 1, borderColor: '#ebebeb', marginBottom: 8,
  },
  optionRowSelected: { backgroundColor: '#E6F4ED', borderColor: '#0F7A4B' },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  optionDesc: { fontSize: 12, color: '#999', marginTop: 2 },
  check: { fontSize: 16, color: '#0F7A4B', fontWeight: '700' },
});


