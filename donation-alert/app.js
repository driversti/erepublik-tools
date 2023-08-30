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
  parser.parseURL(RSS_FEED_URL)
    .then(feed => collectNewItemsAndSend(feed))
    .catch(error => {
      console.error("Error fetching the RSS feed:", error);
    });
}

function collectNewItemsAndSend(feed) {
  // Reverse the items array, so you start with the oldest item
  let reversedItems = [...feed.items].reverse();

  // Collect all messages in an array and send them all at once at the end
  let messages = [];

  for (let item of reversedItems) {
    let itemDate = new Date(item.pubDate);
    if (itemDate > latestPubDate) {
      let message = formatMessage(item);
      console.log(message);
      messages.push(message); // Add formatted message to the messages array
      latestPubDate = itemDate;
      saveLatestDate(latestPubDate);
    }
  }

  if (messages.length > 0) {
    let combinedMessage = messages.join('\n\n'); // Join messages with two newline characters
    return bot.sendMessage(TELEGRAM_CHANNEL, combinedMessage, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  }
}


loadLatestDate();
checkForUpdates();
setInterval(checkForUpdates, CHECK_INTERVAL);
