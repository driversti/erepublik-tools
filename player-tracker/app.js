const axios = require('axios').default;
const {wrapper} = require('axios-cookiejar-support')
const {CookieJar} = require('tough-cookie');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
const APPLICATION_FORM_URLENCODED = 'application/x-www-form-urlencoded';

const jar = new CookieJar();
const client = axios.create({
  headers: {
    'User-Agent': USER_AGENT
  },
  withCredentials: true,
  jar: jar
});

wrapper(client);

const fs = require('fs');
const path = require('path');
const qs = require('qs');
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_TOKEN = process.env.TRACKER_TELEGRAM_TOKEN;
const TELEGRAM_CHANNEL = process.env.TRACKER_TELEGRAM_CHANNEL;
const EMAIL = process.env.EREP_EMAIL;
const PASSWORD = process.env.EREP_PASSWORD;
const PLAYER_ID = process.env.TRACKER_PLAYER_ID;
const INTERVAL = 30_000; // 30 seconds
const BASE_URL = 'https://www.erepublik.com/en';
const PROFILE_JSON_URL = `${BASE_URL}/main/citizen-profile-json-personal/${PLAYER_ID}`;
const filename = 'storage.json';

const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});
var authorized = false;

function getLoginPage() {
  console.log("Fetching login page...");
  return client.get('https://www.erepublik.com', {
    headers: {
      "Accept": "text/html",
    },
    withCredentials: true
  })
    .catch(loginPageError);
}

function loginPageError(error) {
  console.error("Error while fetching the login page", error);
  handleError(error)
}

function handleError(error) {
  if (error.response) {
    console.error(`Status: ${error.response.status},\nData: ${error.response.status}`)
  }
  throw new Error("Request failed. Message: " + error.message);
}

function extractToken(responseData) {
  console.log("Extracting token...");
  const $ = cheerio.load(responseData);
  const token = $('input[name=_token]').val();
  // console.log(`Token: ${token}`);
  return token;
}

function login(token) {
  console.log("Logging in...");
  const url = `${BASE_URL}/login`;
  return new Promise((resolve, reject) => {
    jar.getCookies(url, (err, cookies) => {
      if (err) {
        reject(err);
        return;
      }

      const cookieHeader = cookies.join('; ');
      // console.log(`Cookie header: ${cookieHeader}`);

      resolve(client.post(url, qs.stringify({
        _token: token,
        citizen_email: EMAIL,
        citizen_password: PASSWORD,
        remember: 'on'
      }), {
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': APPLICATION_FORM_URLENCODED,
          'User-Agent': USER_AGENT,
        },
        withCredentials: true
      }));
      authorized = true;
    });
  }).catch(loginError);
}

function loginError(error) {
  console.error("Error while logging in", error);
  handleError(error)
}

async function createSession() {
  const loginHTML = await getLoginPage();
  const token = extractToken(loginHTML.data);
  const homePage = await login(token);
  // console.log(homePage.data);
}

async function fetchProfileJson() {
  console.log(`Fetching profile json ${PROFILE_JSON_URL}`);
  try {
    jar.getCookies(PROFILE_JSON_URL, (err, cookies) => {
      if (err) {
        console.error("Error retrieving cookies:", err);
        return;
      }
      // console.log("Cookies for the request:", cookies.join('; '));
    });

    // console.log('Headers:', client.defaults.headers);

    const response = await client.get(PROFILE_JSON_URL);
    return response.data;
  } catch (e) {
    console.error("Error while fetching profile json", e);
    if (e.response && e.response.status === 401) {
      authorized = false;
      await createSession();
    }
    // Re-throw the error if you want the caller to know about it
    throw e;
  }
}

function readStorageOrDefault() {
  const filePath = path.join(__dirname, filename);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error(`'${filename}' file not found. Creating a new one...`);
    return {
      lastOnlineStatus: null,
      lastLocation: null,
      lastCheck: null,
    };
  }
}

const run = async () => {
  if (!authorized) {
    await createSession();
  }

  const profileJson = await fetchProfileJson();
  const storage = readStorageOrDefault();

  // console.log(profileJson);
  // console.log(storage);
  if (!profileJson || !profileJson.citizen || !profileJson.citizen.onlineStatus) {
    console.log("Profile json is empty. Skipping...");
    return;
  }
  let currentOnlineStatus = profileJson.citizen.onlineStatus ? 'Online' : 'Offline';
  if (storage.lastOnlineStatus === currentOnlineStatus) {
    console.log(`Online status is the same (${currentOnlineStatus}). Skipping...`);
  } else {
    console.log(`Online status changed (${currentOnlineStatus}). Sending message...`);
    const message = `*${profileJson.citizen.name}* is now *${currentOnlineStatus}*`;
    await bot.sendMessage(TELEGRAM_CHANNEL, message, {parse_mode: 'Markdown'});
    storage.lastOnlineStatus = currentOnlineStatus;
    storage.lastCheck = new Date().toISOString();
    await fs.promises.writeFile(filename, JSON.stringify(storage));
  }

  let currentLocation = profileJson.location.residenceRegion.name;
  if (storage.lastLocation === currentLocation) {
    console.log("Location is the same. Skipping...");
  } else {
    console.log(`Location changed to ${currentLocation}. Sending message...`);
    const message = `*${profileJson.citizen.name}* is now in *${currentLocation}*`;
    await bot.sendMessage(TELEGRAM_CHANNEL, message, {parse_mode: 'Markdown'});
    storage.lastLocation = currentLocation;
    storage.lastCheck = new Date().toISOString();
    fs.writeFileSync(filename, JSON.stringify(storage));
  }
}

run();
setInterval(run, INTERVAL);
