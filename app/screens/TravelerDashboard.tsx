import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

const HomeIcon = ({ color = '#999' }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L21 10V21H3V10L12 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 21V12H15V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SenderIcon = ({ color = '#999' }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M5 2H19C20.1046 2 21 2.89543 21 4V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V4C3 2.89543 3.89543 2 5 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 8H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TravelerDashboard = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted'>('pending');

  // Mock incoming requests
  const [requests, setRequests] = useState([
    {
      id: 1,
      senderName: 'John Doe',
      senderInitial: 'J',
      senderRating: 4.8,
      route: 'New York → Dakar',
      weight: 5,
      description: 'Clothes and shoes',
      status: 'pending',
      date: '2024-04-28',
    },
    {
      id: 2,
      senderName: 'Sarah Smith',
      senderInitial: 'S',
      senderRating: 5.0,
      route: 'New York → Dakar',
      weight: 3,
      description: 'Electronics and documents',
      status: 'pending',
      date: '2024-04-29',
    },
    {
      id: 3,
      senderName: 'Michael Brown',
      senderInitial: 'M',
      senderRating: 4.5,
      route: 'New York → Dakar',
      weight: 8,
      description: 'Food items and medicine',
      status: 'accepted',
      date: '2024-04-28',
    },
  ]);

  const filteredRequests = requests.filter((r) => r.status === activeTab);

  const handleAccept = (requestId: number) => {
    setRequests(
      requests.map((r) =>
        r.id === requestId ? { ...r, status: 'accepted' } : r
      )
    );
  };

  const handleReject = (requestId: number) => {
    setRequests(requests.filter((r) => r.id !== requestId));
  };

  const getInitialColor = (initial: string) => {
    const colors: { [key: string]: string } = {
      J: '#ff6b6b',
      S: '#4c6ef5',
      M: '#3B82F6',
      A: '#e94b8d',
    };
    return colors[initial] || '#3B82F6';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Incoming Packages</Text>
        <Text style={styles.subtitle}>Browse & earn</Text>
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{requests.filter((r) => r.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Waiting</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{requests.filter((r) => r.status === 'accepted').length}</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'pending' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('pending')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'pending' && styles.tabTextActive,
            ]}
          >
            Pending ({requests.filter((r) => r.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'accepted' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'accepted' && styles.tabTextActive,
            ]}
          >
            Accepted ({requests.filter((r) => r.status === 'accepted').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            {/* Sender Info with Rating */}
            <View style={styles.senderHeader}>
              <View
                style={[
                  styles.senderAvatar,
                  { backgroundColor: getInitialColor(item.senderInitial) },
                ]}
              >
                <Text style={styles.senderAvatarText}>
                  {item.senderInitial}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.senderName}>{item.senderName}</Text>
                <Text style={styles.senderRating}>
                  ★ {item.senderRating.toFixed(1)} • {item.date}
                </Text>
              </View>
            </View>

            {/* Package Details */}
            <View style={styles.packageInfo}>
              <View style={styles.routeHeader}>
                <Text style={styles.routeHeaderText}>{item.route}</Text>
              </View>

              <View style={styles.packageRow}>
                <View style={styles.earnBox}>
                  <Text style={styles.earnLabel}>Earn</Text>
                  <Text style={styles.earnAmount}>${(item.weight * 1.5).toFixed(2)}</Text>
                </View>
                <View style={styles.weightBox}>
                  <Text style={styles.weightLabel}>Weight</Text>
                  <Text style={styles.weight}>{item.weight} kg</Text>
                </View>
              </View>

              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>Package</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>

            {/* Actions - Only for pending */}
            {item.status === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleReject(item.id)}
                >
                  <Text style={styles.rejectBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAccept(item.id)}
                >
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Status - For accepted */}
            {item.status === 'accepted' && (
              <View style={styles.acceptedStatus}>
                <Text style={styles.acceptedStatusText}>✓ Request accepted</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Messages', {
                      otherUserName: item.senderName,
                      otherUserInitial: item.senderInitial,
                      conversationId: item.id,
                    })
                  }
                >
                  <Text style={styles.messageLink}>Message sender →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('SenderDashboard')}
        >
          <SenderIcon color="#666" />
          <Text style={styles.navLabel}>Sender</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, { opacity: 0.5 }]}>
          <HomeIcon color="#3B82F6" />
          <Text style={[styles.navLabel, { color: '#3B82F6' }]}>Traveler</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    marginBottom: 16,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3B82F6',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  senderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  senderAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  senderRating: {
    fontSize: 12,
    color: '#999',
  },
  packageInfo: {
    marginBottom: 12,
  },
  routeHeader: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  routeHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  packageRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  earnBox: {
    flex: 1,
    backgroundColor: '#f0f9f6',
    borderRadius: 8,
    padding: 10,
  },
  earnLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  earnAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3B82F6',
  },
  weightBox: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  weightLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  weight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  descriptionBox: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 10,
  },
  descriptionLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  acceptedStatus: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  acceptedStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 8,
  },
  messageLink: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    marginTop: 4,
  },
});

export default TravelerDashboard;
