import * as Location from 'expo-location';
import { allCities } from './routes';

// Approximate coordinates for each supported city
const cityCoords: { [city: string]: { lat: number; lon: number } } = {
  'New York':      { lat: 40.7128,  lon: -74.0060  },
  'Montreal':      { lat: 45.5017,  lon: -73.5673  },
  'Washington DC': { lat: 38.9072,  lon: -77.0369  },
  'Atlanta':       { lat: 33.7490,  lon: -84.3880  },
  'Houston':       { lat: 29.7604,  lon: -95.3698  },
  'Paris':         { lat: 48.8566,  lon:   2.3522  },
  'London':        { lat: 51.5074,  lon:  -0.1278  },
  'Brussels':      { lat: 50.8503,  lon:   4.3517  },
  'Lisbon':        { lat: 38.7169,  lon:  -9.1395  },
  'Madrid':        { lat: 40.4168,  lon:  -3.7038  },
  'Dubai':         { lat: 25.2048,  lon:  55.2708  },
  'Dakar':         { lat: 14.6928,  lon: -17.4467  },
  'Abidjan':       { lat:  5.3600,  lon:  -4.0083  },
  'Lagos':         { lat:  6.5244,  lon:   3.3792  },
  'Accra':         { lat:  5.6037,  lon:  -0.1870  },
  'Bamako':        { lat: 12.6392,  lon:  -8.0029  },
};

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestCity(lat: number, lon: number): string {
  let best = allCities[0];
  let bestDist = Infinity;
  for (const city of allCities) {
    const c = cityCoords[city];
    if (!c) continue;
    const d = distanceKm(lat, lon, c.lat, c.lon);
    if (d < bestDist) { bestDist = d; best = city; }
  }
  return best;
}

export async function detectNearestCity(): Promise<string | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return nearestCity(pos.coords.latitude, pos.coords.longitude);
  } catch {
    return null;
  }
}
