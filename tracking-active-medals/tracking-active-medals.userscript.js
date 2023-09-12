// ==UserScript==
// @name         Tracking Active Medals
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tracking Active Medals in eRepublik to make it easier to protect them and not get lost when there are plenty of them.
// @author       driversti https://www.erepublik.com/en/citizen/ptofile/4690052
// @match        https://www.erepublik.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erepublik.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  renderCanvas();
  applyStyles();
})();

const headers = new Headers({
  'Accept': 'application/json, text/plain, */*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en,uk;q=0.9,pt;q=0.8',
  'Connection': 'keep-alive',
  'User-Agent': navigator.userAgent,
  'X-Requested-With': 'XMLHttpRequest',
});


function renderCanvas() {
  let wrapper = document.createElement('div');
  wrapper.id = 'medals-tracker';
  wrapper.className = 'medal-canvas';

  document.getElementById('large_sidebar').appendChild(wrapper);

  renderMedalHeader(wrapper);
  renderMedalContainer(wrapper);
  renderRefreshButton(wrapper);
}

function renderMedalHeader(parent) {
  let header = document.createElement('div');
  header.id = 'medal-header';
  header.innerText = 'Active Medals';
  header.className = 'medal-header';

  parent.appendChild(header);
}

function renderMedalContainer(parent) {
  let medalContainer = document.createElement('div');
  medalContainer.id = 'medal-container';
  medalContainer.className = 'medal-container';

  parent.appendChild(medalContainer);

  addNoActiveMedals();
}

function renderRefreshButton(parent) {
  let refreshBtn = document.createElement('button')
  refreshBtn.id = 'refresh-medals-btn';
  refreshBtn.className = 'refresh-medals-btn';
  refreshBtn.innerText = 'Refresh';

  refreshBtn.addEventListener('click', () => {
    fetchActiveMedals();
  });
  parent.appendChild(refreshBtn);
}

function fetchActiveMedals() {
  console.log('fetching active medals...');
  const url = 'https://www.erepublik.com/en/military/campaignsJson/citizen';
  fetch(url, {
    method: 'GET',
    headers,
    mode: 'cors',
    credentials: 'same-origin',
  })
    .then(response => response.json())
    .then(data => showActiveMedals(data))
    .catch(error => notifyDeveloper(error));
}

function showActiveMedals(data) {
  const container = document.getElementById('medal-container')
  removeChildren(container)

  // console.log(data.battles);
  let battlesWithActiveZones = [];

  for (let battleId in data.battles) {
    const battle = data.battles[battleId];

    if (battle.citizenStats) {
      for (let countryId in battle.citizenStats) {
        const stats = battle.citizenStats[countryId];

        for (let i = 0; i < stats.activeZones.length; i++) {
          if (typeof stats.activeZones[i] === 'number') {
            battlesWithActiveZones.push({
              'battleId': battleId,
              'damage': stats.damage,
            });
          }
        }
      }
    }
  }

  if (battlesWithActiveZones.length === 0) {
    addNoActiveMedals()
    return;
  }

  // console.log(battlesWithActiveZones);

  fetch('https://www.erepublik.com/en/military/campaignsJson/list', {
    method: 'GET',
    headers,
    mode: 'cors',
    credentials: 'same-origin',
  })
    .then(response => response.json())
    .then(data => {
      battlesWithActiveZones.forEach(it => {
        const battle = data.battles[it.battleId];
        // console.log(battle.region.name);
        addMedal(it, battle);
      })
    })
    .catch(error => notifyDeveloper(error))
}

function removeChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function notifyDeveloper(error) {
  console.error(error);
  alert('Something went wrong. Please contact the developer.');
  fetch('', {
    method: 'GET',
    headers,
    mode: 'cors',
    credentials: 'same-origin',
  })
    .then(response => console.log("A new message to the Developer page has been opened."))
    .catch(error => console.error(`Cannot open a new message to the Developer page: ${error}`));
}

function addNoActiveMedals() {
  let container = document.getElementById('medal-container');
  let div = document.createElement('div');
  div.innerText = 'No active medals';
  div.className = 'medal-item';
  container.appendChild(div);
}

function addMedal(stat, battle) {
  let container = document.getElementById('medal-container');
  const div = document.createElement('div');
  const a = document.createElement('a');
  a.href = `https://www.erepublik.com/en/military/battlefield/${battle.id}`;
  a.textContent = `${battle.region.name} (${formatNumber(stat.damage)}, ${minutesSince(battle.start)} min ago)`;
  a.setAttribute('target', '_blank');
  div.appendChild(a);
  div.className = 'medal-item';
  container.appendChild(div);
}

function formatNumber(num) {
  if (num >= 1e9) { // Billions
    return (num / 1e9).toFixed(1) + 'B';
  } else if (num >= 1e6) { // Millions
    return (num / 1e6).toFixed(1) + 'M';
  } else if (num >= 1e3) { // Thousands
    return (num / 1e3).toFixed(1) + 'K';
  } else {
    return num.toString(); // Return the number as-is for numbers less than 1000
  }
}

function minutesSince(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  return Math.floor(diff / 60);
}

function applyStyles() {
  let styles = document.createElement('style');
  styles.innerHTML = `
.medal-canvas {
  border: 1px solid black;
  width: 100%;
  height: fit-content;
  display: inline-block;
  margin-top: 10px;
}
  
.medal-header {
  border-bottom: 1px solid black;
  background-color: #c5c5c5;
  height: fit-content;
  display: block;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  padding: 5px;
}

.medal-container {
    height: fit-content;
}

.medal-item {
  height: fit-content;
  margin: 4px 0;
  padding: 5px;
  font-size: 10px;
  text-align: center;
}

.refresh-medals-btn {
    height: 22px;
    width: 100%;
    font-size: 14px;
}
`;

  document.head.appendChild(styles);
}
