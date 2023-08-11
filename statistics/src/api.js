const {default: axios} = require("axios");
const {CookieJar} = require("tough-cookie");
const {wrapper} = require("axios-cookiejar-support");
const {USER_AGENT, TEXT_HTML, HOMEPAGE, BASE_URL, EMAIL, PASSWORD, APPLICATION_JSON, APPLICATION_FORM_URLENCODED} = require("./constants");
const cheerio = require("cheerio");
const qs = require("qs");
const jar = new CookieJar();
const client = wrapper(axios.create({jar}));
client.defaults.headers['User-Agent'] = USER_AGENT;


function getLoginPage() {
  console.log("Fetching login page...");
  return client.get(HOMEPAGE, {
    headers: {
      "Accept": TEXT_HTML
    },
    withCredentials: true
  })
    .catch(loginPageError);
}

function loginPageError(error) {
  console.error("Error while fetching the login page", error);
  handleError(error)
}

function extractToken(responseData) {
  console.log("Extracting token...");
  const $ = cheerio.load(responseData);
  const token = $('input[name=_token]').val();
  console.log(`Token: ${token}`);
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
      console.log(`Cookie header: ${cookieHeader}`);

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
    });
  }).catch(loginError);
}

function loginError(error) {
  console.error("Error while logging in", error);
  handleError(error)
}

function handleError(error) {
  if (error.response) {
    console.error(`Status: ${error.response.status},\nData: ${error.response.status}`)
  }
  throw new Error("Request failed. Message: " + error.message);
}

function extractCitizenId(responseData) {
  console.log("Extracting citizen ID...");
  const $ = cheerio.load(responseData);
  const errorMessage = $('span#error_for_citizen_email').text();
  if (errorMessage === 'The challenge solution was incorrect.') {
    throw new Error('Cannot work because of captcha challenge 😥');
  }
  const href = $('.user_name').attr('href');
  console.log(`Href: ${href}`);

  const match = /\/citizen\/profile\/(\d+)/.exec(href);
  if (match === null) {
    throw new Error("Could not extract citizen ID from link. The link might be missing or malformed.");
  }

  const citizenId = match[1];
  console.log(`Citizen ID: ${citizenId}`);
  return citizenId;
}

function fetchPlayerProfile(citizenId, cookiesOpt) {
  console.log("Fetching player profile...");
  let headers = {
    "Accept": APPLICATION_JSON,
    "Content-Type": APPLICATION_FORM_URLENCODED,
    "User-Agent": USER_AGENT
  }

  if (cookiesOpt) {
    headers['Cookie'] = cookiesOpt;
  }

  return client.get(`${BASE_URL}/main/citizen-profile-json-personal/${citizenId}`, {
    headers: headers
  })
    .then(response => response.data)
    .catch(handleError)
}

function fetchProtectorLevels(cookiesOpt) {
  console.log("Fetching protector levels...");
  let headers = {
    "Accept": APPLICATION_JSON,
    "Content-Type": APPLICATION_FORM_URLENCODED,
    "User-Agent": USER_AGENT
  }

  if (cookiesOpt) {
    headers['Cookie'] = cookiesOpt;
  }

  return client.get(`${BASE_URL}/military/armory-data/protectors`, {
    headers: headers
  })
    .then(response => response.data)
    .catch(handleError)
}

function fetchWeeklyChallenge(cookiesOpt) {
  console.log("Fetching weekly challenge...");
  let headers = {
    "Accept": APPLICATION_JSON,
    "Content-Type": APPLICATION_JSON,
    "User-Agent": USER_AGENT
  }

  if (cookiesOpt) {
    headers['Cookie'] = cookiesOpt;
  }

  return client.get(`${BASE_URL}/main/weekly-challenge-data}`, {
    headers: headers
  })
    .then(response => response.data)
    .catch(handleError)
}

module.exports = {
  getLoginPage
  , extractToken
  , login
  , extractCitizenId
  , fetchPlayerProfile
  , fetchProtectorLevels
  , fetchWeeklyChallenge
}
