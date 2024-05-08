// ==UserScript==
// @name         2Clicker in Action
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Work, train, guy goods and gold, collect VIP points, grab rewards
// @author       driversti
// @match        https://www.erepublik.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erepublik.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const E_URL = 'https://www.erepublik.com/en';

  const _token = SERVER_DATA.csrfToken;
  const _day = erepublik.settings.eDay;

  const headers = new Headers({
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': document.cookie,
    'User-Agent': navigator.userAgent,
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': 'https://www.erepublik.com',
    'Referer': 'https://www.erepublik.com/en',
  });

  function readProgress() {
    return JSON.parse(localStorage.getItem('2clicker')) || {};
  }

  function saveProgress(progress) {
    localStorage.setItem('2clicker', JSON.stringify(progress));
  }

  function notifyDeveloper(message) {
    console.log('2Clicker error: ' + message);
  }

  // add a button to start the script
  addButton();

  function addButton() {
    const button = document.createElement('button');
    button.id = 'twoClickerButton';
    button.innerHTML = 'Start 2-Clicker';
    button.style.cssText = 'margin-top: 5px; margin-bottom: 10px; width: 100%;';

    button.addEventListener('click', start2Clicker);

    const parent = document.querySelector('.sidebar');
    parent.appendChild(button);
  }

  function start2Clicker() {
    console.log('2Clicker started');
    // read the progress from local storage
    const progress = readProgress();
    console.log(progress);
    // work
    work();
    // work overtime
    // work as manager (in loop)
    // train
    // buy goods
    // buy gold
    purchaseGold();
    // claim VIP points
    claimVIPPoints();
  }

  function work() {
    const progress = readProgress();
    if (!progress) return;
    if (progress.work?.day === erepublik.settings.eDay && progress.work?.worked) {
      console.log('Already worked');
      return;
    }

    console.log('working...');
    const body = `_token=${_token}&action_type=work`;
    post('/economy/work', body)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.error) console.log('Already worked');
        if (!data.status) {
          console.log('Work failed');
          return;
        }
        const updatedProgress = {...progress, work: {...progress.work, day: _day, worked: true}};
        saveProgress(updatedProgress);
      })
      .catch(error => notifyDeveloper(error));
  }

  function purchaseGold() {
    console.log('purchaseGold');
    const progress = readProgress();
    if (!progress) return;
    if (progress.gold?.day === erepublik.settings.eDay && progress.gold?.purchased) {
      console.log('Gold already purchased');
      return;
    }
    findGoldOfferId().then(offerId => {
      console.log('Gold offerId: ' + offerId);
      if (!offerId) return;
      const body = `_token=${_token}&offerId=${offerId}&amount=10&page=0&currencyId=62`
      post('/economy/exchange/purchase/', body)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data.error) console.log('Already purchased');
          // if (data.gold > 0) console.log('Gold purchased: ' + data.gold);
          const updatedProgress = {...progress, gold: {...progress.gold, day: _day, purchased: true}};
          saveProgress(updatedProgress);
        })
        .catch(error => notifyDeveloper(error));
    })
  }

  async function findGoldOfferId() {
    const exchangeMarket = await fetchExchangeMarketHTML();
    const table = exchangeMarket.querySelector('.exchange_offers');
    if (!table) return 0;

    const rows = table.querySelectorAll('tbody tr');
    console.log('There are ' + rows.length + ' rows');
    let offerId;
    rows.forEach(row => {
      const amount = parseFloat(row.querySelector('.ex_amount span').textContent);
      if (amount > 20) {
        offerId = row.querySelector('.ex_buy input[type="text"]').id.match(/\d+/)[0];
        return false; // break
      }
    });
    return offerId;
  }

  async function fetchExchangeMarketHTML() {
    return fetch(E_URL + '/economy/exchange-market')
      .then(response => response.text())
      .then(html => {
        return new DOMParser().parseFromString(html, 'text/html')
      });
  }

  function claimVIPPoints() {
    console.log('claimVIPPoints');
    const progress = readProgress();
    if (!progress) return;
    if (progress.vip?.day === erepublik.settings.eDay && progress.vip?.claimed) {
      console.log('VIP points already claimed');
      return;
    }

    const body = '_token=' + _token
    post('/main/vip-claim', body)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.error) console.log('Already claimed');
        if (data.today_points > 0) console.log('VIP points claimed: ' + data.today_points);
        const updatedProgress = {...progress, vip: {...progress.vip, day: _day, claimed: true}};
        saveProgress(updatedProgress);
      })
      .catch(error => notifyDeveloper(error));
  }

  function post(path, body) {
    return fetch(E_URL + path, {
      method: 'POST',
      headers: headers,
      mode: 'cors',
      credentials: 'include',
      body: body
    })
  }

  function toImplement() {
    console.log('0.3');

    $j(document).ready(function () {
      console.log(erepublik.settings.eDay);
      const progress = JSON.parse(localStorage.getItem('2clicker')) || {};
      console.log(progress);
      console.log(progress.eDay);
      if (!progress.wam) {
        console.log(progress.wam);
        //$j('#openPageButton').click(function() {
//            window.open('https://www.erepublik.com/en/economy/myCompanies', '_self');
        setTimeout(printIds, 1000);
      }
      progress.wam = true;
      localStorage.setItem('2clicker', JSON.stringify(progress));
      //});
    });

    function printIds() {
      const checkObj = $j('.listing.companies').not('.disabled, .notInRegion, .notAssigned, .cannotWorkAsManager');
      const companyIds = $j.map(checkObj, function (el) {
        return $j(el).attr('id').replace('company_', '')
      });
      //console.log(companyIds);
    }
  }
})();
