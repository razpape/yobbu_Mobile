import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationContext } from './Navigation';
import { getCityEmoji } from '../lib/routes';

export default function TravelerProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const context = useContext(NavigationContext);
  const { traveler } = route.params || {};

  const getInitialColor = (initial: string) => {
    const colors: { [key: string]: string } = {
      M: '#0F7A4B', A: '#e94b8d', I: '#ff6b6b', J: '#ff6b6b', S: '#4c6ef5',
      F: '#f59e0b', O: '#8b5cf6', N: '#06b6d4', Y: '#ec4899', R: '#f97316',
      C: '#3b82f6', K: '#10b981', B: '#f59e0b',
    };
    return colors[initial] || '#0F7A4B';
  };

  if (!traveler) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: getInitialColor(traveler.initial) }]}>
            <Text style={styles.avatarText}>{traveler.initial}</Text>
          </View>
          <Text style={styles.name}>{traveler.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.rating}>{traveler.rating.toFixed(1)}</Text>
            <Text style={styles.trips}>· {traveler.trips} trips</Text>
          </View>
          {traveler.success >= 97 ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified Traveler</Text>
            </View>
          ) : (
            <View style={[styles.verifiedBadge, { backgroundColor: '#fff8e6' }]}>
              <Text style={[styles.verifiedText, { color: '#b45309' }]}>⚠ Not yet verified</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{traveler.trips}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{traveler.success}%</Text>
            <Text style={styles.statLabel}>Success</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{traveler.responds}</Text>
            <Text style={styles.statLabel}>Response</Text>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Trip</Text>
          <View style={styles.tripCard}>
            <View style={styles.tripRow}>
              <Text style={styles.tripLabel}>Route</Text>
              <Text style={styles.tripValue}>{getCityEmoji(traveler.from)} {traveler.from} → {getCityEmoji(traveler.to)} {traveler.to}</Text>
            </View>
            <View style={styles.tripRow}>
              <Text style={styles.tripLabel}>Departure</Text>
              <Text style={styles.tripValue}>{traveler.departure} · {new Date(traveler.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            </View>
            <View style={styles.tripRow}>
              <Text style={styles.tripLabel}>Capacity</Text>
              <Text style={styles.tripValue}>{traveler.weight}</Text>
            </View>
            <View style={styles.tripRow}>
              <Text style={styles.tripLabel}>Price</Text>
              <Text style={[styles.tripValue, { color: '#0F7A4B', fontWeight: '800' }]}>{traveler.pricePerKg} per kg</Text>
            </View>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {[
            { name: 'Amadou B.', rating: 5, comment: 'Very reliable, package arrived in perfect condition. Highly recommend!', date: 'Apr 2024' },
            { name: 'Sophie M.', rating: 5, comment: 'Fast response, professional and trustworthy. Will use again.', date: 'Mar 2024' },
            { name: 'Ibrahima D.', rating: 4, comment: 'Good experience overall. Slight delay but communicated well.', date: 'Feb 2024' },
          ].map((review, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{review.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewName}>{review.name}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <Text style={styles.reviewStars}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={() => {
            if (!context?.userToken) {
              navigation.navigate('LoginPrompt', { screen: 'SenderDashboard' });
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.requestBtnText}>
            {context?.userToken ? 'Send Request' : 'Login to Request'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  header: { paddingTop: 16, marginBottom: 20 },
  back: { fontSize: 14, color: '#0F7A4B', fontWeight: '600' },

  profileCard: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  star: { fontSize: 16, color: '#FFA500' },
  rating: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  trips: { fontSize: 14, color: '#888' },
  verifiedBadge: { backgroundColor: '#E6F4ED', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  verifiedText: { fontSize: 13, fontWeight: '700', color: '#0F7A4B' },

  statsRow: { flexDirection: 'row', backgroundColor: '#f8f9f7', borderRadius: 14, paddingVertical: 16, marginBottom: 24, borderWidth: 1, borderColor: '#ebebeb' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: '#e0e0e0' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  tripCard: { backgroundColor: '#fafafa', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#ebebeb' },
  tripRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tripLabel: { fontSize: 13, color: '#999', fontWeight: '500' },
  tripValue: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },

  requestBtn: { backgroundColor: '#0F7A4B', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  requestBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  reviewCard: { backgroundColor: '#fafafa', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#ebebeb' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0F7A4B', justifyContent: 'center', alignItems: 'center' },
  reviewAvatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  reviewName: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  reviewDate: { fontSize: 11, color: '#999', marginTop: 1 },
  reviewStars: { fontSize: 12, color: '#FFA500' },
  reviewComment: { fontSize: 13, color: '#555', lineHeight: 20 },
});


