const {MAIN_FILE_PATH, NOW} = require("./constants");

async function saveProtectorLevels(workbook, data) {
  const countries = sortCountries(data.countries);
  const newHeader = createHeader(countries);

  const sheetName = 'Protector';
  let sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    sheet = workbook.addWorksheet(sheetName);
    sheet.columns = newHeader;
    sheet.views = [{state: 'frozen', ySplit: 1}];
  }

  const oldHeaderValues = sheet.getRow(1).values.slice(1)
  const newHeaderValues = newHeader.map(it => it.header)
  if (oldHeaderValues.length !== newHeaderValues.length) {
    console.log("We need to shift columns in Protector...");
    for (let i = 0; i < newHeaderValues.length; i++) {
      if (oldHeaderValues[i] === newHeaderValues[i]) {
        continue;
      }
      console.log("Shifting is needed");
      oldHeaderValues.splice(i, 0, newHeaderValues[i])
      for (rIndex = 2; rIndex <= sheet.rowCount; rIndex++) {
        const row = sheet.getRow(rIndex);
        row.splice(i + 1, 0, 0)
        row.commit()
      }
    }
  }

  sheet.columns = newHeader;
  const newRow = createRow(countries);
  console.log("Adding a new row to Protector...");
  sheet.addRow(newRow);

  await workbook.xlsx.writeFile(MAIN_FILE_PATH);
  console.log("Protector data saved");
}

function sortCountries(countries) {
  return countries
    .sort((a, b) => {
      let titleA = a.tanks.title ? a.tanks.title : a.aircraft.title;
      let titleB = b.tanks.title ? b.tanks.title : b.aircraft.title;
      return titleA.localeCompare(titleB)
    })
}

function createHeader(countries) {
  const columnNames = createCountriesHeader(countries);
  // console.log(columnNames);
  return [
    {header: 'Date', key: 'date', width: 12},
    {header: 'Time', key: 'time', width: 10},
  ].concat(columnNames.map(it => {
    // console.log(it);
    return ({
      header: it.header,
      key: it.header.toLowerCase()
        .replace(" ", "").replace("(", "")
        .replace(")", "").replace("-", ""),
      width: it.header.length
    })
  }));

  function createCountriesHeader(countries) {
    return countries
      .map(c => c.tanks.title ? c.tanks.title : c.aircraft.title)
      .map(title => title.replace("Protector of ", ""))
      .flatMap(name => [
        {header: name + " (Ground)", width: (name + " (Ground)").length},
        {header: name + " (Air)", width: (name + " (Air)").length},
      ])
  }
}

function createRow(countries) {
  const currentDateTime = NOW.toISOString().split('T');
  const date = currentDateTime[0];
  const time = currentDateTime[1].split('.')[0]

  let data = [date, time]
    .concat(countries
      .flatMap(country => [country.tanks.xp || 0, country.aircraft.xp || 0]))
  return data;
}


module.exports = {
  saveProtectorLevels
}
