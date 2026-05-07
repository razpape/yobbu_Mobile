import React, { useEffect, useState } from 'react';
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

const BookingConfirmationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { gp, city, date } = route.params || {};
  const [bookingRef] = useState(`BK${Math.random().toString(36).substring(2, 9).toUpperCase()}`);

  const dateDisplay: { [key: string]: string } = {
    '2024-04-28': 'Today',
    '2024-04-29': 'Tomorrow',
    '2024-04-30': 'Apr 30',
    '2024-05-01': 'May 1',
    '2024-05-02': 'May 2',
    '2024-05-03': 'May 3',
    '2024-05-04': 'May 4',
  };

  const getInitialColor = (initial: string) => {
    const colors: { [key: string]: string } = {
      M: '#3B82F6',
      A: '#e94b8d',
      J: '#ff6b6b',
      S: '#4c6ef5',
    };
    return colors[initial] || '#3B82F6';
  };

  if (!gp || !city || !date) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking information not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Icon & Header */}
        <View style={styles.successSection}>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>Your package is ready to travel</Text>
        </View>

        {/* Booking Reference */}
        <View style={styles.referenceBox}>
          <Text style={styles.referenceLabel}>Booking Reference</Text>
          <Text style={styles.referenceNumber}>{bookingRef}</Text>
        </View>

        {/* Traveler Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traveling With</Text>
          <View style={styles.travelerCard}>
            <View
              style={[
                styles.travelerAvatar,
                { backgroundColor: getInitialColor(gp.initial) },
              ]}
            >
              <Text style={styles.travelerAvatarText}>{gp.initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.travelerName}>{gp.name}</Text>
              <Text style={styles.travelerRating}>
                {gp.rating.toFixed(1)} â­ · {gp.trips} trips
              </Text>
              <Text style={styles.travelerMember}>
                Member for {gp.memberSince} years
              </Text>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.detailsBox}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Route</Text>
              <Text style={styles.detailValue}>{gp.route}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Departure Date</Text>
              <Text style={styles.detailValue}>
                {dateDisplay[date as keyof typeof dateDisplay]}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Destination</Text>
              <Text style={styles.detailValue}>{city}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Price per kg</Text>
              <Text style={styles.detailValue}>{gp.pricePerKg}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Available Capacity</Text>
              <Text style={styles.detailValue}>{gp.weight}</Text>
            </View>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Create Your Shipment</Text>
                <Text style={styles.stepDesc}>
                  Add package details and weight
                </Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Review & Confirm</Text>
                <Text style={styles.stepDesc}>Check your order summary</Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Hand Off Package</Text>
                <Text style={styles.stepDesc}>
                  Coordinate pickup with {gp.name}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SendPackage')}
        >
          <Text style={styles.primaryButtonText}>Create Shipment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SenderDashboard')}
        >
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 140,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  successSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
  },
  checkmarkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f0f9f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 40,
    color: '#3B82F6',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  referenceBox: {
    backgroundColor: '#f0f9f6',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#e8f5f0',
  },
  referenceLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 6,
  },
  referenceNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  travelerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9f7',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  travelerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  travelerAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  travelerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  travelerRating: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  travelerMember: {
    fontSize: 11,
    color: '#999',
  },
  detailsBox: {
    backgroundColor: '#f8f9f7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  detailItem: {
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});

export default BookingConfirmationScreen;


