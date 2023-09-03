const config = {
  map: new Map([
    [19, {
      name: 'Indonesia',
      nativeName: 'Indonesia',
      encodedName: 'Indonesia',
      lang: 'en',
      tz: 'Asia/Jakarta',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: null,
      battlesLastUpdated: null,
    }],
    [40, {
      name: 'Ukraine',
      nativeName: 'Україна',
      encodedName: 'Ukraine',
      lang: 'en',
      tz: 'Europe/Kyiv',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: null,
      battlesLastUpdated: null,
    }],
    [57, {
      name: 'Pakistan',
      nativeName: 'Pakistan',
      encodedName: 'Pakistan',
      lang: 'en',
      tz: 'Asia/Karachi',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: null,
      battlesLastUpdated: null,
    }],
    [72, {
      name: 'Lithuania',
      nativeName: 'Lithuania',
      encodedName: 'Lithuania',
      lang: 'en',
      tz: 'Europe/Vilnius',
      lawChannel: '-1001807856149',
      battlesChannel: '-1001807856149',
      lawLastUpdated: null,
      battlesLastUpdated: null,
    }]
  ]),

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
  }
}

module.exports = config;
