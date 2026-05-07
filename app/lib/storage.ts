import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const inMemoryStorage: Record<string, string> = {};

const webStorage = {
  getItem: async (key: string) => localStorage.getItem(key),
  setItem: async (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: async (key: string) => localStorage.removeItem(key),
};

const nativeStorage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn('AsyncStorage unavailable, using in-memory fallback:', e);
      return inMemoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('AsyncStorage unavailable, using in-memory fallback:', e);
      inMemoryStorage[key] = value;
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('AsyncStorage unavailable, using in-memory fallback:', e);
      delete inMemoryStorage[key];
    }
  },
};

export const storage = Platform.OS === 'web' ? webStorage : nativeStorage;


