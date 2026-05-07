import React from 'react';
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

const ShipmentDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const shipment = route.params?.shipment;

  if (!shipment) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No shipment found</Text>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#0F7A4B';
      case 'in-transit':
        return '#0F7A4B';
      case 'pending':
        return '#ff9800';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'in-transit':
        return 'In Transit';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Shipment Details</Text>
        </View>

        {/* Route Card */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.route}>{shipment.from} → {shipment.to}</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(shipment.status) }]} />
              <Text style={[styles.statusLabel, { color: getStatusColor(shipment.status) }]}>
                {getStatusLabel(shipment.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{shipment.weight} kg</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cost</Text>
              <Text style={styles.detailValue}>{shipment.cost}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>{shipment.date.split('-')[2]}</Text>
            </View>
          </View>
        </View>

        {/* Traveler Info */}
        {shipment.traveler ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Traveler</Text>
            <View style={styles.travelerRow}>
              <View style={[styles.avatar, { backgroundColor: '#0F7A4B' }]}>
                <Text style={styles.avatarText}>{shipment.traveler.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.travelerName}>{shipment.traveler}</Text>
                <Text style={styles.travelerMeta}>5.0 rating â€¢ 62 trips</Text>
              </View>
              <Text style={styles.verifiedBadge}>Verified</Text>
            </View>
            <TouchableOpacity style={styles.messageButton}>
              <Text style={styles.messageButtonText}>Message Traveler</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Traveler</Text>
            <Text style={styles.waitingText}>Waiting for traveler to accept</Text>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#e5e5e5' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Package Created</Text>
                <Text style={styles.timelineDate}>{shipment.date}</Text>
              </View>
            </View>

            {shipment.status !== 'pending' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: getStatusColor(shipment.status) }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    {shipment.status === 'in-transit' ? 'In Transit' : 'Delivered'}
                  </Text>
                  <Text style={styles.timelineDate}>
                    {shipment.status === 'in-transit' ? 'Currently on the way' : 'Apr 20, 2024'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {shipment.status === 'pending' && (
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel Shipment</Text>
          </TouchableOpacity>
        )}
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

  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e5e5' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  route: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8f9f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 12, fontWeight: '600' },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', borderRadius: 10, paddingVertical: 12 },
  detailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: 10, color: '#999', fontWeight: '500', marginBottom: 3 },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  detailDivider: { width: 1, height: 20, backgroundColor: '#e5e5e5' },

  travelerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  travelerName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  travelerMeta: { fontSize: 12, color: '#999', marginTop: 2 },
  verifiedBadge: { fontSize: 11, fontWeight: '600', color: '#0F7A4B', backgroundColor: '#E6F4ED', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  messageButton: { backgroundColor: '#0F7A4B', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  messageButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  waitingText: { fontSize: 13, color: '#999', fontWeight: '500' },

  timeline: { gap: 16 },
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3, flexShrink: 0 },
  timelineContent: { flex: 1 },
  timelineTitle: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  timelineDate: { fontSize: 12, color: '#999' },

  cancelButton: { borderWidth: 2, borderColor: '#ff6b6b', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  cancelButtonText: { fontSize: 16, fontWeight: '700', color: '#ff6b6b' },
});

export default ShipmentDetailsScreen;


