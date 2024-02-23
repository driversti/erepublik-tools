const Parser = require('rss-parser');
let parser = new Parser();
const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const moment = require('moment-timezone');
const config = require('./config');
const hrtime = process.hrtime;

const TELEGRAM_TOKEN = process.env.COUNTRY_TELEGRAM_TOKEN;
const RSS_FEED_ALL = "https://www.erepublik.com/en/main/news/military/all/all/1/rss"
// const RSS_FEED_ALL = "https://www.erepublik.com/en/main/news/military/all/Lithuania/1/rss"
const CHECK_INTERVAL = 10 * 1000; // Checking every 10 seconds
const bot = new TelegramBot(TELEGRAM_TOKEN);

function checkForUpdates(url) {
  parser.parseURL(url)
    .then(feed => readFeed(feed))
    .catch(error => console.error(`Error fetching the RSS feed (${url}):`, error));
}

function readFeed(feed) {
  const start = hrtime();
  let reversedItems = [...feed.items].reverse();

  config.map.forEach((country) => {
    handleLaws(reversedItems, country);
    handleBattles(reversedItems, country);
  });
  const end = hrtime(start);
  // console.info("Execution time (hr): %ds %dms", end[0], end[1] / 1000000);
}

function handleLaws(reversedItems, country) {
  // console.log(`Handling ${JSON.stringify(country.name)} (${country.id}) laws`);
  if (!country.lawChannel) {
    return;
  }
  const items = reversedItems
    .filter(item => lawsOnly(item, country.id))
    .filter(item => forCountryOnly(item, country.id))
    .map(item => prepareItemsForSending(item, country.id))

  let messages = [];

  for (let item of items) {
    let itemDate = new Date(item.time);
    if (itemDate > country.getLawsLastUpdated()) {
      let message = `${item.time}\n<a href="${item.url}">${item.text}</a>`;
      messages.push(message);
      country.setLawsLastUpdated(itemDate);
    }
  }

  let message = messages.join("\n\n");
  if (message.length <= 0) {
    return;
  }
  send(message, country.lawChannel);
}

function handleBattles(reversedItems, country) {
  // console.log(`Handling ${JSON.stringify(country.name)} (${country.id}) battles`);
  if (!country.battlesChannel) {
    return;
  }
  const items = reversedItems
    .filter(item => battlesOnly(item, country.id))
    .filter(item => forCountryOnly(item, country.id))
    .map(item => prepareItemsForSending(item, country.id))

  let messages = [];

  for (let item of items) {
    let itemDate = new Date(item.time);
    if (itemDate > country.getBattlesLastUpdated()) {
      let message = `${item.time}\n<a href="${item.url}">${item.text}</a>`;
      messages.push(message);
      country.setBattlesLastUpdated(itemDate);
    }
  }

  let message = messages.join("\n\n");
  if (message.length <= 0) {
    return;
  }
  send(message, country.battlesChannel);
}

function send(message, channel) {
  bot.sendMessage(channel, message, {
    parse_mode: 'HTML',
    disable_web_page_preview: true
  })
    .then(() => console.log(message))
    .catch(error => {
      console.log(`${channel}, ${message}`);
      console.error("Error sending the message:", error);
    });
}

function battlesOnly(item, countryId) {
  return hasResistanceStarted(item, countryId) || hasSecured(item, countryId) || hasAttacked(item, countryId);
}

function hasResistanceStarted(item, countryId) {
  const regex = new RegExp(`https://www.erepublik.com/(?:${config.getLang(countryId)}|en)/wars/show/`);
  return regex.test(item.link);
}

function hasSecured(item, countryId) {
  const regex = new RegExp(`https://www.erepublik.com/(?:${config.getLang(countryId)}|en)/wars/show/`);
  return regex.test(item.link);
}

function hasAttacked(item, countryId) {
  const regex = new RegExp(`https://www.erepublik.com/(?:${config.getLang(countryId)}|en)/military/battlefield/`);
  return regex.test(item.link);
}

function lawsOnly(item, countryId) {
  return lawLink(item, countryId)
    || (isCountryNameWithTagInLink(item) || isHostDoubledInLink(item, countryId))
}

function lawLink(item, countryId) {
  const LAW_REGEX = new RegExp(`https://www.erepublik.com/(?:${config.getLang(countryId)}|en)/main/law/`);
  return LAW_REGEX.test(item.link);
}

function isCountryNameWithTagInLink(item) {
  const BROKEN_LINK_REGEX = new RegExp(`https:\/\/www\.erepublik\.com\<b\>.*\<\/b\>$`);
  return BROKEN_LINK_REGEX.test(item.link);
}

function isHostDoubledInLink(item, countryId) {
  const regexp = new RegExp(`https://www.erepublik.com//www.erepublik.com/(?:${config.getLang(countryId)}|en)/main/law/`);
  return regexp.test(item.link);
}

function forCountryOnly(item, countryId) {
  return item.link.indexOf(config.getEncodedName(countryId)) !== -1
    || item.content.indexOf(config.getName(countryId)) !== -1
    || item.content.indexOf(config.getNativeName(countryId)) !== -1;
}

function prepareItemsForSending(item, countryId) {
  const tz = config.getTZ(countryId);
  const itemDate = moment(item.pubDate).tz(tz).format("YYYY-MM-DD HH:mm:ss");
  if (isCountryNameWithTagInLink(item.link)) {
    const urlMatch = item.content.match(/<a href="([^"]+)">/);
    const url = urlMatch ? "https://www.erepublik.com" + urlMatch[1] : null;
    const cleanedContent = item.content.replace(/\/\/www\.erepublik\.com<b>/g, "")
      .replace(/<\/b>/g, "")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .trim();
    // console.log(`${cleanedContent}, ${url}`);
    return {text: cleanedContent, url: url, time: itemDate};
  }

  if (isHostDoubledInLink(item, countryId)) {
    const cleanedLink = item.link.replace("//www.erepublik.com", "");
    return {text: item.content, url: cleanedLink, time: itemDate};
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


checkForUpdates(RSS_FEED_ALL);
setInterval(() => checkForUpdates(RSS_FEED_ALL), CHECK_INTERVAL);

// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 2));
// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 3));
// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 4));
// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 5));

