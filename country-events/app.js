const Parser = require('rss-parser');
let parser = new Parser();
const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const moment = require('moment-timezone');

const COUNTRY_ID = parseInt(process.env.COUNTRY_ID);
const TELEGRAM_TOKEN = process.env.COUNTRY_TELEGRAM_TOKEN;
const TELEGRAM_LAWS_CHANNEL = process.env.COUNTRY_LAWS_TELEGRAM_CHANNEL;
const TELEGRAM_BATTLES_CHANNEL = process.env.COUNTRY_BATTLES_TELEGRAM_CHANNEL;

const CHECK_INTERVAL = 10 * 1000; // Checking every 10 seconds
const LATEST_LAW_FILE = 'latest_law_date.txt';
const LATEST_BATTLE_FILE = 'latest_battle_date.txt';
const bot = new TelegramBot(TELEGRAM_TOKEN);

let latestPubDate = new Date(0); // Initialize with the earliest possible date.

const COUNTRIES = {
  map: new Map([
    [19, {
      name: 'Indonesia',
      nativeName: 'Indonesia',
      encodedName: 'Indonesia',
      lang: 'en',
      tz: 'Asia/Jakarta'
    }],
    [40, {
      name: 'Ukraine',
      nativeName: 'Україна',
      encodedName: 'Ukraine',
      lang: 'en',
      tz: 'Europe/Kyiv'
    }],
    [57, {
      name: 'Pakistan',
      nativeName: 'Pakistan',
      encodedName: 'Pakistan',
      lang: 'en',
      tz: 'Asia/Karachi'
    }],
    [72, {
      name: 'Lithuania',
      nativeName: 'Lithuania',
      encodedName: 'Lithuania',
      lang: 'en',
      tz: 'Europe/Vilnius'
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
  }
}

const BROKEN_LINK_REGEX = new RegExp(`https:\/\/www\.erepublik\.com\<b\>.*\<\/b\>$`);
const LAW_REGEX = new RegExp(`https://www.erepublik.com/(?:${COUNTRIES.getLang(COUNTRY_ID)}|en)/main/law/`);

function checkForUpdates(url) {
  parser.parseURL(url)
    .then(feed => readFeed(feed))
    .catch(error => console.error(`Error fetching the RSS feed (${url}):`, error));
}

function readFeed(feed) {
  let reversedItems = [...feed.items].reverse();

  handleLaws(reversedItems);
  handleBattles(reversedItems);
}

function handleLaws(reversedItems) {
  const items = reversedItems
    .filter(item => lawsOnly(item))
    .filter(item => forCountryOnly(item))
    .map(item => createClearItems(item))

  formatAndSend(items, TELEGRAM_LAWS_CHANNEL, LATEST_LAW_FILE);
}

function handleBattles(reversedItems) {
  const items = reversedItems
    .filter(item => battlesOnly(item))
    .filter(item => forCountryOnly(item))
    .map(item => createClearItems(item))

  formatAndSend(items, TELEGRAM_BATTLES_CHANNEL, LATEST_BATTLE_FILE);
}

function formatAndSend(items, channel, fileName) {
  let messages = [];

  for (let item of items) {
    let itemDate = new Date(item.time);
    if (itemDate > latestPubDate) {
      let message = `${item.time}\n<a href="${item.url}">${item.text}</a>`;
      messages.push(message);
      latestPubDate = itemDate;
      saveLatestDate(fileName, latestPubDate);
    }
  }

  if (messages.length === 0) {
    return;
  }

  let combinedMessage = messages.join("\n\n");
  bot.sendMessage(channel, combinedMessage, {
    parse_mode: 'HTML',
    disable_web_page_preview: true
  })
    .then(() => console.log(combinedMessage))
    .catch(error => {
      console.log(`${channel}, ${combinedMessage}`);
      console.error("Error sending the message:", error);
    });
}

function battlesOnly(item) {
  return hasResistanceStarted(item) || hasSecured(item) || hasAttacked(item);
}

function hasResistanceStarted(item) {
  const regex = new RegExp(`https://www.erepublik.com/(?:${COUNTRIES.getLang(COUNTRY_ID)}|en)/wars/show/`);
  return regex.test(item.link);
}

function hasSecured(item) {
  const regex = new RegExp(`https://www.erepublik.com/(?:${COUNTRIES.getLang(COUNTRY_ID)}|en)/wars/show/`);
  return regex.test(item.link);
}

function hasAttacked(item) {
  const regex = new RegExp(`https://www.erepublik.com/(?:${COUNTRIES.getLang(COUNTRY_ID)}|en)/military/battlefield/`);
  return regex.test(item.link);
}

function lawsOnly(item) {
  return lawLink(item) || brokenLink(item);
}

function lawLink(item) {
  return LAW_REGEX.test(item.link);
}

function brokenLink(item) {
  return BROKEN_LINK_REGEX.test(item.link);
}

function forCountryOnly(item) {
  return item.link.indexOf(COUNTRIES.getEncodedName(COUNTRY_ID)) !== -1
    || item.content.indexOf(COUNTRIES.getName(COUNTRY_ID)) !== -1
    || item.content.indexOf(COUNTRIES.getNativeName(COUNTRY_ID)) !== -1;
}

function createClearItems(item) {
  const tz = COUNTRIES.getTZ(COUNTRY_ID);
  const itemDate = moment(item.pubDate).tz(tz).format("YYYY-MM-DD HH:mm:ss");
  if (BROKEN_LINK_REGEX.test(item.link)) {
    const urlMatch = item.content.match(/<a href="([^"]+)">/);
    const url = urlMatch ? "https://www.erepublik.com" + urlMatch[1] : null;
    const cleanedContent = item.content.replace(/\/\/www\.erepublik\.com<b>/g, "")
      .replace(/<\/b>/g, "")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .trim();
    // console.log(`${cleanedContent}, ${url}`);
    return {text: cleanedContent, url: url, time: itemDate};
  }
  const regex = /<a href="([^"]*)">([^<]*)<\/a>/;
  const match = item.content.match(regex);
  if (match) {
    const url = "https:" + match[1].trim();
    const text = match[2].trim();
    return {text: text, url: url, time: itemDate};
  }
  return {text: item.content, url: item.link, time: itemDate};
}

function loadLatestDate(fileName) {
  if (fs.existsSync(fileName)) {
    const dateFromFile = fs.readFileSync(fileName, 'utf-8');
    latestPubDate = dateFromFile && new Date(dateFromFile);
  }
}

function saveLatestDate(fileName, date) {
  fs.writeFileSync(fileName, date.toISOString());
}

loadLatestDate(LATEST_LAW_FILE);
loadLatestDate(LATEST_BATTLE_FILE);
checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID));
setInterval(() => checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID)), CHECK_INTERVAL);

// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 2));
// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 3));
// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 4));
// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 5));

