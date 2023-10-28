// ==UserScript==
// @name         Profile Damage Calculator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Shows the amount of damage you can make based on your strength, rank and weapon quality in the profile page of eRepublik.
// @author       driversti https://www.erepublik.com/en/citizen/ptofile/4690052
// @match        https://www.erepublik.com/*/citizen/profile/*
// @run-at       document-end
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erepublik.com
// @grant        none
//
// ==/UserScript==

(function () {
  'use strict';

  // let showDamageCalculator = false;

  class WeaponQuality {
    static Q0 = new WeaponQuality('Q0', 0);
    static Q1 = new WeaponQuality('Q1', 20);
    static Q2 = new WeaponQuality('Q2', 40);
    static Q3 = new WeaponQuality('Q3', 60);
    static Q4 = new WeaponQuality('Q4', 80);
    static Q5 = new WeaponQuality('Q5', 100);
    static Q6 = new WeaponQuality('Q6', 120);
    static Q7 = new WeaponQuality('Q7', 200);

    constructor(name, firePower) {
      this.name = name;
      this.firePower = firePower;
    }
  }

  const headers = new Headers({
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en,uk;q=0.9,pt;q=0.8',
    'Connection': 'keep-alive',
    'User-Agent': navigator.userAgent,
    'X-Requested-With': 'XMLHttpRequest',
  });

  function renderMainWrapper() {
    let wrapper = document.createElement('div');
    wrapper.id = 'profile-damage-calculator';
    wrapper.className = 'profile-damage-calculator-wrapper';

    document.querySelector('[ng-if="data.military.militaryData.aircraft"]').insertAdjacentElement('afterend', wrapper);

    renderShowCalculatorMessage(wrapper);
    renderGroundDamageCalculator(wrapper);
  }

  function renderShowCalculatorMessage(parent) {
    let showCalculatorBtn = document.createElement('button');
    showCalculatorBtn.id = 'show-calculator-btn';
    showCalculatorBtn.className = 'show-calculator-btn';
    showCalculatorBtn.innerText = 'Show damage calculator';

    // showCalculatorBtn.addEventListener('click', () => {
    //   alert('click');
    // showDamageCalculator = !showDamageCalculator;
    // document.getElementById('ground-dc').classList.toggle('hidden');
    // showCalculatorBtn.innerText = showDamageCalculator ? 'Hide damage calculator' : 'Show damage calculator';
    // });

    console.log('showCalculatorMessage');
    parent.appendChild(showCalculatorBtn);

    document.getElementById('show-calculator-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('click');
    });
  }

  function renderGroundDamageCalculator(parent) {
    let groundDC = document.createElement('div');
    groundDC.id = 'ground-dc';
    groundDC.className = 'ground-dc hidden';

    addItem(groundDC, WeaponQuality.Q0)
    addItem(groundDC, WeaponQuality.Q1)
    addItem(groundDC, WeaponQuality.Q2)
    addItem(groundDC, WeaponQuality.Q3)
    addItem(groundDC, WeaponQuality.Q4)
    addItem(groundDC, WeaponQuality.Q5)
    addItem(groundDC, WeaponQuality.Q6)
    addItem(groundDC, WeaponQuality.Q7)

    parent.appendChild(groundDC);
  }

  function addItem(parent, weaponQuality) {
    let item = document.createElement('div');
    item.id = `item-${weaponQuality.firePower}`;
    item.className = 'item';
    const damage = damagePerHit(333245.47, 89, true, weaponQuality.firePower).toFixed(0)
    item.innerText = `Weapon ${weaponQuality.name}: ${damage}`;

    parent.appendChild(item);
  }

  function damagePerHit(strength, rank, isTopPlayer, firePower = 0) {
    // console.log(firePower);
    let damage = 10 * (1 + strength / 400) * (1 + rank / 5) * (1 + firePower / 100);
    if (isTopPlayer) {
      return damage + (damage * 0.1); // 10% bonus for top players
    }
    return damage;
  }

  function applyStyles() {
    let styles = document.createElement('style');
    styles.innerHTML = `
.profile-damage-calculator-wrapper {
  border: 1px solid black;
  width: 100%;
  min-height: 30px;
  height: fit-content;
  display: inline-block;
  margin-bottom: 10px;
}

.ground-dc {
  border: 1px solid red;
  height: fit-content;
}

.item {
  margin: 5px;
}

.hidden {
  display: none;
}

.show-calculator-btn {
  /*cursor: pointer;*/
  margin: 5px;
}
`;

    document.head.appendChild(styles);
  }

  setTimeout(() => {
    renderMainWrapper();
    applyStyles();
  }, 2000);
})();


