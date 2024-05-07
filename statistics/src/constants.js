const EMAIL = process.env.ERPK_EMAIL;
const PASSWORD = process.env.ERPK_PASSWORD;
const LANG = process.env.ERPK_LANG || 'en';
const HOMEPAGE = 'https://www.erepublik.com';
const BASE_URL = `${HOMEPAGE}/${LANG}`;
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
const TEXT_HTML = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";
const APPLICATION_JSON = "application/json, text/plain, */*";
const APPLICATION_FORM_URLENCODED = "application/x-www-form-urlencoded";
const NOW = new Date();
const MAIN_FILE_PATH = 'eRepublik.xlsx';


module.exports = {
  EMAIL
  , PASSWORD
  , LANG
  , HOMEPAGE
  , BASE_URL
  , USER_AGENT
  , TEXT_HTML
  , APPLICATION_JSON
  , APPLICATION_FORM_URLENCODED
  , NOW
  , MAIN_FILE_PATH
}
