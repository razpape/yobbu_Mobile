import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import { storage } from '../lib/storage';

const supabase = createClient(
  'https://aglexdhpgbididmzdnvh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnbGV4ZGhwZ2JpZGlkbXpkbnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzU0NDAsImV4cCI6MjA5MjU1MTQ0MH0.4p4PVwGHdRSdWGxwsd_2hF7kGYfXSTSsuQRrFj_SpSE'
);

const MessagesListScreen = () => {
  const navigation = useNavigation<any>();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const userId = await storage.getItem('userId');
      if (!userId) {
        setConversations([]);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        setConversations([]);
      } else {
        setConversations(data || []);
      }
    } catch (err) {
      console.error('Exception:', err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
      </View>

      {/* Conversations */}
      <FlatList
        data={conversations}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>When you connect with a traveler, your conversation will appear here</Text>
          </View>
        }
        renderItem={({ item }) => {
          const initial = item.sender ? item.sender[0].toUpperCase() : '?';
          const colors = ['#0F7A4B', '#e94b8d', '#ff6b6b', '#4a90e2', '#f5a623'];
          const colorIndex = (item.id?.charCodeAt(0) || 0) % colors.length;
          const formattedTime = new Date(item.created_at).toLocaleDateString();

          return (
            <TouchableOpacity
              style={styles.conversationRow}
              onPress={() =>
                navigation.navigate('Messages', {
                  otherUserName: item.sender || 'Unknown',
                  otherUserInitial: initial,
                  conversationId: item.id,
                })
              }
            >
              {/* Avatar */}
              <View style={[styles.avatar, { backgroundColor: colors[colorIndex] }]}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>

              {/* Content */}
              <View style={styles.conversationContent}>
                <View style={styles.conversationTop}>
                  <Text style={styles.name}>{item.sender || 'Unknown'}</Text>
                  <Text style={styles.time}>{formattedTime}</Text>
                </View>
                <Text
                  style={styles.lastMessage}
                  numberOfLines={1}
                >
                  {item.content}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  back: { fontSize: 14, color: '#0F7A4B', fontWeight: '600', marginBottom: 6 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0F7A4B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  conversationContent: {
    flex: 1,
  },
  conversationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  time: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  route: {
    fontSize: 11,
    color: '#0F7A4B',
    fontWeight: '600',
    marginBottom: 3,
  },
  lastMessage: {
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
  },
  lastMessageUnread: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginLeft: 86,
  },
});

export default MessagesListScreen;


