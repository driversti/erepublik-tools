const fs = require("fs");
const ExcelJS = require("exceljs");

const {
  fetchProtectorLevels,
  getLoginPage,
  extractToken,
  login,
  extractCitizenId,
  fetchPlayerProfile
} = require("./api");
const {MAIN_FILE_PATH} = require("./constants");
const {savePlayerProfile} = require("./player-profile");
const {saveProtectorLevels} = require("./protector");


async function getWorkbook(path) {
  let workbook = new ExcelJS.Workbook();

  if (fs.existsSync(path)) {
    try {
      await workbook.xlsx.readFile(path);
    } catch (err) {
      console.error(`Cannot read the file '${path}'.`, err);
    }
  } else {
    console.log("File not found. A new file will be created.");
    await workbook.xlsx.writeFile(path);
  }

  return workbook;
}


async function main() {
  console.log("Starting collecting data...");
  const workbook = await getWorkbook(MAIN_FILE_PATH)

  // const cookies = "erpk=df2518e083c8c5e732ff2314c3f1c2c9"
  // const protectors = await fetchProtectorLevels(cookies)
  // console.log(protectors.countries[0]);

  // const loginHTML = await getLoginPage();
  // console.log(loginHTML.data);
  // const token = extractToken(loginHTML.data);
  // console.log(`Token: ${token}`);
  // let homePage = await login(token);
  // const citizenId = extractCitizenId(homePage.data);

  // extracting player profile data
  const cookies = "l_chatroom=NDAwOmQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlOlgxVkJjbTE1WHc9PQ%3D%3D; erpk_mid=5d6d2ce4021cf2549ece87dca21acdf3; google-analytics_v4_kzbU__ga4=d6861435-2940-4fb5-91b9-e40f463fd829; google-analytics_v4_kzbU___z_ga_audiences=d6861435-2940-4fb5-91b9-e40f463fd829; googtrans=/en/uk; googtrans=/en/uk; google-analytics_v4_kzbU__engagementPaused=1686764028872; l_state=%3A%3A%3A%3A%3A; google-analytics_v4_kzbU__engagementStart=1690555401430; google-analytics_v4_kzbU__counter=79; google-analytics_v4_kzbU__session_counter=15; google-analytics_v4_kzbU__let=1690555401430; erpk_plang=en; erpk_auth=1; erpk_rm=7d9350a0ba4262a91ae641ef568f6c2b; ai_user=cRImy/2V+3tKv7JAm1D7sl|2023-08-11T15:55:42.522Z; cf_clearance=VYqTYEQMvRe5p6rIUn1BeiRyk7CmkWxLVNHewYHp1LA-1691772206-0-1-eb53d4f3.c6b522cd.bc528b13-0.2.1691772206; erpk=af596b83becb7584a3b86791636c629b"
  const profileData = await fetchPlayerProfile(4690052, cookies)
  await savePlayerProfile(workbook, profileData)
  // extracting inventory data


  // extracting protector levels
  const protectorLevels = await fetchProtectorLevels(cookies)
  await saveProtectorLevels(workbook, protectorLevels)
}

module.exports = {
  main
}
