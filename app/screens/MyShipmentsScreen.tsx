import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import { storage } from '../lib/storage';
import Svg, { Path } from 'react-native-svg';

const supabase = createClient(
  'https://aglexdhpgbididmzdnvh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnbGV4ZGhwZ2JpZGlkbXpkbnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzU0NDAsImV4cCI6MjA5MjU1MTQ0MH0.4p4PVwGHdRSdWGxwsd_2hF7kGYfXSTSsuQRrFj_SpSE'
);

const MyShipmentsScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'delivered'>('all');
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      const userId = await storage.getItem('userId');
      if (!userId) {
        setShipments([]);
        return;
      }

      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shipments:', error);
        setShipments([]);
      } else {
        setShipments(data || []);
      }
    } catch (err) {
      console.error('Exception:', err);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = shipments.filter((s) => {
    if (activeTab === 'active') return s.status === 'in-transit' || s.status === 'pending';
    if (activeTab === 'delivered') return s.status === 'delivered';
    return true;
  });

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

  const StatusIndicator = ({ status }: { status: string }) => (
    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]} />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#0F7A4B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Shipments</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['all', 'active', 'delivered'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Shipments List */}
      <FlatList
        data={filteredShipments}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Svg width={72} height={72} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 20 }}>
              <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M3.27 6.96L12 12.01l8.73-5.05" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M12 22.08V12" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.emptyTitle}>No shipments yet</Text>
            <Text style={styles.emptySubtitle}>Post a request and a traveler will carry your package</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => navigation.navigate('PostRequest')}>
              <Text style={styles.emptyAddBtnText}>Post a Request</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.shipmentCard}
            onPress={() => navigation.navigate('ShipmentDetails', { shipment: item })}
          >
            {/* Top Row: Route + Status */}
            <View style={styles.cardTop}>
              <View style={styles.routeSection}>
                <Text style={styles.route}>{item.from_city}</Text>
                <Text style={styles.arrow}> → </Text>
                <Text style={styles.route}>{item.to_city}</Text>
              </View>
              <View style={styles.statusBadge}>
                <StatusIndicator status={item.status} />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            {/* Middle: Details Grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>{item.weight} kg</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cost</Text>
                <Text style={styles.detailValue}>{item.cost}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Sent</Text>
                <Text style={styles.detailValue}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              </View>
            </View>

            {/* Traveler Info */}
            {item.traveler ? (
              <View style={styles.travelerRow}>
                <View style={[styles.avatar, { backgroundColor: ({ M: '#0F7A4B', A: '#e94b8d', I: '#ff6b6b', K: '#8b5cf6' } as any)[item.initial] || '#0F7A4B' }]}>
                  <Text style={styles.avatarText}>{item.initial}</Text>
                </View>
                <View>
                  <Text style={styles.travelerName}>{item.traveler}</Text>
                  <Text style={styles.travelerRole}>Traveler</Text>
                </View>
              </View>
            ) : (
              <View style={styles.waitingRow}>
                <Text style={styles.waitingText}>Waiting for traveler...</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  backButton: { fontSize: 14, color: '#0F7A4B', fontWeight: '600', marginBottom: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
  addBtn: { backgroundColor: '#0F7A4B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  emptyAddBtn: { backgroundColor: '#0F7A4B', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  emptyAddBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    gap: 20,
  },
  tab: { paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#0F7A4B' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  tabTextActive: { color: '#0F7A4B' },
  listContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 20 },

  /* Card */
  shipmentCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },

  /* Card Top */
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  routeSection: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  route: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  arrow: { fontSize: 14, color: '#999' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8f9f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },

  /* Details Grid */
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', borderRadius: 10, paddingVertical: 12, marginBottom: 14 },
  detailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: 10, color: '#999', fontWeight: '500', marginBottom: 3 },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  detailDivider: { width: 1, height: 20, backgroundColor: '#e5e5e5' },

  /* Traveler */
  travelerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#E6F4ED', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  travelerName: { fontSize: 13, fontWeight: '600', color: '#0F7A4B' },
  travelerRole: { fontSize: 11, color: '#0F7A4B', fontWeight: '500' },
  waitingRow: { backgroundColor: '#fff8e1', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10 },
  waitingText: { fontSize: 12, fontWeight: '600', color: '#b8860b' },
});

export default MyShipmentsScreen;


