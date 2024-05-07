function displayValues(sheet) {
  sheet.eachRow((row) => {
    console.log(row.values.slice(1)); // start from index 1
  });
}

module.exports = {
  displayValues
}
