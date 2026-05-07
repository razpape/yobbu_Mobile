import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { createClient } from '@supabase/supabase-js';
import { storage } from '../lib/storage';

const supabase = createClient(
  'https://aglexdhpgbididmzdnvh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnbGV4ZGhwZ2JpZGlkbXpkbnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzU0NDAsImV4cCI6MjA5MjU1MTQ0MH0.4p4PVwGHdRSdWGxwsd_2hF7kGYfXSTSsuQRrFj_SpSE'
);
import { routeConfig, allCities, getCityEmoji } from '../lib/routes';
import { detectNearestCity } from '../lib/location';
import { Image } from 'react-native';
import Svg, { Circle, Path, Line, Rect, G } from 'react-native-svg';
import { NavigationContext } from './Navigation';
import TravelSearchCard from '../components/TravelSearchCard';

const SenderDashboard = () => {
  const navigation = useNavigation<any>();
  const context = useContext(NavigationContext);
  const [fullName, setFullName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [inTransitCount] = useState(2);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState('New York');
  const [selectedCity, setSelectedCity] = useState('Dakar');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedGP, setSelectedGP] = useState<typeof allGPs[0] | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customItem, setCustomItem] = useState('');
  const [requestPhotos, setRequestPhotos] = useState<string[]>([]);
  const [lastRequest, setLastRequest] = useState<typeof allGPs[0] | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [showOriginPicker, setShowOriginPicker] = useState(false);
  const [showDestPicker, setShowDestPicker] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  const requireAuth = (action: () => void) => {
    if (context?.userToken) {
      action();
    } else {
      navigation.navigate('LoginPrompt');
    }
  };

  const handleMessagesPress = () => requireAuth(() => navigation.navigate('MessagesList'));
  const handleShipmentsPress = () => requireAuth(() => navigation.navigate('MyShipments'));

  const handlePostRequestPress = () => requireAuth(() => navigation.navigate('PostRequest'));

  const origins = allCities;
  const currentDestinations = routeConfig[selectedOrigin] || [];
  const dateFilters = ['today', 'tomorrow', 'this-week', 'this-month'] as const;
  type DateFilter = typeof dateFilters[number];
  const dateFilterLabel: Record<DateFilter, string> = {
    'today': 'Today',
    'tomorrow': 'Tomorrow',
    'this-week': 'This Week',
    'this-month': 'This Month',
  };
  // Build date strings relative to today so mock data always appears current
  const d0 = new Date(); d0.setHours(0,0,0,0);
  const fmtDate = (offset: number) => {
    const d = new Date(d0); d.setDate(d0.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const TODAY = fmtDate(0), TOMORROW = fmtDate(1), DAY2 = fmtDate(2),
        DAY3 = fmtDate(3), DAY4 = fmtDate(4), DAY7 = fmtDate(7), DAY10 = fmtDate(10);

  const gpDateToFilter = (date: string): DateFilter => {
    if (date === TODAY) return 'today';
    if (date === TOMORROW) return 'tomorrow';
    if ([DAY2, DAY3, DAY4].includes(date)) return 'this-week';
    return 'this-month';
  };

  // Parse "08:30 AM" on a given YYYY-MM-DD date string into a Date
  const parseDepartureDatetime = (date: string, time: string): Date => {
    const [year, month, day] = date.split('-').map(Number);
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return new Date(0);
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return new Date(year, month - 1, day, hours, minutes);
  };

  const allGPs = [
    { id: 1,  name: 'Mamadou Sall',    initial: 'M', rating: 5.0, trips: 62, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: TODAY,    departure: '11:30 AM', city: 'Dakar',    pricePerKg: '$1.50', weight: '20kg', responds: '< 2 hours', success: 99,  badge: 'FASTEST'  as const },
    { id: 3,  name: 'Ismail Diop',     initial: 'I', rating: 4.9, trips: 58, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: TODAY,    departure: '02:15 PM', city: 'Dakar',    pricePerKg: '$1.50', weight: '25kg', responds: '< 1 hour',  success: 98,  badge: 'RELIABLE' as const },
    { id: 6,  name: 'Ndeye Ndiaye',    initial: 'N', rating: 4.6, trips: 32, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: TODAY,    departure: '06:00 PM', city: 'Dakar',    pricePerKg: '$1.50', weight: '22kg', responds: '< 4 hours', success: 97,  badge: 'RELIABLE' as const },
    { id: 8,  name: 'Aïssatou Ly',     initial: 'A', rating: 4.8, trips: 49, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: DAY3,     departure: '06:45 AM', city: 'Dakar',    pricePerKg: '$1.50', weight: '19kg', responds: '< 3 hours', success: 96,  badge: null },
    { id: 10, name: 'Rama Sene',        initial: 'R', rating: 5.0, trips: 68, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: DAY2,     departure: '09:00 AM', city: 'Dakar',    pricePerKg: '$1.50', weight: '21kg', responds: '< 2 hours', success: 100, badge: 'FASTEST'  as const },
    { id: 14, name: 'Cheikh Mbaye',    initial: 'C', rating: 4.7, trips: 41, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: TOMORROW, departure: '03:45 PM', city: 'Dakar',    pricePerKg: '$1.50', weight: '23kg', responds: '< 3 hours', success: 97,  badge: null },
    { id: 15, name: 'Ousmane Fall',    initial: 'O', rating: 4.8, trips: 36, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: TOMORROW, departure: '05:00 PM', city: 'Dakar',    pricePerKg: '$1.50', weight: '20kg', responds: '< 2 hours', success: 98,  badge: null },
    { id: 16, name: 'Aminata Diallo',  initial: 'A', rating: 5.0, trips: 72, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: TOMORROW, departure: '09:30 AM', city: 'Dakar',    pricePerKg: '$1.50', weight: '18kg', responds: '< 1 hour',  success: 100, badge: 'FASTEST'  as const },
    { id: 17, name: 'Ibrahima Ndiaye', initial: 'I', rating: 4.6, trips: 28, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: DAY2,     departure: '11:15 AM', city: 'Dakar',    pricePerKg: '$1.50', weight: '25kg', responds: '< 4 hours', success: 95,  badge: null },
    { id: 18, name: 'Khady Sarr',      initial: 'K', rating: 4.9, trips: 53, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: TOMORROW, departure: '07:00 PM', city: 'Dakar',    pricePerKg: '$1.50', weight: '22kg', responds: '< 2 hours', success: 99,  badge: 'RELIABLE' as const },
    { id: 19, name: 'Babacar Diop',    initial: 'B', rating: 4.7, trips: 44, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: DAY3,     departure: '01:30 PM', city: 'Dakar',    pricePerKg: '$1.50', weight: '21kg', responds: '< 3 hours', success: 96,  badge: null },
    { id: 20, name: 'Mariama Balde',   initial: 'M', rating: 4.8, trips: 39, route: 'New York → Dakar', from: 'New York', to: 'Dakar',    date: DAY7,     departure: '08:00 PM', city: 'Dakar',    pricePerKg: '$1.50', weight: '20kg', responds: '< 2 hours', success: 97,  badge: null },
    { id: 11, name: 'Fatou Ndiaye',    initial: 'F', rating: 5.0, trips: 55, route: 'Dakar → New York', from: 'Dakar',    to: 'New York', date: TODAY,    departure: '10:30 AM', city: 'New York', pricePerKg: '$1.50', weight: '18kg', responds: '< 1 hour',  success: 99,  badge: 'FASTEST'  as const },
    { id: 12, name: 'Moussa Diallo',   initial: 'M', rating: 4.9, trips: 48, route: 'Dakar → New York', from: 'Dakar',    to: 'New York', date: TOMORROW, departure: '03:00 PM', city: 'New York', pricePerKg: '$1.50', weight: '20kg', responds: '< 3 hours', success: 97,  badge: 'RELIABLE' as const },
    { id: 13, name: 'Aissatou Sarr',   initial: 'A', rating: 4.8, trips: 52, route: 'Dakar → New York', from: 'Dakar',    to: 'New York', date: DAY2,     departure: '07:20 AM', city: 'New York', pricePerKg: '$1.50', weight: '16kg', responds: '< 4 hours', success: 96,  badge: null },
    { id: 21, name: 'Pierre Dubois',   initial: 'P', rating: 5.0, trips: 71, route: 'Paris → London', from: 'Paris',     to: 'London',     date: TODAY,    departure: '08:00 AM', city: 'London',    pricePerKg: '$1.80', weight: '19kg', responds: '< 1 hour',  success: 100, badge: 'FASTEST'  as const },
    { id: 22, name: 'Emma Williams',   initial: 'E', rating: 4.9, trips: 43, route: 'London → Brussels', from: 'London',   to: 'Brussels',   date: TOMORROW, departure: '09:00 AM', city: 'Brussels', pricePerKg: '$1.70', weight: '21kg', responds: '< 2 hours', success: 98,  badge: 'RELIABLE' as const },
    { id: 23, name: 'Sofia Garcia',    initial: 'S', rating: 4.7, trips: 35, route: 'Madrid → Lisbon', from: 'Madrid',   to: 'Lisbon',     date: DAY2,     departure: '10:00 AM', city: 'Lisbon',   pricePerKg: '$1.60', weight: '20kg', responds: '< 3 hours', success: 97,  badge: null },
    { id: 24, name: 'James Smith',     initial: 'J', rating: 4.8, trips: 59, route: 'Atlanta → Dakar', from: 'Atlanta',  to: 'Dakar',      date: DAY3,     departure: '02:00 PM', city: 'Dakar',    pricePerKg: '$2.00', weight: '23kg', responds: '< 2 hours', success: 99,  badge: 'RELIABLE' as const },
    { id: 25, name: 'Carlos Rodriguez', initial: 'C', rating: 4.6, trips: 31, route: 'Houston → Paris', from: 'Houston',  to: 'Paris',      date: DAY4,     departure: '04:00 PM', city: 'Paris',   pricePerKg: '$2.10', weight: '24kg', responds: '< 4 hours', success: 96,  badge: null },
    { id: 26, name: 'Adeline Ndiaye',  initial: 'A', rating: 5.0, trips: 64, route: 'Abidjan → Montreal', from: 'Abidjan', to: 'Montreal',   date: TOMORROW, departure: '11:00 AM', city: 'Montreal', pricePerKg: '$2.20', weight: '22kg', responds: '< 1 hour',  success: 100, badge: 'FASTEST'  as const },
    { id: 27, name: 'Kwame Mensah',    initial: 'K', rating: 4.7, trips: 46, route: 'Lagos → Washington DC', from: 'Lagos',  to: 'Washington DC', date: TODAY,    departure: '07:30 AM', city: 'Washington DC', pricePerKg: '$2.00', weight: '21kg', responds: '< 3 hours', success: 97,  badge: null },
    { id: 28, name: 'Claire Laurent',  initial: 'C', rating: 4.9, trips: 51, route: 'Brussels → Dubai', from: 'Brussels', to: 'Dubai',      date: DAY2,     departure: '12:30 PM', city: 'Dubai',   pricePerKg: '$2.50', weight: '25kg', responds: '< 2 hours', success: 98,  badge: 'RELIABLE' as const },
    { id: 29, name: 'Youssef El Sayed', initial: 'Y', rating: 4.8, trips: 57, route: 'Dubai → London', from: 'Dubai',   to: 'London',     date: DAY3,     departure: '05:00 PM', city: 'London',  pricePerKg: '$2.40', weight: '23kg', responds: '< 2 hours', success: 99,  badge: 'RELIABLE' as const },
    { id: 30, name: 'Lucia Rossi',     initial: 'L', rating: 4.6, trips: 29, route: 'Lisbon → Paris', from: 'Lisbon',  to: 'Paris',      date: TOMORROW, departure: '06:00 PM', city: 'Paris',   pricePerKg: '$1.75', weight: '20kg', responds: '< 3 hours', success: 96,  badge: null },
  ];

  const filteredGPs = allGPs.filter(gp => {
    const routeMatch = gp.from === selectedOrigin && (!selectedCity || gp.to === selectedCity);
    const dateMatch = !selectedDate || gpDateToFilter(gp.date) === selectedDate;
    const departureTime = parseDepartureDatetime(gp.date, gp.departure);
    const notDeparted = departureTime > new Date();
    const verifiedMatch = !verifiedOnly || gp.success >= 97;
    const ratingMatch = gp.rating >= minRating;
    return routeMatch && dateMatch && notDeparted && verifiedMatch && ratingMatch;
  });

  const upcomingDates = (() => {
    const list: { value: string; label: string; monthHeader?: string }[] = [];
    const today = new Date();
    const monthShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    let lastMonth = -1;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const month = d.getMonth();
      const year = d.getFullYear();
      const value = `${year}-${String(month+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${monthShort[month]} ${d.getDate()}`;
      const monthHeader = month !== lastMonth ? `${monthFull[month]} ${year}` : undefined;
      lastMonth = month;
      list.push({ value, label, monthHeader });
    }
    return list;
  })();

  const getCityCode = (city: string) => {
    const codes: { [key: string]: string } = {
      'New York': 'NY', 'Dakar': 'DKR', 'Montreal': 'MTL', 'Paris': 'CDG',
      'London': 'LHR', 'Brussels': 'BRU', 'Lisbon': 'LIS', 'Madrid': 'MAD',
      'Dubai': 'DXB', 'Abidjan': 'ABJ', 'Lagos': 'LOS', 'Accra': 'ACC',
      'Bamako': 'BKO', 'Washington DC': 'DCA', 'Atlanta': 'ATL', 'Houston': 'HOU',
    };
    return codes[city] || city.slice(0, 3).toUpperCase();
  };

  const getInitialColor = (initial: string) => {
    const colors: { [key: string]: string } = {
      M: '#0F7A4B', A: '#e94b8d', I: '#ff6b6b', J: '#ff6b6b', S: '#4c6ef5',
      F: '#f59e0b', O: '#8b5cf6', N: '#06b6d4', Y: '#ec4899', R: '#f97316',
      C: '#1a3d28', K: '#0ea87a', B: '#0F7A4B', L: '#0e7490', P: '#7c3aed',
    };
    return colors[initial] || '#0F7A4B';
  };

  useEffect(() => {
    const loadUserData = async () => {
      const name = await storage.getItem('fullName');
      const photo = await storage.getItem('photoUri');
      if (name) setFullName(name);
      if (photo) setPhotoUri(photo);
    };
    loadUserData();
  }, [context?.userToken]);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // 1. Saved home + dest city from sign-up (highest priority)
        const homeCity = await storage.getItem('homeCity');
        const destCity = await storage.getItem('destCity');
        if (homeCity && allCities.includes(homeCity)) {
          setSelectedOrigin(homeCity);
          if (destCity && allCities.includes(destCity)) {
            setSelectedCity(destCity);
          } else {
            const destinations = routeConfig[homeCity] || [];
            setSelectedCity(destinations[0] || 'Dakar');
          }
          setLocationLoading(false);
          return;
        }
        // 2. GPS
        const gpsCity = await detectNearestCity();
        if (gpsCity) {
          setSelectedOrigin(gpsCity);
          const destinations = routeConfig[gpsCity] || [];
          setSelectedCity(destinations[0] || 'Dakar');
          setLocationLoading(false);
          return;
        }
        // 3. IP-based fallback
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const ipCity = allCities.find(c =>
          c.toLowerCase().includes((data.city || '').toLowerCase()) ||
          (data.country_code === 'SN' && c === 'Dakar') ||
          (data.country_code === 'CI' && c === 'Abidjan') ||
          (data.country_code === 'NG' && c === 'Lagos') ||
          (data.country_code === 'GH' && c === 'Accra') ||
          (data.country_code === 'ML' && c === 'Bamako') ||
          (data.country_code === 'FR' && c === 'Paris') ||
          (data.country_code === 'GB' && c === 'London') ||
          (data.country_code === 'BE' && c === 'Brussels') ||
          (data.country_code === 'PT' && c === 'Lisbon') ||
          (data.country_code === 'ES' && c === 'Madrid') ||
          (data.country_code === 'AE' && c === 'Dubai') ||
          (data.country_code === 'CA' && c === 'Montreal') ||
          (data.country_code === 'US' && c === 'New York')
        ) || 'New York';
        setSelectedOrigin(ipCity);
        const destinations = routeConfig[ipCity] || [];
        setSelectedCity(destinations[0] || 'Dakar');
      } catch {
        setSelectedOrigin('New York');
        setSelectedCity('Dakar');
      } finally {
        setLocationLoading(false);
      }
    };
    detectLocation();
  }, []);

  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'JD';
  const firstName = fullName ? fullName.split(' ')[0] : '';

  const filteredOrigins = allCities.filter(c => c.toLowerCase().includes(originSearch.toLowerCase()));
  const filteredDests = (routeConfig[selectedOrigin] || []).filter(c => c.toLowerCase().includes(destSearch.toLowerCase()));

  const cityCountry: Record<string, string> = {
    'New York': 'USA', 'Washington DC': 'USA', 'Atlanta': 'USA', 'Houston': 'USA',
    'Montreal': 'Canada', 'Paris': 'France', 'London': 'UK', 'Brussels': 'Belgium',
    'Lisbon': 'Portugal', 'Madrid': 'Spain', 'Dubai': 'UAE',
    'Dakar': 'Senegal', 'Abidjan': "Côte d'Ivoire", 'Lagos': 'Nigeria',
    'Accra': 'Ghana', 'Bamako': 'Mali',
  };
  const getCityCountry = (city: string) => cityCountry[city] || '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.topSafeArea} />
      {/* Travel Search Card */}
      <TravelSearchCard
        fromCity={selectedOrigin}
        toCity={selectedCity}
        greeting={firstName ? `Good morning, ${firstName}` : ''}
        onFromPress={() => setShowOriginPicker(true)}
        onToPress={() => setShowDestPicker(true)}
        onSwap={() => {
          const destinations = routeConfig[selectedCity] || [];
          if (destinations.includes(selectedOrigin)) {
            const prev = selectedOrigin;
            setSelectedOrigin(selectedCity);
            setSelectedCity(prev);
          }
        }}
      />

      {/* Content Area */}
      <SafeAreaView style={styles.safeAreaContainer}>
        {/* Choose Origin Modal */}
      <Modal visible={showOriginPicker} animationType="slide" onRequestClose={() => setShowOriginPicker(false)}>
        <SafeAreaView style={styles.pickerScreen}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowOriginPicker(false)}>
              <Text style={styles.pickerBack}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>Choose Origin</Text>
            <View style={{ width: 60 }} />
          </View>
          <View style={styles.pickerSearchBar}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
              <Path d="M21 21l-4.35-4.35" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
            </Svg>
            <TextInput
              style={styles.pickerSearchInput}
              placeholder="Search"
              placeholderTextColor="#636366"
              value={originSearch}
              onChangeText={setOriginSearch}
            />
          </View>
          <ScrollView>
            <Text style={styles.pickerSectionLabel}>All Cities</Text>
            {filteredOrigins.map(city => (
              <TouchableOpacity
                key={city}
                style={styles.pickerRow}
                onPress={() => {
                  setSelectedOrigin(city);
                  setSelectedCity('');
                  setOriginSearch('');
                  setShowOriginPicker(false);
                }}
              >
                <Text style={styles.pickerFlag}>{getCityEmoji(city)}</Text>
                <Text style={styles.pickerRowText}>{city}</Text>
                {city === selectedOrigin && <Text style={styles.pickerCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Choose Destination Modal */}
      <Modal visible={showDestPicker} animationType="slide" onRequestClose={() => setShowDestPicker(false)}>
        <SafeAreaView style={styles.pickerScreen}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowDestPicker(false)}>
              <Text style={styles.pickerBack}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>Choose Destination</Text>
            <View style={{ width: 60 }} />
          </View>
          <View style={styles.pickerSearchBar}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
              <Path d="M21 21l-4.35-4.35" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
            </Svg>
            <TextInput
              style={styles.pickerSearchInput}
              placeholder="Search"
              placeholderTextColor="#636366"
              value={destSearch}
              onChangeText={setDestSearch}
            />
          </View>
          <ScrollView>
            <Text style={styles.pickerSectionLabel}>Available Destinations</Text>
            {filteredDests.map(city => (
              <TouchableOpacity
                key={city}
                style={styles.pickerRow}
                onPress={() => {
                  setSelectedCity(city);
                  setDestSearch('');
                  setShowDestPicker(false);
                }}
              >
                <Text style={styles.pickerFlag}>{getCityEmoji(city)}</Text>
                <Text style={styles.pickerRowText}>{city}</Text>
                {city === selectedCity && <Text style={styles.pickerCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Route Selection Modal */}
      <Modal visible={showRouteModal} transparent animationType="slide" onRequestClose={() => setShowRouteModal(false)}>
        <View style={styles.routeModalOverlay}>
          <View style={styles.routeModalSheet}>
            {/* Handle */}
            <View style={styles.routeModalHandle} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={styles.routeModalHeader}>
              <Text style={styles.routeModalTitle}>Where are{'\n'}you sending?</Text>
              <TouchableOpacity style={styles.routeModalCloseBtn} onPress={() => setShowRouteModal(false)}>
                <Text style={styles.routeModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* FROM */}
            <View style={styles.routeSection}>
              <Text style={styles.routeFieldLabel}>FROM</Text>
              <View style={styles.dropdownListContainer}>
                {origins.map(origin => (
                  <TouchableOpacity
                    key={origin}
                    style={[styles.dropdownListItem, selectedOrigin === origin && styles.dropdownListItemSelected]}
                    onPress={() => { setSelectedOrigin(origin); setSelectedCity(''); }}
                  >
                    <Text style={[styles.dropdownListItemText, selectedOrigin === origin && styles.dropdownListItemTextSelected]}>
                      {getCityEmoji(origin)} {origin}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* TO */}
            <View style={styles.routeSection}>
              <Text style={styles.routeFieldLabel}>TO</Text>
              {selectedOrigin && (
                <View style={styles.dropdownListContainer}>
                  {currentDestinations.map(city => (
                    <TouchableOpacity
                      key={city}
                      style={[styles.dropdownListItem, selectedCity === city && styles.dropdownListItemSelected]}
                      onPress={() => setSelectedCity(city)}
                    >
                      <Text style={[styles.dropdownListItemText, selectedCity === city && styles.dropdownListItemTextSelected]}>
                        {getCityEmoji(city)} {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Date Picker */}
            <View style={styles.datepickerSection}>
              <Text style={styles.routeFieldLabel}>DATE</Text>

              {/* Month navigator */}
              <View style={styles.datepickerMonthRow}>
                <TouchableOpacity onPress={() => setCalendarMonth(p => {
                  const d = new Date(p.year, p.month - 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })}>
                  <Text style={styles.datepickerNavText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.datepickerMonthLabel}>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'][calendarMonth.month]} {calendarMonth.year}
                </Text>
                <TouchableOpacity onPress={() => setCalendarMonth(p => {
                  const d = new Date(p.year, p.month + 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })}>
                  <Text style={styles.datepickerNavText}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Horizontal day strip */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datepickerStrip}>
                {(() => {
                  const days = [];
                  const daysInMonth = new Date(calendarMonth.year, calendarMonth.month + 1, 0).getDate();
                  const today = new Date(); today.setHours(0,0,0,0);
                  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                  for (let d = 1; d <= daysInMonth; d++) {
                    const date = new Date(calendarMonth.year, calendarMonth.month, d);
                    const value = `${calendarMonth.year}-${String(calendarMonth.month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    const past = date < today;
                    const selected = selectedDate === value;
                    const isToday = date.getTime() === today.getTime();
                    days.push(
                      <TouchableOpacity
                        key={d}
                        disabled={past}
                        onPress={() => setSelectedDate(value)}
                        style={[styles.dayCard, selected && styles.dayCardSelected, past && styles.dayCardPast]}
                      >
                        <Text style={[styles.dayCardName, selected && styles.dayCardTextSelected, past && styles.dayCardPastText]}>
                          {dayNames[date.getDay()]}
                        </Text>
                        <Text style={[styles.dayCardNum, selected && styles.dayCardTextSelected, past && styles.dayCardPastText]}>
                          {d}
                        </Text>
                        {isToday && !selected && <View style={styles.dayCardDot} />}
                      </TouchableOpacity>
                    );
                  }
                  return days;
                })()}
              </ScrollView>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.routeConfirmBtn, !selectedCity && styles.routeConfirmBtnDisabled]}
              onPress={() => { if (selectedCity) setShowRouteModal(false); }}
              disabled={!selectedCity}
            >
              <Text style={styles.routeConfirmText}>Find Travelers</Text>
              <Text style={styles.routeConfirmArrow}>→</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Photo picker for request */}
      {/* Request Modal */}
      <Modal visible={showRequestModal} transparent animationType="slide" onRequestClose={() => setShowRequestModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.requestModalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowRequestModal(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.requestTitle}>Send a Request</Text>

              {selectedGP && (
                <>
                  <View style={styles.requestGPCard}>
                    <View style={[styles.requestAvatar, { backgroundColor: getInitialColor(selectedGP.initial) }]}>
                      <Text style={styles.requestAvatarText}>{selectedGP.initial}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.requestGPName}>{selectedGP.name}</Text>
                      <Text style={styles.requestGPRating}>★★★★★ {selectedGP.rating.toFixed(1)} · {selectedGP.trips} trips</Text>
                    </View>
                  </View>

                  {selectedGP.success < 97 && (
                    <View style={styles.unverifiedWarning}>
                      <View style={styles.unverifiedWarningIndicator} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.unverifiedWarningTitle}>Not Yet Verified</Text>
                        <Text style={styles.unverifiedWarningText}>This traveler hasn't completed verification. Proceed with caution.</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.requestInfo}>
                    <Text style={styles.requestInfoLabel}>Route</Text>
                    <Text style={styles.requestInfoValue}>{selectedGP.route}</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Weight (kg)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 5"
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#ccc"
                    />
                  </View>

                  {/* Item Categories */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>What are you sending? <Text style={styles.labelOptional}>(select multiple)</Text></Text>
                    <View style={styles.itemGrid}>
                      {['Clothes', 'Electronics', 'Food Items', 'Documents', 'Other'].map(item => (
                        <TouchableOpacity
                          key={item}
                          style={[styles.itemBtn, selectedItems.includes(item) && styles.itemBtnSelected]}
                          onPress={() => {
                            setSelectedItems(prev =>
                              prev.includes(item)
                                ? prev.filter(i => i !== item)
                                : [...prev, item]
                            );
                            if (item !== 'Other') setCustomItem('');
                          }}
                        >
                          <Text style={[styles.itemBtnText, selectedItems.includes(item) && styles.itemBtnTextSelected]}>
                            {selectedItems.includes(item) ? '✓ ' : ''}{item}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {selectedItems.includes('Other') && (
                      <TextInput
                        style={[styles.input, { marginTop: 12 }]}
                        placeholder="Enter item type..."
                        value={customItem}
                        onChangeText={setCustomItem}
                        placeholderTextColor="#ccc"
                      />
                    )}
                  </View>

                  {/* Photos */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Package Photos <Text style={styles.labelOptional}>(optional)</Text></Text>
                    <View style={styles.photoGrid}>
                      {requestPhotos.map((uri, i) => (
                        <View key={i} style={styles.photoThumbWrapper}>
                          <Image source={{ uri }} style={styles.photoThumb} />
                          <TouchableOpacity
                            style={styles.photoRemove}
                            onPress={() => setRequestPhotos(prev => prev.filter((_, idx) => idx !== i))}
                          >
                            <Text style={styles.photoRemoveText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {requestPhotos.length < 4 && (
                        <TouchableOpacity
                          style={styles.photoAddBtn}
                          onPress={async () => {
                            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                            if (status === 'granted') {
                              const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                quality: 0.8,
                              });
                              if (!result.canceled) {
                                setRequestPhotos(prev => [...prev, result.assets[0].uri]);
                              }
                            }
                          }}
                        >
                          <Text style={styles.photoAddIcon}>+</Text>
                          <Text style={styles.photoAddText}>Add Photo</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {weight ? (
                    <View style={styles.priceSection}>
                      <Text style={styles.priceSectionLabel}>Estimated cost</Text>
                      <Text style={styles.priceSectionValue}>${(parseFloat(weight) * 1.5).toFixed(2)}</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.sendRequestBtn, (!weight || selectedItems.length === 0) && styles.sendRequestBtnDisabled]}
                    onPress={async () => {
                      if (weight && selectedItems.length > 0 && selectedGP) {
                        const userId = await storage.getItem('userId');
                        if (!userId) return;

                        const itemsText = selectedItems.includes('Other')
                          ? [customItem, ...selectedItems.filter(i => i !== 'Other')].filter(Boolean).join(', ')
                          : selectedItems.join(', ');

                        const messageContent = `📦 New Request from Sender\n\nRoute: ${selectedGP.route}\nWeight: ${weight}kg\nItems: ${itemsText}\nEstimated Cost: $${(parseFloat(weight) * 1.5).toFixed(2)}`;

                        // Auto-send message to traveler with images
                        await supabase.from('messages').insert([
                          {
                            user_id: userId,
                            sender: selectedGP.name,
                            content: messageContent,
                            images: requestPhotos.length > 0 ? requestPhotos : null,
                          },
                        ]);

                        setLastRequest(selectedGP);
                        setShowRequestModal(false);
                        setWeight('');
                        setSelectedItems([]);
                        setCustomItem('');
                        setRequestPhotos([]);
                      }
                    }}
                    disabled={!weight || selectedItems.length === 0}
                  >
                    <Text style={styles.sendRequestBtnText}>Send Request</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setShowRequestModal(false);
                      setWeight('');
                      setSelectedItems([]);
                      setCustomItem('');
                      setRequestPhotos([]);
                    }}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.filterTitle}>Filter Travelers</Text>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Verified Only</Text>
              <TouchableOpacity
                style={[styles.filterToggle, verifiedOnly && styles.filterToggleActive]}
                onPress={() => setVerifiedOnly(!verifiedOnly)}
              >
                <Text style={[styles.filterToggleText, verifiedOnly && styles.filterToggleTextActive]}>
                  {verifiedOnly ? '✓' : '○'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.ratingButtons}>
                {[0, 4, 4.5, 5].map(rating => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.ratingBtn, minRating === rating && styles.ratingBtnActive]}
                    onPress={() => setMinRating(rating)}
                  >
                    <Text style={[styles.ratingBtnText, minRating === rating && styles.ratingBtnTextActive]}>
                      {rating === 0 ? 'All' : `${rating}★`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.filterResetBtn}
              onPress={() => { setVerifiedOnly(false); setMinRating(0); }}
            >
              <Text style={styles.filterResetText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Date Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelectorScroll} contentContainerStyle={styles.dateSelectorContent}>
          {dateFilters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.datePill, selectedDate === filter && styles.datePillSelected]}
              onPress={() => setSelectedDate(filter)}
            >
              <Text style={[styles.datePillText, selectedDate === filter && styles.datePillTextSelected]}>
                {dateFilterLabel[filter]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Acceptance Card */}
        {lastRequest && (
          <View style={styles.acceptanceCard}>
            <View style={styles.acceptanceDot} />
            <Text style={styles.acceptanceText}>
              {lastRequest.name} accepted your request
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Messages', {
                  otherUserName: lastRequest.name,
                  otherUserInitial: lastRequest.initial,
                  conversationId: lastRequest.id,
                });
                setLastRequest(null);
              }}
            >
              <Text style={styles.acceptanceLink}>Chat →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Travelers List */}
        {selectedCity && selectedDate ? (
          <>
            {filteredGPs.length > 0 ? (
              <>
                {/* Available bar */}
                <View style={styles.availableBar}>
                  <Text style={styles.availableCount}>{filteredGPs.length} travelers · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                  <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path d="M22 3H2l8 9.46V19l4 2V12.46L22 3z" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </TouchableOpacity>
                </View>

                <FlatList
                data={filteredGPs}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[styles.travelerCard, index === 0 && styles.travelerCardFeatured]}
                    onPress={() => navigation.navigate('TravelerProfile', { traveler: item })}
                    activeOpacity={0.85}
                  >
                    {/* Featured banner */}
                    {index === 0 && (
                      <View style={styles.featuredBanner}>
                        <View style={styles.featuredDot} />
                        <Text style={styles.featuredBannerText}>Fastest departure</Text>
                      </View>
                    )}

                    {/* Top row: avatar + name + verified */}
                    <View style={styles.cardTopRow}>
                      <View style={[styles.avatar, { backgroundColor: getInitialColor(item.initial) }]}>
                        <Text style={styles.avatarText}>
                          {item.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.travelerName}>{item.name}</Text>
                        <View style={styles.ratingRow}>
                          <Text style={styles.stars}>{'★'.repeat(Math.round(item.rating))}</Text>
                          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                          <Text style={styles.ratingTrips}>· {item.trips} trips</Text>
                        </View>
                      </View>
                      <View style={item.success >= 97 ? styles.verifiedBadge : styles.unverifiedBadge}>
                        <Text style={item.success >= 97 ? styles.verifiedBadgeText : styles.unverifiedBadgeText}>
                          {item.success >= 97 ? '✓ Verified' : '⚠ Unverified'}
                        </Text>
                      </View>
                    </View>

                    {/* 3-column info */}
                    <View style={styles.cardInfoRow}>
                      <View style={styles.cardInfoItem}>
                        <Text style={styles.cardInfoLabel}>DEPARTS</Text>
                        <Text style={styles.cardInfoValue}>{item.departure}</Text>
                        <Text style={styles.cardInfoSub}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                      </View>
                      <View style={styles.cardInfoItem}>
                        <Text style={styles.cardInfoLabel}>PRICE</Text>
                        <Text style={[styles.cardInfoValue, { color: GREEN_MED }]}>{item.pricePerKg}</Text>
                        <Text style={styles.cardInfoSub}>per kg</Text>
                      </View>
                      <View style={styles.cardInfoItem}>
                        <Text style={styles.cardInfoLabel}>ROUTE</Text>
                        <View style={styles.routeCodeRow}>
                          <Text style={styles.routeCodeText}>{getCityCode(item.from)}</Text>
                          <Text style={styles.routeCodeArrow}>→</Text>
                          <Text style={styles.routeCodeText}>{getCityCode(item.to)}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Request button */}
                    <TouchableOpacity
                      style={[styles.requestBtn, index === 0 && styles.requestBtnFeatured]}
                      onPress={() => {
                        setSelectedGP(item);
                        setShowRequestModal(true);
                      }}
                    >
                      <Text style={[styles.requestBtnText, index === 0 && styles.requestBtnTextFeatured]}>
                        {index === 0 ? 'Request traveler' : 'Request'}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />
              </>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No travelers found</Text>
                <Text style={styles.emptySubtext}>Try another date or destination</Text>
              </View>
            )}
          </>
        ) : !lastRequest && (
          <View style={styles.promptCard}>
            <Text style={styles.promptText}>Select a destination and date above to find travelers</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </View>
  );
};

const GREEN = '#0F7A4B';
const GREEN_MED = '#0ea87a';
const GREEN_LIGHT = '#E6F4ED';
const AMBER = '#F59E0B';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F7A4B' },
  topSafeArea: { backgroundColor: '#0F7A4B' },
  heroSafeArea: { backgroundColor: '#0F7A4B' },
  safeAreaContainer: { flex: 1, backgroundColor: '#f6faf7' },

  /* Hero Header */
  hero: {
    backgroundColor: GREEN,
    paddingTop: 12,
    paddingBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 22,
  },
  greeting: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginBottom: 5, letterSpacing: 0.5 },
  headerTitle: { fontSize: 29, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  menuDots: { fontSize: 22, color: 'rgba(255,255,255,0.8)', letterSpacing: 2, marginTop: 6 },
  heroGreeting: {},
  heroTitle: {},
  bellBtn: {},
  bellDot: {},

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  /* ── Route Card ── */
  routeCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  routeRowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 48,
  },
  routeRowLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.4)',
    width: 38,
  },
  routeRowFlag: {
    fontSize: 24,
  },
  routeRowCity: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  routeRowCityPlaceholder: {
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '500',
  },
  swapBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeRowFlag: { fontSize: 18 },
  routeCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2, flexWrap: 'wrap' },
  routeCodeFlag: { fontSize: 13 },
  routeCodeText: { fontSize: 12, fontWeight: '700', color: '#1a1a1a' },
  routeCodeArrow: { fontSize: 11, color: '#999', marginHorizontal: 2 },
  routeRows: {},
  routeRowCard: {},
  routeRowContent: {},
  addBtn: {},
  addBtnText: {},
  routeDotFrom: {},
  routeDotTo: {},
  routeField: {},
  routeFieldRow: {},
  routeFieldFlag: {},
  routeFieldLabel: {},
  routeFieldCity: {},
  routeFieldCityPlaceholder: {},
  routeConnector: {},
  routeConnectorLine: {},
  routeCardDivider: {},
  findTravelersBtn: {},
  findTravelersBtnDisabled: {},
  findTravelersBtnText: {},

  /* Scroll */
  scrollContent: { paddingBottom: 20, paddingTop: 12 },

  /* Date Selector */
  dateSelectorScroll: { marginBottom: 8, paddingTop: 14 },
  dateSelectorContent: { paddingHorizontal: 16, gap: 8 },
  datePill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ebebeb',
  },
  datePillSelected: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  datePillText: { fontSize: 13, fontWeight: '600', color: '#666' },
  datePillTextSelected: { color: '#fff' },

  /* Acceptance */
  acceptanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: GREEN_LIGHT,
  },
  acceptanceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN_MED },
  acceptanceText: { flex: 1, fontSize: 13, fontWeight: '600', color: GREEN },
  acceptanceLink: { fontSize: 13, fontWeight: '700', color: GREEN },

  /* Insight Row */
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  insightDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: GREEN_MED },
  insightText: { flex: 1, fontSize: 12, fontWeight: '600', color: GREEN },
  insightRight: { fontSize: 12, fontWeight: '600', color: GREEN },

  /* Section Row */
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8 },
  sectionLink: { fontSize: 12, fontWeight: '600', color: GREEN },

  /* In Transit Card */
  inTransitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  inTransitIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0f9f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inTransitCount: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  inTransitLabel: { fontSize: 12, color: '#999', marginTop: 1 },
  inTransitDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN_MED },

  /* Available bar */
  availableBar: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availableLabel: { fontSize: 11, color: '#999', fontWeight: '500', marginBottom: 2 },
  availableCount: { fontSize: 13, fontWeight: '600', color: '#666' },
  availablePrice: { fontSize: 15, fontWeight: '700', color: GREEN_MED },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnText: { fontSize: 16, color: '#1a1a1a' },

  /* City Picker Screen */
  pickerScreen: { flex: 1, backgroundColor: '#fff' },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  pickerBack: { fontSize: 14, color: GREEN, fontWeight: '600', width: 60 },
  pickerTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  pickerSearchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', margin: 16, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  pickerSearchInput: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  pickerSectionLabel: { fontSize: 11, fontWeight: '700', color: '#999', paddingHorizontal: 16, paddingVertical: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 1, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', gap: 12 },
  pickerFlag: { fontSize: 24 },
  pickerRowText: { flex: 1, fontSize: 15, color: '#1a1a1a', fontWeight: '600' },
  pickerCheck: { fontSize: 16, color: GREEN, fontWeight: '700' },

  /* Traveler Card */
  travelerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ebebeb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  travelerCardFeatured: { borderColor: GREEN, borderWidth: 1.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featuredBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10,
    alignSelf: 'flex-start', backgroundColor: '#FFF8E7', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  featuredBannerText: { fontSize: 11, fontWeight: '700', color: '#B45309' },
  featuredDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: AMBER },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardMiddle: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardInfoRow: { flexDirection: 'row', gap: 8, marginBottom: 12, marginTop: 4 },
  cardInfoItem: { flex: 1 },
  cardInfoLabel: { fontSize: 10, color: '#999', fontWeight: '600', marginBottom: 4, letterSpacing: 0.5 },
  cardInfoValue: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  cardInfoSub: { fontSize: 11, color: '#999', marginTop: 2 },
  routeDisplay: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  routeFlag: { fontSize: 18 },
  routeCity: { fontSize: 12, fontWeight: '600', color: '#1a1a1a' },
  routeArrow: { fontSize: 12, color: '#999', marginHorizontal: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  travelerInfo: { flex: 1 },
  travelerName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  cardRoute: { fontSize: 12, color: GREEN, fontWeight: '600', marginTop: 2 },
  verifiedRow: { flexDirection: 'row', marginTop: 6 },
  verifiedBadge: { backgroundColor: GREEN_LIGHT, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#b7e4c7' },
  verifiedBadgeText: { fontSize: 11, fontWeight: '600', color: GREEN },
  unverifiedBadge: { backgroundColor: '#fff8e6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  unverifiedBadgeText: { fontSize: 11, fontWeight: '600', color: '#b45309' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  stars: { fontSize: 13, color: '#FFA500' },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  ratingTrips: { fontSize: 12, color: '#888' },
  verifiedBadgeDup: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verifiedBadgeTextDup: { fontSize: 10, fontWeight: '700', color: GREEN },

  /* Badge */
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeFastest: { backgroundColor: '#FFF3CD' },
  badgeReliable: { backgroundColor: '#E0F4FF' },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  badgeTextFastest: { color: '#B8860B' },
  badgeTextReliable: { color: '#0077AA' },

  requestBtn: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#a8d5bc',
  },
  requestBtnFeatured: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  requestBtnText: { fontSize: 14, fontWeight: '700', color: GREEN },
  requestBtnTextFeatured: { color: '#fff', fontWeight: '700' },

  /* Empty / Prompt */
  emptyCard: { alignItems: 'center', padding: 32, marginHorizontal: 16 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  emptySubtext: { fontSize: 13, color: '#999' },
  promptCard: { marginHorizontal: 16, padding: 24, backgroundColor: '#f0f0f0', borderRadius: 12, alignItems: 'center' },
  promptText: { fontSize: 14, color: '#999', textAlign: 'center', fontWeight: '500' },

  /* Bottom Nav */
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 8,
    paddingTop: 8,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navLabel: { fontSize: 11, color: '#0F7A4B', fontWeight: '500' },
  notificationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', position: 'absolute', top: -4, right: -4 },
  navItemCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 32,
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileAvatarImage: { width: 28, height: 28 },
  profileAvatarText: { fontSize: 11, fontWeight: '800', color: '#fff' },

  /* Route Modal */
  routeModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  routeModalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    maxHeight: '92%',
  },
  routeModalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    marginBottom: 24,
  },
  routeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  routeModalTitle: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', lineHeight: 34 },
  routeModalCloseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 4,
  },
  routeModalCloseText: { fontSize: 14, color: '#666', fontWeight: '700' },

  routeRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 28 },
  routeSection: { marginBottom: 24 },
  routeFieldLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 1.2, marginBottom: 12 },
  dropdownListContainer: { borderWidth: 1.5, borderColor: '#ebebeb', borderRadius: 12, backgroundColor: '#fafafa', overflow: 'hidden' },
  dropdownListItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownListItemSelected: { backgroundColor: '#f0f9f6' },
  dropdownListItemText: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  dropdownListItemTextSelected: { fontWeight: '700', color: GREEN },
  routeOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: '#ebebeb',
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14,
    backgroundColor: '#fafafa',
  },
  routeOptionSelected: { backgroundColor: GREEN, borderColor: GREEN },
  routeOptionFlag: { fontSize: 20 },
  routeOptionText: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  routeOptionTextSelected: { color: '#fff' },
  routeOptionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  routeOptionRowSelected: { backgroundColor: '#f0f9f6' },

  routeDateSection: { marginBottom: 32 },
  routeDatesRow: { flexDirection: 'row', gap: 8, paddingRight: 24 },
  routeDateChip: {
    borderWidth: 1.5, borderColor: '#ebebeb',
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18,
    backgroundColor: '#fafafa',
  },
  routeDateChipSelected: { backgroundColor: GREEN, borderColor: GREEN },
  routeDateChipText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  routeDateChipTextSelected: { color: '#fff' },

  /* Date Picker */
  datepickerSection: { marginBottom: 24 },
  datepickerMonthRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 10, marginBottom: 12,
  },
  datepickerNavText: { fontSize: 26, color: '#1a1a1a', fontWeight: '300', paddingHorizontal: 4 },
  datepickerMonthLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  datepickerStrip: { paddingHorizontal: 2, gap: 8 },
  dayCard: {
    width: 52, alignItems: 'center',
    paddingVertical: 10, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#ebebeb',
    backgroundColor: '#fafafa',
  },
  dayCardSelected: { backgroundColor: GREEN, borderColor: GREEN },
  dayCardPast: { opacity: 0.3 },
  dayCardName: { fontSize: 10, fontWeight: '600', color: '#999', marginBottom: 4 },
  dayCardNum: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  dayCardTextSelected: { color: '#fff' },
  dayCardPastText: { color: '#94A3B8' },
  dayCardDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN_MED, marginTop: 4 },

  routeConfirmBtn: {
    backgroundColor: GREEN,
    borderRadius: 16, paddingVertical: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  routeConfirmBtnDisabled: { backgroundColor: '#7fb89a', opacity: 0.7 },
  routeConfirmText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  routeConfirmArrow: { fontSize: 18, color: '#fff', fontWeight: '700' },

  /* Request Modal */
  requestModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '95%',
  },
  requestTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 16, textAlign: 'center' },
  requestGPCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9f7', borderRadius: 12, padding: 14, marginBottom: 16, gap: 12 },
  requestAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  requestAvatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  requestGPName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  requestGPRating: { fontSize: 12, color: '#FFA500', fontWeight: '600' },
  unverifiedWarning: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF8E7', borderRadius: 12, padding: 14, marginBottom: 16, gap: 12, borderWidth: 1.5, borderColor: '#FFE4B5' },
  unverifiedWarningIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#B45309', marginTop: 6, flexShrink: 0 },
  unverifiedWarningTitle: { fontSize: 13, fontWeight: '700', color: '#B45309', marginBottom: 2 },
  unverifiedWarningText: { fontSize: 12, color: '#92400E', fontWeight: '500', lineHeight: 16 },
  requestInfo: { backgroundColor: '#f8f9f7', borderRadius: 10, padding: 12, marginBottom: 16 },
  requestInfoLabel: { fontSize: 11, color: '#999', marginBottom: 3 },
  requestInfoValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1a1a1a', backgroundColor: '#fafafa' },
  textArea: { textAlignVertical: 'top', paddingVertical: 12, height: 80 },
  priceSection: { backgroundColor: '#f0f9f6', borderRadius: 10, padding: 14, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceSectionLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
  priceSectionValue: { fontSize: 18, fontWeight: '800', color: GREEN },
  sendRequestBtn: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  sendRequestBtnDisabled: { backgroundColor: '#ccc', opacity: 0.6 },
  sendRequestBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  cancelBtn: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 24 },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },

  /* Filter Modal */
  filterModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '60%' },
  filterTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 24, textAlign: 'center' },
  filterSection: { marginBottom: 24 },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  filterToggle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#f0f0f0' },
  filterToggleActive: { backgroundColor: GREEN, borderColor: GREEN },
  filterToggleText: { fontSize: 20, color: '#999', fontWeight: '600' },
  filterToggleTextActive: { color: '#fff' },
  ratingButtons: { flexDirection: 'row', gap: 10 },
  ratingBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f0f0f0', alignItems: 'center' },
  ratingBtnActive: { backgroundColor: GREEN },
  ratingBtnText: { fontSize: 12, fontWeight: '700', color: '#666' },
  ratingBtnTextActive: { color: '#fff' },
  filterResetBtn: { backgroundColor: '#f0f0f0', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  filterResetText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 24, top: 24, zIndex: 10 },
  modalCloseText: { fontSize: 16, color: '#1a1a1a', fontWeight: '700' },

  /* Item Grid Styles */
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  itemBtn: { flex: 1, minWidth: '45%', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#f5f5f5', alignItems: 'center' },
  itemBtnSelected: { backgroundColor: '#0F7A4B', borderColor: '#0F7A4B' },
  itemBtnText: { fontSize: 13, fontWeight: '600', color: '#666' },
  itemBtnTextSelected: { color: '#fff' },

  /* Photo Grid Styles */
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoThumbWrapper: { width: '23%', aspectRatio: 1, position: 'relative', borderRadius: 8, overflow: 'hidden' },
  photoThumb: { width: '100%', height: '100%', borderRadius: 8 },
  photoRemove: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: '#ff4444', justifyContent: 'center', alignItems: 'center' },
  photoRemoveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  photoAddBtn: { width: '23%', aspectRatio: 1, borderRadius: 8, borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' },
  photoAddIcon: { fontSize: 28, color: '#0F7A4B', marginBottom: 4 },
  photoAddText: { fontSize: 11, color: '#666', textAlign: 'center' },

  labelOptional: { fontSize: 12, color: '#999', fontWeight: '400' },
});

export default SenderDashboard;


