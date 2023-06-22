// ==UserScript==
// @name         eRepublik User Locator
// @version      1.0
// @description  allows to track a player's location
// @author       driversti https://www.erepublik.com/en/citizen/profile/4690052
// @downloadURL
// @updateURL
// @match        https://www.erepublik.com/*
// @require      https://unpkg.com/dexie@3.0.3/dist/dexie.min.js
// @run-at       document-end
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erepublik.com
// @grant        none
// ==/UserScript==

(async function () {
  'use strict';

  applyStyles();
  updateRegions();
  addPlayerLocatorDiv();
})();

function getPlayerData(id) {
  return fetch(`https://www.erepublik.com/en/main/citizen-profile-json-personal/${id}`, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'User-Agent': navigator.userAgent,
      Cookie: document.cookie
    },
  }).then(response => response.json());
}

function savePlayers(players) {
  localStorage.setItem('locatorPlayers', JSON.stringify(players));
}

function loadPlayers() {
  const idsString = localStorage.getItem('locatorPlayers');
  if (idsString) {
    return JSON.parse(idsString);
  } else {
    return [];
  }
}

function addPlayerToTracker() {
  const playerIdInput = document.getElementById('playerID');
  const id = playerIdInput.value;
  console.log(`https://www.erepublik.com/en/citizen/profile/${id}`)

  getPlayerData(id).then(data => {
    const {citizen, location} = data;
    const name = citizen.name;
    const countryId = location.citizenLocationInfo.residence_country_id;
    const regionId = location.citizenLocationInfo.residence_region_id;
    const isOnline = citizen.onlineStatus;

    const playerRow = createPlayerRow(id, name, `${countryId}, ${regionId}`, isOnline);

    const playersDiv = document.getElementById('players');
    playersDiv.appendChild(playerRow);

    // Save the player ID in local storage
    const players = loadPlayers();
    players.push({id: id, paused: false});
    savePlayers(players);

    playerIdInput.value = '';
  });
}

function addPlayerLocatorDiv() {
  const trackerHTML = `
    <div id="playerTracker" style="border:1px solid black;">
        <div id="locatorHeader">
            <span class="col">Player</span>
            <span class="col">Location</span>
            <span class="col">Remove</span>
        </div>
        <div id="players"></div>
        <div class="input-button-wrapper">
            <input id="playerID" type="number" placeholder="Player ID">
            <button id="addToTrackingButton">Add</button>
        </div>
        <div class="input-button-wrapper">
            <input id="updateInterval" type="number" placeholder="Update every X seconds">
            <button id="setIntervalButton">Set</button>
        </div>
    </div>`;

  const body = document.querySelector('body');
  const container = document.createElement('div');
  container.innerHTML = trackerHTML;
  body.appendChild(container);
  document.getElementById('addToTrackingButton').addEventListener('click', addPlayerToTracker)
  document.getElementById('setIntervalButton').addEventListener('click', setIntervalOfTracking)

  const playerTracker = document.getElementById('playerTracker');
  const savedPosition = JSON.parse(localStorage.getItem('playerTrackerPosition'));
  console.log(`Saved position: ${JSON.stringify(savedPosition)}`);
  playerTracker.style.position = 'absolute';
  playerTracker.style.backgroundColor = '#e0dede';
  playerTracker.style.width = '300px';
  playerTracker.style.left = savedPosition ? savedPosition.left : '350px';
  playerTracker.style.top = savedPosition ? savedPosition.top : '380px';
  playerTracker.style.zIndex = '2001';
  populateWithPlayers();
  makeElementDraggable(playerTracker);
}

function setIntervalOfTracking() {
  console.log('Not implemented yet');
}

function makeElementDraggable(element) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  // When the user presses the mouse button, start dragging
  element.addEventListener('mousedown', (event) => {
    offsetX = event.clientX - element.offsetLeft;
    offsetY = event.clientY - element.offsetTop;
    isDragging = true;
  });

  // When the user moves the mouse, reposition the element
  document.addEventListener('mousemove', (event) => {
    if (isDragging) {
      element.style.left = `${event.clientX - offsetX}px`;
      element.style.top = `${event.clientY - offsetY}px`;
      // Save the new position in local storage
      localStorage.setItem('playerTrackerPosition', JSON.stringify({
        left: element.style.left,
        top: element.style.top
      }));
      // console.log(`Saving position: ${element.style.left}:${element.style.top}`)
    }
  });

  // When the user releases the mouse button, stop dragging
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

