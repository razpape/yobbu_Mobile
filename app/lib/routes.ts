export const routeConfig: { [key: string]: string[] } = {
  'New York': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Bamako', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'London', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
  'Montreal': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Bamako', 'New York', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'London', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
  'Washington DC': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Bamako', 'New York', 'Montreal', 'Atlanta', 'Houston', 'Paris', 'London', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
  'Atlanta': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Houston', 'Paris', 'London', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
  'Houston': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Paris', 'London', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
  'Paris': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'London', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
  'London': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
  'Brussels': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'London', 'Lisbon', 'Madrid', 'Dubai'],
  'Lisbon': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'London', 'Brussels', 'Madrid', 'Dubai'],
  'Madrid': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'London', 'Brussels', 'Lisbon', 'Dubai'],
  'Dubai': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'London', 'Brussels', 'Lisbon', 'Madrid'],
  'Dakar': ['Abidjan', 'Lagos', 'Accra', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'London', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
  'Abidjan': ['Dakar', 'Lagos', 'Accra', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'London', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
  'Lagos': ['Dakar', 'Abidjan', 'Accra', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'London', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
  'Accra': ['Dakar', 'Abidjan', 'Lagos', 'Bamako', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'London', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
  'Bamako': ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'New York', 'Montreal', 'Washington DC', 'Atlanta', 'Houston', 'Paris', 'London', 'Brussels', 'Lisbon', 'Madrid', 'Dubai'],
};

export const allCities = Object.keys(routeConfig);

export const getCityEmoji = (city: string): string => {
  const emojiMap: { [key: string]: string } = {
    'New York': '🇺🇸',
    'Montreal': '🇨🇦',
    'Washington DC': '🇺🇸',
    'Atlanta': '🇺🇸',
    'Houston': '🇺🇸',
    'Paris': '🇫🇷',
    'London': '🇬🇧',
    'Brussels': '🇧🇪',
    'Lisbon': '🇵🇹',
    'Madrid': '🇪🇸',
    'Dubai': '🇦🇪',
    'Dakar': '🇸🇳',
    'Abidjan': '🇨🇮',
    'Lagos': '🇳🇬',
    'Accra': '🇬🇭',
    'Bamako': '🇲🇱',
  };
  return emojiMap[city] || '📍';
};
