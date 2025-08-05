import fs from 'fs'

import locations from './locations.js'

import { retrieveText, retrieveDocument, parseStatistics } from './utils/fetchUtils.js'
import { getDateForFileName } from './utils/dateUtils.js'

// Opća Bolnica Varaždin
let location = locations.find(location => location.name === 'Opća Bolnica Varaždin');
let document = await retrieveDocument(location.dataUrl);
document.querySelectorAll('div#supplies div.measure.one').forEach(groupDiv => {
    const type = groupDiv.querySelector('div.name').textContent.trim().replace('O-', '0-').replace('O+', '0+');
    const group = location.bloodGroups.find(group => group.type === type);
        
    group.highPercentage = parseInt(groupDiv.querySelector('div.top').getAttribute('style').match(/(\d+)/));
    group.lowPercentage = parseInt(groupDiv.querySelector('div.bottom').getAttribute('style').match(/(\d+)/));;
    group.amountPercentage = parseInt(groupDiv.querySelector('div.outer > div[data-percent]').getAttribute('data-percent'));
});

// KBC Split
location = locations.find(location => location.name === 'KBC Split');
document = await retrieveDocument(location.dataUrl);
document.querySelectorAll('div.bl-amount div.bl-group').forEach(groupDiv => {
    const type = groupDiv.querySelector('div.bl-type').textContent.trim().replace('O-', '0-').replace('O+', '0+');;
    const group = location.bloodGroups.find(group => group.type === type);

    group.highPercentage = parseInt(groupDiv.querySelector('div.bl-upper').getAttribute('style').match(/(\d+)/));
    group.lowPercentage = parseInt(groupDiv.querySelector('div.bl-lower').getAttribute('style').match(/(\d+)/));
    group.amountPercentage = parseInt(groupDiv.querySelector('div.bl-level > div[data-percent]').getAttribute('data-percent'));
});

// KBC Rijeka
location = locations.find(location => location.name === 'KBC Rijeka');
document = await retrieveDocument(location.dataUrl);
document.querySelectorAll('div#supplies div.measure.one').forEach(groupDiv => {
    const type = groupDiv.querySelector('div.name').textContent.trim().replace('O-', '0-').replace('O+', '0+');;
    const group = location.bloodGroups.find(group => group.type === type);

    group.highPercentage = parseInt(groupDiv.querySelector('div.top').getAttribute('style').match(/(\d+)/));
    group.lowPercentage = parseInt(groupDiv.querySelector('div.bottom').getAttribute('style').match(/(\d+)/));
    group.amountPercentage = parseInt(groupDiv.querySelector('div.outer > div[data-percent]').getAttribute('data-percent'));
});

// ===== KBC Osijek =====
location = locations.find(location => location.name === 'KBC Osijek');
document = await retrieveDocument(location.dataUrl);
// Config is defined in a script app, so we need to extract it
let groupsConfigCode = (await retrieveText('https://www.kbco.hr/wp-content/themes/kbcosijek/dist/js/app.js'))
    .split('var bloodLevels =')[1]
    .split('function startRender()')[0]
    .replaceAll('minus', '-').replaceAll('plus', '+').replaceAll('O', '0')
    .replace('var bloodLevels =', 'return');
let groupsConfig = new Function('return' + groupsConfigCode)();
let currentStatistics = await parseStatistics(`https://www.kbco.hr/wp-content/krvstats/${getDateForFileName()}.html`);
document.querySelectorAll('div#supplies div.measure').forEach(groupDiv => {
    const type = groupDiv.querySelector('div.name').textContent.trim();
    const group = location.bloodGroups.find(group => group.type === type);
    const groupConfig = groupsConfig[type];
    
    group.max = groupConfig.full;
    group.high = groupConfig.optMax;
    group.highPercentage = parseInt(group.high / group.max * 100);
    group.low = groupConfig.optMin;
    group.lowPercentage = parseInt(group.low / group.max * 100);
    group.amount = currentStatistics.find(data => data.type === type).amount;
    group.amountPercentage = parseInt(group.amount / group.max * 100);
});

// ===== Opća Bolnica Zadar =====
location = locations.find(location => location.name === 'Opća Bolnica Zadar');
document = await retrieveDocument(location.dataUrl);
// Config is defined in a script tag, so we need to extract it
groupsConfigCode = document.querySelector('div.custom_js script') 
    .innerText.split('function calculateHeight')[0]
    .replaceAll('document.getElementById', '')
    .replace('O+', '0+').replace('O-', '0-')
    .replace('const groups = ', 'return');
groupsConfig = new Function(groupsConfigCode)();
currentStatistics = await parseStatistics('https://www.bolnica-zadar.hr/doze/blood_data.html');
document.querySelectorAll('div.eprueta').forEach(groupDiv => {
    const item = groupDiv.querySelector('div.eprueta-blood.animate-blood');
    const name = item.getAttribute('id');
    const type = name.replace('minus', '-').replace('plus', '+').replace('zero', '0').toUpperCase();
    const group = location.bloodGroups.find(group => group.type === type);
    const groupConfig = groupsConfig[type];

    const level = parseInt(item.getAttribute('style')?.match(/(\d+)/)); // missing, generated by JS
    
    group.max = groupConfig.max;
    group.high = groupConfig.tline;
    group.highPercentage = parseInt(group.high / group.max * 100);
    group.low = groupConfig.bline;
    group.lowPercentage = parseInt(group.low / group.max * 100);
    group.amount = currentStatistics.find(data => data.type === type).amount;
    group.amountPercentage = parseInt(group.amount / group.max * 100);
});

// Hrvatski zavod za transfuzijsku medicinu
location = locations.find(location => location.name === 'Hrvatski zavod za transfuzijsku medicinu');
document = await retrieveDocument(location.dataUrl);
// Config is defined in a script tag, so we need to extract it
groupsConfigCode = document.innerText.split('const groups =')[1]
    .split('const empty = 25;')[0]
    .replaceAll('document.getElementById', '')
    .replace('O+', '0+').replace('O-', '0-');
groupsConfig = new Function('return' + groupsConfigCode)();

currentStatistics = await parseStatistics('https://hztm.hr/doze/blood_data.html');
document.querySelectorAll('div.eprueta').forEach(groupDiv => {
    const item = groupDiv.querySelector('div.eprueta-blood.animate-blood');
    const name = item.getAttribute('id');
    const type = name.replace('minus', '-').replace('plus', '+').replace('zero', '0').toUpperCase();
    const group = location.bloodGroups.find(group => group.type === type);
    const groupConfig = groupsConfig[type];
    
    group.max = Math.max(groupConfig.max, groupConfig.full); // Ensure max is the highest value
    group.high = Math.min(groupConfig.max, groupConfig.full); // Ensure high is not above max
    group.highPercentage = parseInt(group.high / group.max * 100);
    group.low = parseInt(group.max * 0.15); // Set low to 15% of max due to missing data
    group.lowPercentage = parseInt(group.low / group.max * 100);
    group.amount = currentStatistics.find(data => data.type === type).amount;
    group.amountPercentage = parseInt(group.amount / group.max * 100);
});

// Timestamp is not used for filename as we are creating static file every day
fs.writeFileSync(`../public/data.json`, JSON.stringify({
    updated: Date.now(),
    locations: locations
}, null, 2), 'utf-8');
console.log(`Data successfully scraped and saved to public/data.json`);
