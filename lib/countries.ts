const countriesData = require('./countries.json') as Record<string, string[]>;
const abbreviationsData = require('./abbreviations.json') as { country: string; abbreviation: string }[];

export interface Country {
  name: string;
  flag: string;
  cities: string[];
}

// Convert a 2-letter ISO country code to a flag emoji programmatically
const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  try {
    return [...countryCode.toUpperCase()]
      .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
      .join('');
  } catch (e) {
    return '🌐';
  }
};

// Create a lookup map for quick country-to-code resolution
const abbrevMap = new Map<string, string>();
abbreviationsData.forEach((item) => {
  if (item && item.country && item.abbreviation) {
    abbrevMap.set(item.country.toLowerCase(), item.abbreviation);
  }
});

// Map of custom flags for countries that might have mismatching names in datasets
const customFlags: Record<string, string> = {
  'colombia': '🇨🇴',
  'mexico': '🇲🇽',
  'spain': '🇪🇸',
  'espana': '🇪🇸',
  'united states': '🇺🇸',
  'usa': '🇺🇸',
  'argentina': '🇦🇷',
  'chile': '🇨🇱',
  'peru': '🇵🇪',
  'ecuador': '🇪🇨',
  'venezuela': '🇻🇪',
  'uruguay': '🇺🇾',
  'costa rica': '🇨🇷',
  'panama': '🇵🇦',
};

// Generate list of all countries sorted alphabetically
export const COUNTRIES: Country[] = Object.entries(countriesData)
  .map(([name, cities]) => {
    const lowerName = name.toLowerCase();
    
    // Resolve flag (try custom, then ISO lookup, fallback to globe)
    let flag = '🌐';
    if (customFlags[lowerName]) {
      flag = customFlags[lowerName];
    } else {
      const code = abbrevMap.get(lowerName);
      if (code) {
        flag = getFlagEmoji(code);
      }
    }

    // Clean up city list (sort alphabetically and filter out empty items)
    const cleanedCities = Array.isArray(cities)
      ? [...new Set(cities)]
          .filter((city) => typeof city === 'string' && city.trim().length > 0)
          .sort((a, b) => a.localeCompare(b))
      : [];

    return {
      name,
      flag,
      cities: cleanedCities,
    };
  })
  .filter((c) => c.cities.length > 0) // Only include countries that have cities
  .sort((a, b) => a.name.localeCompare(b.name));
