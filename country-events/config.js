class Country {
  constructor({
                id,
                name,
                nativeName,
                encodedName,
                lang,
                tz,
                lawChannel,
                battlesChannel,
                lawLastUpdated,
                battlesLastUpdated
              }) {
    this.id = id;
    this.name = name;
    this.nativeName = nativeName;
    this.encodedName = encodedName;
    this.lang = lang;
    this.tz = tz;
    this.lawChannel = lawChannel;
    this.battlesChannel = battlesChannel;
    this.lawLastUpdated = lawLastUpdated;
    this.battlesLastUpdated = battlesLastUpdated;
  }

  getLawsLastUpdated() {
    return this.lawLastUpdated;
  }

  setLawsLastUpdated(date) {
    this.lawLastUpdated = date;
  }

  getBattlesLastUpdated() {
    return this.battlesLastUpdated;
  }

  setBattlesLastUpdated(date) {
    this.battlesLastUpdated = date;
  }
}

const config = {

  getEncodedName: function (countryId) {
    return this.map.get(countryId).encodedName;
  },

  getName: function (countryId) {
    return this.map.get(countryId).name;
  },

  getNativeName: function (countryId) {
    return this.map.get(countryId).nativeName;
  },

  getLang: function (countryId) {
    return this.map.get(countryId).lang;
  },

  getTZ: function (countryId) {
    return this.map.get(countryId).tz;
  },

  getRssFeed: function (countryId, page = 1) {
    return `https://www.erepublik.com/${this.getLang(countryId)}/main/news/military/all/all/${page}/rss`;
  },

  getLawChannel: function (countryId) {
    return this.map.get(countryId).lawChannel;
  },

  getBattlesChannel: function (countryId) {
    return this.map.get(countryId).battlesChannel;
  },

  getLawLastUpdated: function (countryId) {
    return this.map.get(countryId).lawLastUpdated;
  },

  setLawLastUpdated: function (countryId, date) {
    this.map.get(countryId).lawLastUpdated = date;
  },

  getBattlesLastUpdated: function (countryId) {
    return this.map.get(countryId).battlesLastUpdated;
  },

  setBattlesLastUpdated: function (countryId, date) {
    this.map.get(countryId).battlesLastUpdated = date;
  },

  map: new Map([
    [1, new Country({
      id: 1,
      name: 'Romania',
      nativeName: 'Romania',
      encodedName: 'Romania',
      lang: 'en',
      tz: 'Europe/Bucharest',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [9, new Country({
      id: 9,
      name: 'Brazil',
      nativeName: 'Brasil',
      encodedName: 'Brasil',
      lang: 'en',
      tz: 'America/Sao_Paulo',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [10, new Country({
      id: 10,
      name: 'Italy',
      nativeName: 'Italia',
      encodedName: 'Italy',
      lang: 'en',
      tz: 'Europe/Rome',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [11, new Country({
      id: 11,
      name: 'France',
      nativeName: 'France',
      encodedName: 'France',
      lang: 'en',
      tz: 'Europe/Paris',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [12, new Country({
      id: 12,
      name: 'Germany',
      nativeName: 'Deutschland',
      encodedName: 'Germany',
      lang: 'en',
      tz: 'Europe/Berlin',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [15, new Country({
      id: 15,
      name: 'Spain',
      nativeName: 'España',
      encodedName: 'Spain',
      lang: 'en',
      tz: 'Europe/Madrid',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(),
      battlesLastUpdated: new Date(),
    })],
    [19, new Country({
      id: 19,
      name: 'Indonesia',
      nativeName: 'Indonesia',
      encodedName: 'Indonesia',
      lang: 'en',
      tz: 'Asia/Jakarta',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [24, new Country({
      id: 24,
      name: 'USA',
      nativeName: 'USA',
      encodedName: 'USA',
      lang: 'en',
      tz: 'America/New_York',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [29, new Country({
      id: 29,
      name: 'United Kingdom',
      nativeName: 'United Kingdom',
      encodedName: 'United-Kingdom',
      lang: 'en',
      tz: 'Europe/London',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [31, new Country({
      id: 31,
      name: 'Netherlands',
      nativeName: 'Nederland',
      encodedName: 'Netherlands',
      lang: 'en',
      tz: 'Europe/Amsterdam',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [32, new Country({
      id: 32,
      name: 'Belgium',
      nativeName: 'Belgium',
      encodedName: 'Belgium',
      lang: 'en',
      tz: 'Europe/Brussels',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [35, new Country({
      id: 35,
      name: 'Poland',
      nativeName: 'Polska',
      encodedName: 'Poland',
      lang: 'en',
      tz: 'Europe/Warsaw',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [39, new Country({
      id: 39,
      name: 'Finland',
      nativeName: 'Suomi',
      encodedName: 'Finland',
      lang: 'en',
      tz: 'Europe/Helsinki',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [38, new Country({
      id: 38,
      name: 'Sweden',
      nativeName: 'Sverige',
      encodedName: 'Sweden',
      lang: 'en',
      tz: 'Europe/Stockholm',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [65, new Country({
      id: 65,
      name: 'Serbia',
      nativeName: 'Србија',
      encodedName: 'Serbia',
      lang: 'en',
      tz: 'Europe/Belgrade',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [40, new Country({
      id: 40,
      name: 'Ukraine',
      nativeName: 'Україна',
      encodedName: 'Ukraine',
      lang: 'en',
      tz: 'Europe/Kyiv',
      lawChannel: '-1001964119268',
      battlesChannel: '-1001800161871',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [41, new Country({
      id: 41,
      name: 'Russia',
      nativeName: 'Россия',
      encodedName: 'Russia',
      lang: 'en',
      tz: 'Europe/Moscow',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [42, new Country({
      id: 42,
      name: 'Bulgaria',
      nativeName: 'Bulgaria',
      encodedName: 'Bulgaria',
      lang: 'en',
      tz: 'Europe/Kyiv',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [51, new Country({
      id: 51,
      name: 'South Africa',
      nativeName: 'South Africa',
      encodedName: 'South-Africa',
      lang: 'en',
      tz: 'Africa/Johannesburg',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [52, new Country({
      id: 52,
      name: 'Republic of Moldova',
      nativeName: 'Republica Moldova',
      encodedName: 'Republic-of-Moldova',
      lang: 'en',
      tz: 'Europe/Chisinau',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [53, new Country({
      id: 53,
      name: 'Portugal',
      nativeName: 'Portugal',
      encodedName: 'Portugal',
      lang: 'en',
      tz: 'Europe/Lisbon',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [55, new Country({
      id: 55,
      name: 'Denmark',
      nativeName: 'Denmark',
      encodedName: 'Denmark',
      lang: 'en',
      tz: 'Europe/Copenhagen',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [57, new Country({
      id: 57,
      name: 'Pakistan',
      nativeName: 'Pakistan',
      encodedName: 'Pakistan',
      lang: 'en',
      tz: 'Asia/Karachi',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [63, new Country({
      id: 63,
      name: 'Croatia',
      nativeName: 'Croatia',
      encodedName: 'Croatia',
      lang: 'en',
      tz: 'Europe/Zagreb',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [70, new Country({
      id: 70,
      name: 'Estonia',
      nativeName: 'Eesti',
      encodedName: 'Estonia',
      lang: 'en',
      tz: 'Europe/Tallinn',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [71, new Country({
      id: 71,
      name: 'Latvia',
      nativeName: 'Latvija',
      encodedName: 'Latvia',
      lang: 'en',
      tz: 'Europe/Riga',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [72, new Country({
      id: 72,
      name: 'Lithuania',
      nativeName: 'Lithuania',
      encodedName: 'Lithuania',
      lang: 'en',
      tz: 'Europe/Vilnius',
      lawChannel: '-1001934672647',
      battlesChannel: '-1001784853805',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })],
    [79, new Country({
      id: 79,
      name: 'North Macedonia',
      nativeName: 'Северна Македонија',
      encodedName: 'North-Macedonia',
      lang: 'en',
      tz: 'Europe/Skopje',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: new Date(0),
      battlesLastUpdated: new Date(0),
    })]
  ])
}

module.exports = config;
