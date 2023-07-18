// ==UserScript==
// @name         erebuglik
// @namespace
// @version      0.1
// @description  making the gaming easier!
// @author       driversti
// @updateUrl    https://dl.dropboxusercontent.com/s/3tbn8ibbygpipsc/erebuglik.user.js
// @downloadUrl  https://dl.dropboxusercontent.com/s/3tbn8ibbygpipsc/erebuglik.user.js
// @match        https://www.erepublik.com/*
// @run-at       document-end
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erepublik.com// @include      https://www.erepublik.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const LEADERBOARD_URL = 'https://www.erepublik.com/en/main/leaderboards-damage';
  let wrapperDiv;

  document.addEventListener("DOMContentLoaded", initialize);

  function initialize() {
    createWrapper();
    displayLeaderboard();
    displayExpProgress();
    timeToFullEnergy();
    calculateEnergy();
  }

  function append(what, where) {
    what.style.marginBottom = '5px';
    where.appendChild(what);
  }

  function createWrapper() {
    wrapperDiv = document.createElement('div');
    wrapperDiv.id = 'progress_bar_wrapper';
    wrapperDiv.style.cssText = 'margin-left: 3px; height: fit-content; width:170px; display:inline-block';
    const sidebar = document.querySelector('.sidebar');
    sidebar.appendChild(wrapperDiv);
  }

  function displayLeaderboard() {
    const leaderboardDiv = document.createElement('div');
    leaderboardDiv.style.textAlign = 'center';
    const a = document.createElement('a');
    const title = document.createTextNode("Leaderboard");
    a.appendChild(title);
    a.href = LEADERBOARD_URL;
    leaderboardDiv.appendChild(a);
    append(leaderboardDiv, wrapperDiv);
  }

  function displayExpProgress() {
    const expBarContainer = document.createElement('div');
    expBarContainer.setAttribute('id', 'expBarContainer');

    const currentExp = erepublik.citizen.currentExperiencePoints;
    const nextLevelExp = parseInt(document
      .getElementById('experienceTooltip').children[3].children[0]
      .innerHTML.replaceAll(',', ''));

    const experienceInPercentages = document.querySelector('.actualXp')
      .getAttribute('style').split(':')[1]

    const experienceBarWrapper = document.createElement('div');
    experienceBarWrapper.style.cssText = 'z-index: 3;position: relative;border: 1px solid #6b6c6e;width: 100%;box-sizing: border-box;min-height: 20px;margin-bottom:5px';

    const progressDiv = document.createElement('div');
    progressDiv.style.cssText = 'box-sizing: border-box;min-height: 18px;position: absolute;top: 0; left: 0;z-index: 1;background: #c3c4c7;transition: width 0.5s;width:'
      + experienceInPercentages;
    experienceBarWrapper.appendChild(progressDiv);

    let indicator = document.createElement('div');
    indicator.style.cssText = 'z-index: 2;width: 100%;text-align: center;position: absolute;top: 0; left: 0;box-sizing: border-box;min-height: 20px;padding-top:2px';
    indicator.textContent = `${currentExp} / ${nextLevelExp}`;
    experienceBarWrapper.appendChild(indicator);

    let gapDiv = document.createElement('div');
    gapDiv.style.cssText = 'margin-bottom: 5px; text-align: center';
    const gapText = document.createTextNode(
      "Exp to the next level: " + (nextLevelExp - currentExp));
    gapDiv.appendChild(gapText);

    expBarContainer.append(experienceBarWrapper, gapDiv);
    append(expBarContainer, wrapperDiv);
  }

  function timeToFullEnergy() {
    let div = document.createElement('div');
    div.id = 'timeToFullEnergy';
    div.style.fontSize = '12px';
    div.style.textAlign = 'center';
    document.querySelector('.sidebar').appendChild(div);

    let energyToRecover = energyData.energyPoolLimit - energyData.energy;
    let timeToFull = energyToRecover / energyData.energyPerInterval * 360;  // as energyPerInterval is recovered every 6 minutes (360 seconds)

    let updateCountdown = () => {
      // Convert seconds to HH:MM:SS
      let hours = Math.floor(timeToFull / 3600);
      let minutes = Math.floor(timeToFull % 3600 / 60);
      let seconds = Math.floor(timeToFull % 60);

      // Add leading zeros if necessary
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      // Update div text
      div.textContent = `Full energy in ${hours}:${minutes}:${seconds}`;

      // Decrease remaining time by one second
      timeToFull--;
    };

    setInterval(updateCountdown, 1000);
  }

  function calculateEnergy() {
    'use strict';

    if (!window.location.href.includes('erepublik.com') && !window.location.pathname.includes('/main/inventory')) {
      return;
    }

    const energyRestoreMap = {
      "1_1": 2,
      "1_2": 4,
      "1_3": 6,
      "1_4": 8,
      "1_5": 10,
      "1_6": 12,
      "1_7": 20
    };

    const observer = new MutationObserver((mutations, observer) => {
      for (let mutation of mutations) {
        // Check if 'inventoryItems' was added
        if (mutation.target.id === 'inventoryItems') {
          // Disconnect the observer to prevent repeating the logic below
          observer.disconnect();
          let totalEnergy = 0;

          for (let key in energyRestoreMap) {
            let stockElement = document.getElementById('stock_' + key);
            if (stockElement) {
              let amount = parseInt(stockElement.getAttribute('formatnumber'), 10);
              let energyRestore = energyRestoreMap[key];
              totalEnergy += amount * energyRestore;
            }
          }

          const consumptionRatePerHour = energyData.energyPerInterval * (60 / 6); // Energy consumed per hour
          let timeToExhaustion = totalEnergy / consumptionRatePerHour;
          let days = Math.floor(timeToExhaustion / 24);
          let hours = Math.floor(timeToExhaustion % 24);
          let minutes = Math.floor((timeToExhaustion % 1) * 60);

          let titleElement = document.querySelector('.inventoryItems h4:first-child');
          if (titleElement) {
            titleElement.textContent += ` (Food will run out in ${days} days ${hours} hours ${minutes} minutes)`;
          }

          break; // No need to check other mutations
        }
      }
    });

    observer.observe(document, {childList: true, subtree: true});
  }

})();
