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
    [24, new Country({
      id: 24,
      name: 'USA',
      nativeName: 'USA',
      encodedName: 'USA',
      lang: 'en',
      tz: 'America/New_York',
      lawChannel: '-1002039275108',
      battlesChannel: '-1002035525983',
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
  ])
}

module.exports = {
  Country,
  getLang: config.getLang,
  getEncodedName: config.getEncodedName,
  getName: config.getName,
  getTZ: config.getTZ,
  map: config.map,
  config
};
