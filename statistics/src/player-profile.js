const {NOW, MAIN_FILE_PATH} = require("./constants");

async function savePlayerProfile(workbook, data) {
  // console.log(data);

  let mainData = collectMainData(data);
  await saveMainData(workbook, mainData);
  let medals = collectMedals(data);
  // console.log(medals);
  await saveMedals(workbook, medals);
}

function collectMainData(data) {
  return {
    'Level': data.citizenAttributes.level,
    'Experience': data.citizenAttributes.experience_points,
    'Friends': data.friends.number,
    'National Rank': data.nationalRank.xp,
    'Strength': Math.floor(data.military.militaryData.ground.strength),
    'Ground Rank': data.military.militaryData.name,
    'Ground Points': data.military.militaryData.points,
    'Air Rank': data.military.militaryData.aircraft.name,
    'Air Points': data.military.militaryData.aircraft.points,
    'Bombs': data.nukes.bombs,
    'Nukes': data.nukes.nukes,
  }
}

async function saveMainData(workbook, mainData) {
  await saveNewData(workbook, mainData, 'Profile');
}

function createHeader(columnNames) {
  return [
    {header: 'Date', key: 'date', width: 12},
    {header: 'Time', key: 'time', width: 10},
  ].concat(columnNames.map(it => (
    {header: it, key: it.toLowerCase().replace(" ", ""), width: it.length}
  )));
}

function createRow(data) {
  const dateTime = NOW.toISOString().split('T');
  const date = dateTime[0];
  const time = dateTime[1].split('.')[0];
  return [date, time].concat(Object.values(data));
}

function collectMedals(data) {
  const medals = {}
  data.achievements
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(m => medals[m.name]= m.count)
  return medals
}

async function saveMedals(workbook, medals) {
  await saveNewData(workbook, medals, 'Medals')
}

async function saveNewData(workbook, data, sheetName) {
  let sheet = workbook.getWorksheet(sheetName);
  const newHeader = createHeader(Object.keys(data));
  if (!sheet) {
    sheet = workbook.addWorksheet(sheetName);
    sheet.columns = newHeader;
    sheet.views = [{state: 'frozen', ySplit: 1}];
  }
  const oldHeaderValues = sheet.getRow(1).values.slice(1)
  const newHeaderValues = newHeader.map(it => it.header)
  // console.log("Old header: " + oldHeaderValues);
  if (oldHeaderValues.length !== newHeaderValues.length) {
    console.log("Shifting is needed");
    for (let i = 0; i < newHeaderValues.length; i++) {
      if (oldHeaderValues[i] === newHeaderValues[i]) {
        // console.log(oldHeaderValues[i] + " === " + newHeaderValues[i]);
        continue;
      }
      // console.log("Before splicing: " + oldHeaderValues[i] + " === " + newHeaderValues[i]);
      oldHeaderValues.splice(i, 0, newHeaderValues[i])
      // displayValues(sheet);
      // console.log("After splicing: " + oldHeaderValues[i] + " === " + newHeaderValues[i]);
      for (rIndex = 2; rIndex <= sheet.rowCount; rIndex++) {
        const row = sheet.getRow(rIndex);
        row.splice(i + 1, 0, 0)
        row.commit()
      }
    }
  }

  sheet.columns = newHeader;
  const newRow = createRow(Object.values(data));
  // console.log("Adding a new row");
  sheet.addRow(newRow)
  await workbook.xlsx.writeFile(MAIN_FILE_PATH);
  console.log(sheet.name + " data saved");
}

module.exports = {
  savePlayerProfile
}
