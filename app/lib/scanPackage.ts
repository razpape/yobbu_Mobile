import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface ScanResult {
  itemName: string;
  category: 'Clothes' | 'Electronics' | 'Food Items' | 'Documents' | 'Other';
  weightEstimate: string;
  description: string;
}

const SERVER_URL = 'http://192.168.1.178:3001';

async function toBase64(imageUri: string): Promise<{ base64: string; mediaType: string }> {
  const lowerUri = imageUri.toLowerCase();
  const mediaType = lowerUri.includes('.png') ? 'image/png'
    : lowerUri.includes('.webp') ? 'image/webp'
    : 'image/jpeg';

  if (Platform.OS === 'web' || imageUri.startsWith('blob:') || imageUri.startsWith('http')) {
    const res = await fetch(imageUri);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({ base64, mediaType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { base64, mediaType };
  }
}

export async function scanPackage(imageUri: string): Promise<ScanResult | null> {
  try {
    console.log('[Scan] Converting image...');
    const { base64, mediaType } = await toBase64(imageUri);
    console.log('[Scan] Base64 length:', base64?.length, 'type:', mediaType);

    console.log('[Scan] Calling server...');
    const response = await fetch(`${SERVER_URL}/scan-package`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, mediaType }),
    });

    console.log('[Scan] Server status:', response.status);
    const data = await response.json();
    console.log('[Scan] Result:', JSON.stringify(data));

    if (data.error) {
      console.error('[Scan] Server error:', data.error);
      return null;
    }

    return {
      itemName: data.itemName || 'Unknown item',
      category: data.category || 'Other',
      weightEstimate: String(data.weightEstimate || ''),
      description: data.description || '',
    };
  } catch (err) {
    console.error('[Scan] Error:', err);
    return null;
  }
}
