import React, { useState } from 'react';
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
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SendPackageScreen = () => {
  const navigation = useNavigation<any>();
  const [fromCity, setFromCity] = useState('New York');
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [toCity, setToCity] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');

  const nyAreaCities = [
    'New York',
    'Brooklyn',
    'Queens',
    'Bronx',
    'Staten Island',
    'Manhattan',
    'Jersey City',
    'Newark',
  ];

  const filteredFromCities = nyAreaCities.filter((city) =>
    city.toLowerCase().includes(fromCity.toLowerCase())
  );

  const handleFromCitySelect = (city: string) => {
    setFromCity(city);
    setShowFromSuggestions(false);
  };

  const isFormValid = fromCity && toCity && weight && description;

  const handleCreateShipment = () => {
    if (!isFormValid) return;
    // Navigate to checkout with shipment data
    navigation.navigate('Checkout', {
      from: fromCity,
      to: toCity,
      weight: parseFloat(weight),
      description,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Send a Package</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* From City */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>From City (New York Area)</Text>
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Type to search (e.g., Brooklyn)"
                  value={fromCity}
                  onChangeText={setFromCity}
                  onFocus={() => setShowFromSuggestions(true)}
                  placeholderTextColor="#ccc"
                />
                {showFromSuggestions && filteredFromCities.length > 0 && (
                  <View style={styles.suggestionsBox}>
                    <FlatList
                      data={filteredFromCities}
                      keyExtractor={(item) => item}
                      scrollEnabled={false}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.suggestionItem}
                          onPress={() => handleFromCitySelect(item)}
                        >
                          <Text style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>
            </View>

            {/* To City */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>To City (Senegal)</Text>
              <View style={styles.selectContainer}>
                {['Dakar', 'Thiès', 'Kaolack', 'Saint-Louis'].map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.cityOption,
                      toCity === city && styles.cityOptionSelected,
                    ]}
                    onPress={() => setToCity(city)}
                  >
                    <Text
                      style={[
                        styles.cityOptionText,
                        toCity === city && styles.cityOptionTextSelected,
                      ]}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Weight */}
            <View style={styles.formGroup}>
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

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>What are you sending?</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your package contents..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor="#ccc"
              />
            </View>

            {/* Estimated Price */}
            <View style={styles.estimateBox}>
              <Text style={styles.estimateLabel}>Estimated Cost</Text>
              <Text style={styles.estimatePrice}>
                ${weight ? (parseFloat(weight) * 1.5).toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.estimateNote}>Price per kg: $1.50</Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isFormValid && styles.buttonDisabled,
            ]}
            onPress={handleCreateShipment}
            disabled={!isFormValid}
          >
            <Text style={styles.buttonText}>Continue to Payment</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  formContainer: {
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f8f9f7',
  },
  suggestionsBox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 200,
    marginTop: -12,
    paddingTop: 0,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cityOption: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9f7',
  },
  cityOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  cityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cityOptionTextSelected: {
    color: 'white',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  estimateBox: {
    backgroundColor: '#f0f9f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  estimateLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  estimatePrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  estimateNote: {
    fontSize: 12,
    color: '#999',
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default SendPackageScreen;


