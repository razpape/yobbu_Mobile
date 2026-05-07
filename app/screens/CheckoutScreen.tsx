import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { from, to, weight, description } = route.params || {};
  const [paymentType, setPaymentType] = useState<'app' | 'gp'>('app');

  const costPerKg = 1.5;
  const subtotal = weight ? weight * costPerKg : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handlePayment = () => {
    // Process payment
    alert('Payment successful! Your shipment has been created.');
    navigation.navigate('SenderDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Payment</Text>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Route</Text>
              <Text style={styles.summaryValue}>
                {from} → {to}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryRow, { borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }]}>
            <Text style={styles.summaryLabel}>Weight</Text>
            <Text style={styles.summaryValue}>{weight} kg</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price per kg</Text>
            <Text style={styles.summaryValue}>${costPerKg}</Text>
          </View>
        </View>

        {/* Total Price */}
        <View style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Type */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How to Pay?</Text>

          <TouchableOpacity
            style={[
              styles.paymentTypeOption,
              paymentType === 'app' && styles.paymentTypeOptionSelected,
            ]}
            onPress={() => setPaymentType('app')}
          >
            <View
              style={[
                styles.radio,
                paymentType === 'app' && styles.radioSelected,
              ]}
            />
            <Text style={styles.paymentLabel}>Pay through Yobbu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentTypeOption,
              paymentType === 'gp' && styles.paymentTypeOptionSelected,
            ]}
            onPress={() => setPaymentType('gp')}
          >
            <View
              style={[
                styles.radio,
                paymentType === 'gp' && styles.radioSelected,
              ]}
            />
            <Text style={styles.paymentLabel}>Pay GP Directly</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.payButtonText}>Confirm</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 24,
  },
  backButton: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  card: {
    backgroundColor: '#f8f9f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
  },
  radioSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  paymentTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  paymentTypeOptionSelected: {
    backgroundColor: '#f0f9f6',
    borderColor: '#3B82F6',
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  payButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default CheckoutScreen;