function populateWithPlayers() {
  console.log('Populating players...');
  const regions = localStorage.getItem('locator_regions')['regions'];
  console.log(regions);

  // Load the list of player IDs from local storage
  loadPlayers().forEach(p => {
    if (!p.paused) {
      // Fetch the player data and add a row for each player
      getPlayerData(p.id).then(data => {
        const {citizen, location} = data;
        const name = citizen.name;
        const regionId = location.citizenLocationInfo.residence_region_id;
        const isOnline = citizen.onlineStatus;

        const regionItem = regions.find(item => item.region_id === regionId);
        const region = regionItem.region_name
        const country = regionItem.current_country_name;
        const playerRow = createPlayerRow(p.id, name, `${country}, ${region}`, isOnline);

        const playersDiv = document.getElementById('players');
        playersDiv.appendChild(playerRow);
        document.getElementById('removePlayerFromLocatorButton')
          .addEventListener('click', () => removePlayerFromLocator(p.id))
      });
    }
  });
}

function createPlayerRow(id, name, location, isOnline) {
  const row = document.createElement('div');
  row.className = 'player-row';
  row.innerHTML = `
        <a href="https://www.erepublik.com/en/citizen/profile/${id}" target="_blank">
          <span class="col ${isOnline ? 'online' : 'offline'}">${name} (${id})</span>
        </a>
        <span class="col">${location}</span>
        <span class="col"><button id="removePlayerFromLocatorButton">X</button></span>
    `;
  return row;
}

function removePlayerFromLocator(id) {
  // Remove the player's row from the DOM
  const playerRow = document.getElementById(`player-${id}`);
  playerRow.remove();

  let players = loadPlayers();
  players = players.filter(player => player.id !== id);

  // Save the updated list of player IDs back to local storage
  savePlayers(players);
}

function updateRegions() {
  const savedRegions = JSON.parse(localStorage.getItem('locator_regions'))
  const now = new Date()
  const tenMinutes = 10 * 60 * 1000;
  if (savedRegions && savedRegions.lastUpdate && (now - savedRegions.lastUpdate) < tenMinutes) {
    console.log('Regions are up-to-date');
    return;
  }

  console.log('Updating regions...')
  fetch(`https://www.erepublik.com/en/main/map-data`, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'User-Agent': navigator.userAgent,
      Cookie: document.cookie
    }
  })
    .then(response => response.json())
    .then(json => {
      const regions = [];

      for (const regionId in json) {
        const item = json[regionId];
        const region = {
          current_country_id: item.current_country.id,
          current_country_name: item.current_country.name,
          region_id: item.region.id,
          region_name: item.region.name,
        };
        regions.push(region);
      }
      localStorage.setItem('locator_regions', JSON.stringify({
        regions: regions,
        lastUpdated: new Date()
      }));
      console.log('Regions have been updated.');
    })
    .catch(error => {
      console.error('Error occurred during region update:', error);
    });
}

const updateRegionsIntervalId = setInterval(updateRegions, 600000)
window.addEventListener('beforeunload', () => clearInterval(updateRegionsIntervalId))

function applyStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .trackerWrapper {
        border: 5px solid red;
    }
        
    #playerTracker {
        width: 300px; 
        box-sizing: border-box;
    }

    #playerTracker #locatorHeader, 
    #playerTracker .player-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    #playerTracker .col {
        flex: 1;
        padding: 5px;
    }

    #playerTracker .col:first-child {
        flex: 3; 
    }

    #playerTracker .col:last-child {
        flex: 0.5;
        text-align: center;
    }

    #playerTracker .online {
        color: green;
    }

    #playerTracker .offline {
        color: red;
    }

    #playerTracker .input-button-wrapper {
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
    }

    #playerTracker input[type="number"] {
        flex: 1;
        margin-right: 10px;
    }

    #playerTracker button {
        width: 50px;
    }
    
    .player-row .online {
      color: green;
    }
    
    .player-row .offline {
      color: red;
    }
    `;
  document.head.append(style);
}
