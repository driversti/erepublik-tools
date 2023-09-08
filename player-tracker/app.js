const axios = require('axios').default;
const {wrapper} = require('axios-cookiejar-support')
const {CookieJar} = require('tough-cookie');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
const APPLICATION_FORM_URLENCODED = 'application/x-www-form-urlencoded';
const TELEGRAM_TOKEN = process.env.TRACKER_TELEGRAM_TOKEN;
const TELEGRAM_CHANNEL = process.env.TRACKER_TELEGRAM_CHANNEL;
const EMAIL = process.env.EREP_EMAIL;
const PASSWORD = process.env.EREP_PASSWORD;
const PLAYER_ID = process.env.TRACKER_PLAYER_ID;
const INTERVAL = 10_000; // 10 seconds
const BASE_URL = 'https://www.erepublik.com/en';
const PROFILE_JSON_URL = `/main/citizen-profile-json-personal/${PLAYER_ID}`;
const filename = 'storage.json';

const jar = new CookieJar();
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'User-Agent': USER_AGENT
  },
  withCredentials: true,
  jar: jar
});

let authorized = false;
let _token = null;
let erpk = null;
let runIntervalId;
let tokenIntervalId;

const ONE_YEAR_IN_SECONDS = 31536000;  // 365 days × 24 hours × 60 minutes × 60 seconds

// Helper function to set expiration date to 1 year from now
const setExpirationToOneYear = (cookie) => {
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  return cookie.replace(/expires=[^;]*/, 'expires=' + oneYearFromNow.toUTCString())
    .replace(/Max-Age=[^;]*/, 'Max-Age=' + ONE_YEAR_IN_SECONDS);
};

// Interceptor
client.interceptors.response.use((response) => {
  // Update the Set-Cookie header
  if (response.headers['set-cookie']) {
    response.headers['set-cookie'] = response.headers['set-cookie'].map(cookie => {
      return cookie.startsWith('erpk=') ? setExpirationToOneYear(cookie) : cookie;
    });
  }

  // Update the erpk-maxage and erpk-expires headers
  if (response.headers['erpk-maxage']) {
    response.headers['erpk-maxage'] = ONE_YEAR_IN_SECONDS.toString();
  }

  if (response.headers['erpk-expires']) {
    const newExpirationTimestamp = Math.floor((new Date().getTime() / 1000) + ONE_YEAR_IN_SECONDS);
    response.headers['erpk-expires'] = newExpirationTimestamp.toString();
  }

  return response;
}, (error) => {
  return Promise.reject(error);
});


wrapper(client);

const fs = require('fs');
const path = require('path');
const qs = require('qs');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});

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
  const url = '/login';
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
  console.log(`Initial token: ${token}`);
  const homePage = await login(token);
  // console.log(homePage.data);
  _token = extractToken(homePage.data);
  console.log(`Session Token: ${_token}`);
  const erpkCookie = jar.serializeSync().cookies.find(cookie => cookie.key === 'erpk');
  if (erpkCookie) {
    console.log(`ERPK: ${erpkCookie.value}`);
    erpk = erpkCookie.value;
  } else {
    console.log('Cookie with key "erpk" not found.');
  }
}

async function keepTokenAlive() {
  console.log("Keeping token alive...");
  const url = '/economy/marketplaceAjax';
  const payload = qs.stringify({
    countryId: 72,
    industryId: 3,
    quality: 2,
    orderBy: 'price_asc',
    currentPage: 1,
    ajaxMarket: 1,
    _token: _token,
  })
  // console.log(payload);
  // console.log(jar.getCookieStringSync(BASE_URL));
  const response = await client.post(url, payload, {
    headers: {
      'Accept': 'application/json, */*; q=0.01',
      'Content-Type': APPLICATION_FORM_URLENCODED,
      'User-Agent': USER_AGENT,
      'Cookie': `erpk=${erpk}`,
    },
    withCredentials: true
  });
  // console.log("Keep-Alive Request Headers:", response.config.headers);
  // console.log("Keep-Alive Response Headers:", response.headers);
  console.log(`Q3 tickets: ${response.data.offers.length}`);
}

async function fetchProfileJson() {
  console.log(`Fetching profile json ${BASE_URL}${PROFILE_JSON_URL}`);
  try {
    // const erpkCookie = jar.getCookiesSync(BASE_URL).find(cookie => cookie.key === 'erpk');
    // if (erpkCookie) {
    //   console.log(`ERPK: ${erpkCookie}`);
    //   client.defaults.headers.Cookie = `erpk=${erpk}`;
    // }
    const response = await client.get(PROFILE_JSON_URL, {
      headers: {
        'Cookie': `erpk=${erpk}`,
        'User-Agent': USER_AGENT,
        'Accept': 'application/json, text/plain, */*'
      }
    });
    // console.log("Request Headers:", response.config.headers);
    // console.log("Response Headers:", response.headers);
    // if (response.headers['set-cookie']) {
    //   console.log("Cookies:", response.headers['set-cookie']);
    // }
    return response.data;
  } catch (e) {
    console.error("Error while fetching profile json", e);
    if (e.response && e.response.status === 401) {
      authorized = false;
      await createSession();
      return await fetchProfileJson();
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

  if (!profileJson) {
    console.log("Profile json is empty. Skipping...");
    return;
  }
  if (!profileJson.citizen) {
    console.log("Citizen is empty. Skipping...");
    console.log(profileJson);
    // if (profileJson === { error: 'not_authorized' }) {
    //   await createSession();
    // } else {
    //   console.error("Unknown error. Termination...")
    //   return;
    // }
    clearInterval(runIntervalId);
    clearInterval(tokenIntervalId);
    return;
  }

  let currentOnlineStatus = profileJson.citizen.onlineStatus ? 'Online' : 'Offline';
  if (storage.lastOnlineStatus === currentOnlineStatus) {
    console.log(`Online status is the same (${currentOnlineStatus}). Skipping...`);
  } else {
    console.log(`Online status changed (${currentOnlineStatus}). Sending message...`);
    const message = `*${profileJson.citizen.name}* is now *${currentOnlineStatus}*`;
    // await bot.sendMessage(TELEGRAM_CHANNEL, message, {parse_mode: 'Markdown'});
    storage.lastOnlineStatus = currentOnlineStatus;
    storage.lastCheck = new Date().toISOString();
    await fs.promises.writeFile(filename, JSON.stringify(storage));
  }

  let currentLocation = profileJson.location.residenceRegion.name;
  let currentCountry = profileJson.location.residenceCountry.name;
  if (storage.lastLocation === currentLocation) {
    console.log(`Location is the same (${currentLocation}, ${currentCountry}). Skipping...`);
  } else {
    console.log(`Location changed to ${currentLocation}. Sending message...`);
    const message = `<a href="https://www.erepublik.com/en/citizen/profile/${PLAYER_ID}">${profileJson.citizen.name}</a> is now in <b>${currentLocation}, ${currentCountry}</b>`;
    await bot.sendMessage(TELEGRAM_CHANNEL, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    storage.lastLocation = currentLocation;
    storage.lastCheck = new Date().toISOString();
    fs.writeFileSync(filename, JSON.stringify(storage));
  }
}

run();
runIntervalId = setInterval(run, INTERVAL);
tokenIntervalId = setInterval(keepTokenAlive, 1000 * 60 * 12);
