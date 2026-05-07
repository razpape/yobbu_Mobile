import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { routeConfig, allCities, getCityEmoji } from '../lib/routes';
import { NavigationContext } from './Navigation';
import { scanPackage } from '../lib/scanPackage';

const itemOptions = ['Clothes', 'Electronics', 'Food Items', 'Documents', 'Other'];

const PostRequestScreen = () => {
  const navigation = useNavigation<any>();
  const context = useContext(NavigationContext);
  const [fromCity, setFromCity] = useState('New York');
  const [toCity, setToCity] = useState('Dakar');
  const [selectedDate, setSelectedDate] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customItem, setCustomItem] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const scanAndFill = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setPhotos(prev => [...prev, uri].slice(0, 4));
    setScanning(true);
    setScanResult(null);
    const data = await scanPackage(uri);
    setScanning(false);
    if (data) {
      if (data.weightEstimate) setWeight(data.weightEstimate);
      const validCategories = ['Clothes', 'Electronics', 'Food Items', 'Documents', 'Other'];
      const matchedCategory = validCategories.includes(data.category) ? data.category : 'Other';
      setSelectedItem(matchedCategory);
      if (matchedCategory === 'Other') setCustomItem(data.itemName);
      setScanResult(`✓ ${data.itemName} — ${data.description}`);
    } else {
      setScanResult('⚠ Scan failed — check your connection and try again');
    }
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      setPhotos(prev => [...prev, ...uris].slice(0, 4));
    }
  };

  // Generate dynamic dates relative to today
  const getDateOptions = () => {
    const d0 = new Date(); d0.setHours(0,0,0,0);
    const opts = [];
    const monthShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let i = 0; i < 14; i++) {
      const d = new Date(d0); d.setDate(d0.getDate() + i);
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${monthShort[d.getMonth()]} ${d.getDate()}`;
      const value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      opts.push({ label, value });
    }
    return opts;
  };
  const dateOptions = getDateOptions();

  const getNextDestination = (origin: string) => routeConfig[origin]?.[0] || '';
  const destinationsByOrigin: { [key: string]: string } = {};
  allCities.forEach(city => {
    destinationsByOrigin[city] = getNextDestination(city);
  });

  useEffect(() => {
    setToCity(destinationsByOrigin[fromCity]);
    setSelectedDate('');
    setSelectedItems([]);
    setCustomItem('');
  }, [fromCity]);

  const toggleItem = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
    if (item !== 'Other') setCustomItem('');
  };

  const finalDescription = selectedItems.length > 0
    ? selectedItems.includes('Other')
      ? [customItem, ...selectedItems.filter(i => i !== 'Other')].filter(Boolean).join(', ')
      : selectedItems.join(', ')
    : '';
  const isValid = fromCity && toCity && selectedDate && weight && finalDescription;

  const handlePost = () => {
    if (!isValid) return;
    navigation.navigate('SenderDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalContent}>
            <View style={styles.dateModalHeader}>
              <Text style={styles.dateModalTitle}>Pick a date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.dateModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {dateOptions.map(date => (
                <TouchableOpacity
                  key={date.value}
                  style={[styles.dateOption, selectedDate === date.value && styles.dateOptionSelected]}
                  onPress={() => { setSelectedDate(date.value); setShowDatePicker(false); }}
                >
                  <Text style={[styles.dateOptionText, selectedDate === date.value && styles.dateOptionTextSelected]}>
                    {date.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backBtn}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Post a Request</Text>
            <Text style={styles.subtitle}>Travelers will see your request and reach out</Text>
          </View>

          {/* From */}
          <View style={styles.section}>
            <Text style={styles.label}>From</Text>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setShowFromDropdown(!showFromDropdown)}
            >
              <Text style={styles.dropdownBtnText}>{getCityEmoji(fromCity)} {fromCity}</Text>
              <Text style={[styles.dropdownArrow, showFromDropdown && styles.dropdownArrowOpen]}>▼</Text>
            </TouchableOpacity>
            {showFromDropdown && (
              <View style={styles.dropdownListContainer}>
                {allCities.map(city => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.dropdownListItem, fromCity === city && styles.dropdownListItemSelected]}
                    onPress={() => { setFromCity(city); setShowFromDropdown(false); }}
                  >
                    <Text style={[styles.dropdownListItemText, fromCity === city && styles.dropdownListItemTextSelected]}>
                      {getCityEmoji(city)} {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* To */}
          <View style={styles.section}>
            <Text style={styles.label}>To</Text>
            <View style={styles.fixedField}>
              <Text style={styles.fixedFieldText}>
                {getCityEmoji(toCity)} {toCity}
              </Text>
            </View>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Ready by</Text>
            <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.datePickerText, selectedDate && styles.datePickerTextSelected]}>
                {selectedDate ? dateOptions.find(d => d.value === selectedDate)?.label : 'Pick a date'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Weight */}
          <View style={styles.section}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholderTextColor="#ccc"
            />
          </View>

          {/* What are you sending */}
          <View style={styles.section}>
            <Text style={styles.label}>What are you sending? <Text style={styles.labelOptional}>(select multiple)</Text></Text>
            <View style={styles.itemGrid}>
              {itemOptions.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[styles.itemBtn, selectedItems.includes(item) && styles.itemBtnSelected]}
                  onPress={() => toggleItem(item)}
                >
                  <Text style={[styles.itemBtnText, selectedItems.includes(item) && styles.itemBtnTextSelected]}>
                    {selectedItems.includes(item) ? '✓ ' : ''}{item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedItems.includes('Other') && (
              <TextInput
                style={[styles.input, { marginTop: 12 }]}
                placeholder="Enter item type..."
                value={customItem}
                onChangeText={setCustomItem}
                placeholderTextColor="#ccc"
              />
            )}
          </View>

          {/* Package Photos */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Package Photos <Text style={styles.labelOptional}>(optional)</Text></Text>
              <TouchableOpacity style={styles.scanBtn} onPress={scanAndFill} disabled={scanning}>
                {scanning
                  ? <ActivityIndicator size="small" color="#0F7A4B" />
                  : <Text style={styles.scanBtnText}>✦ Scan & Auto-fill</Text>}
              </TouchableOpacity>
            </View>
            {scanResult ? (
              <View style={styles.scanResultBox}>
                <Text style={styles.scanResultText}>{scanResult}</Text>
              </View>
            ) : null}
            <Text style={styles.photoHint}>Helps travelers know what they're carrying</Text>
            <View style={styles.photoGrid}>
              {photos.map((uri, i) => (
                <View key={i} style={styles.photoThumbWrapper}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    <Text style={styles.photoRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 4 && (
                <TouchableOpacity style={styles.photoAddBtn} onPress={pickPhoto}>
                  <Text style={styles.photoAddIcon}>+</Text>
                  <Text style={styles.photoAddText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Price estimate */}
          {weight ? (
            <View style={styles.estimateBox}>
              <Text style={styles.estimateLabel}>Estimated cost</Text>
              <Text style={styles.estimateValue}>${(parseFloat(weight) * 1.5).toFixed(2)}</Text>
              <Text style={styles.estimateNote}>Based on $1.50/kg</Text>
            </View>
          ) : null}

        </ScrollView>

        {/* Post Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.postBtn, !isValid && styles.postBtnDisabled]}
            onPress={handlePost}
            disabled={!isValid}
          >
            <Text style={styles.postBtnText}>Post Request</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  header: { marginBottom: 28 },
  backBtn: { fontSize: 14, color: '#0F7A4B', fontWeight: '600', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#999', fontWeight: '500' },

  section: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },

  fixedField: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  fixedFieldText: { fontSize: 15, fontWeight: '600', color: '#666' },

  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#fafafa', borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e5e5' },
  dropdownBtnText: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  dropdownArrow: { fontSize: 12, color: '#999' },
  dropdownArrowOpen: { color: '#0F7A4B' },
  dropdownListContainer: { borderWidth: 1.5, borderColor: '#e5e5e5', borderTopWidth: 0, borderRadius: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: '#fafafa', marginTop: -8 },
  dropdownListItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownListItemSelected: { backgroundColor: '#E6F4ED' },
  dropdownListItemText: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  dropdownListItemTextSelected: { fontWeight: '700', color: '#0F7A4B' },

  datePickerBtn: {
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: '#fafafa',
  },
  datePickerText: { fontSize: 15, color: '#999', fontWeight: '500' },
  datePickerTextSelected: { color: '#1a1a1a', fontWeight: '600' },

  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  itemBtn: {
    flex: 1,
    minWidth: '30%',
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  itemBtnSelected: { backgroundColor: '#0F7A4B', borderColor: '#0F7A4B' },
  itemBtnText: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  itemBtnTextSelected: { color: '#fff' },

  labelOptional: { fontSize: 12, color: '#999', fontWeight: '400' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  scanBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F4ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#0F7A4B' },
  scanBtnText: { fontSize: 12, color: '#0F7A4B', fontWeight: '700' },
  scanResultBox: { backgroundColor: '#E6F4ED', borderRadius: 10, padding: 12, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#0F7A4B' },
  scanResultText: { fontSize: 13, color: '#1a1a1a', fontWeight: '500', lineHeight: 18 },
  photoHint: { fontSize: 12, color: '#999', marginBottom: 12, marginTop: -4 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoThumbWrapper: { position: 'relative' },
  photoThumb: { width: 80, height: 80, borderRadius: 10 },
  photoRemove: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#0F7A4B', justifyContent: 'center', alignItems: 'center',
  },
  photoRemoveText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  photoAddBtn: {
    width: 80, height: 80, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#e5e5e5', borderStyle: 'dashed',
    backgroundColor: '#fafafa', justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  photoAddIcon: { fontSize: 24, color: '#0F7A4B', fontWeight: '300' },
  photoAddText: { fontSize: 11, color: '#0F7A4B', fontWeight: '600' },

  input: {
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },

  estimateBox: {
    backgroundColor: '#E6F4ED',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  estimateLabel: { fontSize: 12, color: '#666', fontWeight: '500', marginBottom: 4 },
  estimateValue: { fontSize: 26, fontWeight: '800', color: '#0F7A4B', marginBottom: 2 },
  estimateNote: { fontSize: 12, color: '#999' },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  postBtn: {
    backgroundColor: '#0F7A4B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  postBtnDisabled: { backgroundColor: '#ccc', opacity: 0.6 },
  postBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  dateModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  dateModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingVertical: 20, maxHeight: '70%' },
  dateModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dateModalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  dateModalClose: { fontSize: 20, color: '#999', fontWeight: '700' },
  dateOption: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dateOptionSelected: { backgroundColor: '#f5f5f5' },
  dateOptionText: { fontSize: 15, color: '#1a1a1a', fontWeight: '500' },
  dateOptionTextSelected: { fontWeight: '700' },
});

export default PostRequestScreen;


