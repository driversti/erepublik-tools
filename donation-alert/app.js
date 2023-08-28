const fs = require('fs');
const Parser = require('rss-parser');
let parser = new Parser();
const moment = require('moment-timezone');

const TELEGRAM_TOKEN = process.env.COUNTRY_TELEGRAM_TOKEN;
const TELEGRAM_CHANNEL = process.env.COUNTRY_TELEGRAM_CHANNEL;
const COUNTRY = process.env.COUNTRY;
const COUNTRY_TZ = process.env.COUNTRY_TZ;
const RSS_FEED_URL = `https://www.erepublik.com/en/main/news/military/all/${COUNTRY}/0/rss`;
const CHECK_INTERVAL = 10 * 1000; // Checking every 10 seconds
const DATE_FILE = 'latest_date.txt';

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_TOKEN);

let latestPubDate = new Date(0); // Initialize with the earliest possible date.

function loadLatestDate() {
  if (fs.existsSync(DATE_FILE)) {
    const dateFromFile = fs.readFileSync(DATE_FILE, 'utf-8');
    latestPubDate = dateFromFile && new Date(dateFromFile);
  }
}

function saveLatestDate(date) {
  fs.writeFileSync(DATE_FILE, date.toISOString());
}

function formatMessage(item) {
  const itemDate = moment(item.pubDate).tz(COUNTRY_TZ).format("YYYY-MM-DD HH:mm:ss");
  const regex = /<a href="([^"]*)">([^<]*)<\/a>/;
  const match = item.content.match(regex);
  if (match) {
    const url = "https:" + match[1];
    const text = match[2];
    return `${itemDate}\n<a href="${url}">${text}</a>`;
  }
  return `${itemDate}\n${item.content}`;
}

async function checkForUpdates() {
  let feed = await parser.parseURL(RSS_FEED_URL);
  for (let item of feed.items) {
    let itemDate = new Date(item.pubDate);
    if (itemDate > latestPubDate) {
      let message = formatMessage(item);
      console.log(message);
      let response = await bot.sendMessage(TELEGRAM_CHANNEL, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
      // console.log(response);
      latestPubDate = itemDate;
      saveLatestDate(latestPubDate);
    }
  }
}

loadLatestDate();
checkForUpdates();
setInterval(checkForUpdates, CHECK_INTERVAL);
