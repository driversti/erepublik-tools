const Parser = require('rss-parser');
let parser = new Parser();
const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const moment = require('moment-timezone');
const config = require('./config');

const COUNTRY_ID = parseInt(process.env.COUNTRY_ID);
console.log(COUNTRY_ID);
const TELEGRAM_TOKEN = process.env.COUNTRY_TELEGRAM_TOKEN;
console.log(TELEGRAM_TOKEN);
const TELEGRAM_LAWS_CHANNEL = config.getLawChannel(COUNTRY_ID);
const TELEGRAM_BATTLES_CHANNEL = config.getBattlesChannel(COUNTRY_ID);

const CHECK_INTERVAL = 10 * 1000; // Checking every 10 seconds
const LATEST_LAW_FILE = 'latest_law_date.txt';
const LATEST_BATTLE_FILE = 'latest_battle_date.txt';
const bot = new TelegramBot(TELEGRAM_TOKEN);

let latestPubDate = new Date(0); // Initialize with the earliest possible date.

const BROKEN_LINK_REGEX = new RegExp(`https:\/\/www\.erepublik\.com\<b\>.*\<\/b\>$`);
const LAW_REGEX = new RegExp(`https://www.erepublik.com/(?:${config.getLang(COUNTRY_ID)}|en)/main/law/`);

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
  const regex = new RegExp(`https://www.erepublik.com/(?:${config.getLang(COUNTRY_ID)}|en)/wars/show/`);
  return regex.test(item.link);
}

function hasSecured(item) {
  const regex = new RegExp(`https://www.erepublik.com/(?:${config.getLang(COUNTRY_ID)}|en)/wars/show/`);
  return regex.test(item.link);
}

function hasAttacked(item) {
  const regex = new RegExp(`https://www.erepublik.com/(?:${config.getLang(COUNTRY_ID)}|en)/military/battlefield/`);
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
  return item.link.indexOf(config.getEncodedName(COUNTRY_ID)) !== -1
    || item.content.indexOf(config.getName(COUNTRY_ID)) !== -1
    || item.content.indexOf(config.getNativeName(COUNTRY_ID)) !== -1;
}

function createClearItems(item) {
  const tz = config.getTZ(COUNTRY_ID);
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
checkForUpdates(config.getRssFeed(COUNTRY_ID));
setInterval(() => checkForUpdates(config.getRssFeed(COUNTRY_ID)), CHECK_INTERVAL);

// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 2));
// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 3));
// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 4));
// checkForUpdates(COUNTRIES.getRssFeed(COUNTRY_ID, 5));

