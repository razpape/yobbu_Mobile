import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import { storage } from '../lib/storage';
import { NavigationContext } from './Navigation';

const supabase = createClient(
  'https://aglexdhpgbididmzdnvh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnbGV4ZGhwZ2JpZGlkbXpkbnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzU0NDAsImV4cCI6MjA5MjU1MTQ0MH0.4p4PVwGHdRSdWGxwsd_2hF7kGYfXSTSsuQRrFj_SpSE'
);

const MessagesScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const context = useContext(NavigationContext);
  const { conversationId, otherUserName, otherUserInitial } = route.params || {};

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadMessages = async () => {
        try {
          const userId = await storage.getItem('userId');
          if (!userId) return;

          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', userId)
            .eq('sender', otherUserName || '')
            .order('created_at', { ascending: true });

          if (!error && data) {
            setMessages(data);
          }
        } catch (err) {
          console.error('Error loading messages:', err);
        }
      };

      loadMessages();
    }, [otherUserName])
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'me',
          text: newMessage,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
      setNewMessage('');
    }
  };

  const getInitialColor = (initial: string) => {
    const colors: { [key: string]: string } = {
      M: '#0F7A4B',
      A: '#e94b8d',
      J: '#ff6b6b',
      S: '#4c6ef5',
    };
    return colors[initial] || '#0F7A4B';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View
            style={[
              styles.headerAvatar,
              { backgroundColor: getInitialColor(otherUserInitial || 'M') },
            ]}
          >
            <Text style={styles.headerAvatarText}>
              {otherUserInitial || 'U'}
            </Text>
          </View>
          <Text style={styles.headerName}>{otherUserName || 'Traveler'}</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 13, color: '#999' }}>No messages yet. Say hello!</Text>
            </View>
          }
          renderItem={({ item }) => {
            // Parse request details from message content
            const lines = item.content.split('\n').filter((l: string) => l.trim());
            const extractValue = (label: string) => {
              const line = lines.find((l: string) => l.includes(label));
              return line ? line.split(': ')[1] : '';
            };

            const route = extractValue('Route');
            const weight = extractValue('Weight');
            const itemsText = extractValue('Items');
            const cost = extractValue('Cost');

            return (
              <TouchableOpacity style={styles.requestCard}>
                {/* Traveler Info */}
                <View style={styles.requestHeader}>
                  <View style={[styles.requestAvatar, { backgroundColor: '#0F7A4B' }]}>
                    <Text style={styles.requestAvatarText}>{item.sender?.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.requestSender}>{item.sender}</Text>
                    <Text style={styles.requestTime}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* Request Details */}
                <View style={styles.requestDetails}>
                  {route && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Route</Text>
                      <Text style={styles.detailValue}>{route}</Text>
                    </View>
                  )}
                  {weight && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Weight</Text>
                      <Text style={styles.detailValue}>{weight}</Text>
                    </View>
                  )}
                  {itemsText && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Items</Text>
                      <Text style={styles.detailValue}>{itemsText}</Text>
                    </View>
                  )}
                  {cost && (
                    <View style={[styles.detailRow, styles.costRow]}>
                      <Text style={styles.detailLabel}>Estimated Cost</Text>
                      <Text style={styles.costValue}>{cost}</Text>
                    </View>
                  )}
                </View>

                {/* Images if available */}
                {item.images && item.images.length > 0 && (
                  <View style={styles.requestImages}>
                    <Text style={styles.imagesLabel}>Package Photos</Text>
                    <View style={styles.photoGrid}>
                      {item.images.map((uri: string, idx: number) => (
                        <Image
                          key={idx}
                          source={{ uri }}
                          style={styles.photoThumbnail}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#ccc"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    fontSize: 14,
    color: '#0F7A4B',
    fontWeight: '600',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  messageContainerMe: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  messageBubbleMe: {
    backgroundColor: '#0F7A4B',
    borderColor: '#0F7A4B',
  },
  messageText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  messageTextMe: {
    color: 'white',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    backgroundColor: '#f8f9f7',
  },
  sendButton: {
    backgroundColor: '#0F7A4B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  messageContainerOther: {
    alignItems: 'flex-start',
  },
  messageImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  messageImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  requestCard: {
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  requestSender: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  requestDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  costRow: {
    borderBottomWidth: 0,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    marginHorizontal: -8,
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  costValue: {
    fontSize: 16,
    color: '#0F7A4B',
    fontWeight: '700',
  },
  requestImages: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  imagesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumbnail: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 8,
  },
});

export default MessagesScreen;


