require('dotenv').config();

const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');

const blacklists = [
  { domain: 'zen.spamhaus.org', type: 'critical' },
  { domain: 'cbl.abuseat.org', type: 'critical' },
  { domain: 'bl.spamcop.net', type: 'important' },
  { domain: 'b.barracudacentral.org', type: 'important' },
  { domain: 'dnsbl.sorbs.net', type: 'important' },
  { domain: 'psbl.surriel.com', type: 'standard' },
  { domain: 'fresh.spameatingmonkey.net', type: 'standard' },
  { domain: 'uribl.spameatingmonkey.net', type: 'standard' },
  { domain: 'hostkarma.junkemailfilter.com', type: 'standard' },
  { domain: 'dnsbl.protectedsky.com', type: 'standard' },
  { domain: 'ivmSIP24.emptyshell.net', type: 'standard' },
  { domain: 'dnsbl.dronebl.org', type: 'standard' },
  { domain: 'rbl.spamlab.com', type: 'standard' },
  { domain: 'spamrbl.imp.ch', type: 'standard' },
  { domain: 'dnsbl.inps.de', type: 'standard' },
  { domain: 'spam.spamrats.com', type: 'standard' },
  { domain: 'dyna.spamrats.com', type: 'standard' },
  { domain: 'noptr.spamrats.com', type: 'standard' }
];

function reverseIP(ip) {
  return ip.split('.').reverse().join('.');
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Load IPs from /data/ips.json
function loadIPs() {
  const filePath = path.join(__dirname, 'data', 'ips.json');
  const file = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(file);
}

// Check one IP against all blacklists
async function checkSingleIP(ip) {
  const reversedIP = reverseIP(ip);
  const results = [];

  for (const bl of blacklists) {
    const query = `${reversedIP}.${bl.domain}`;
    try {
      const response = await dns.resolve4(query);

      if (bl.type === 'critical' || bl.type === 'important') {
        if (response.some(addr => addr.startsWith('127.0.0.'))) {
          results.push({ blacklist: bl.domain, label: prettify(bl.domain), status: 'LISTED', type: bl.type });
        } else {
          results.push({ blacklist: bl.domain, label: prettify(bl.domain), status: 'CLEAN', type: bl.type });
        }
      } else {
        results.push({ blacklist: bl.domain, label: prettify(bl.domain), status: 'LISTED', type: bl.type });
      }
    } catch (err) {
      if (err.code === 'ENOTFOUND' || err.code === 'NXDOMAIN') {
        results.push({ blacklist: bl.domain, label: prettify(bl.domain), status: 'CLEAN', type: bl.type });
      } else {
        results.push({ blacklist: bl.domain, label: prettify(bl.domain), status: `ERROR: ${err.code}`, type: bl.type });
      }
    }
  }

  return results;
}

// Main batch processor
// Batch size can be modified, but do not exceed 1024 - adjust sleep time accordingly
const batchSizeSet = process.env.BATCH_SIZE || 256
let sleepTimeDynamicBase = 60 * 1000

const sleepTimeDynamic = Math.floor(batchSizeSet / 256) * sleepTimeDynamicBase

async function checkIPsInBatches(batchSize = batchSizeSet) {
  const ipList = loadIPs();
  const allResults = {};

  for (let i = 0; i < ipList.length; i += batchSize) {
    const batch = ipList.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ipList.length / batchSize)}...`);

    for (const ip of batch) {
      allResults[ip] = await checkSingleIP(ip);
    }

    if (i + batchSize < ipList.length) {
      console.log(`Waiting ${sleepTimeDynamic / 1000 / 60} minute(s) before next batch...`);
      await sleep(sleepTimeDynamic);
    }
  }

  return allResults;
}

// Helper to prettify blacklist names
function prettify(domain) {
  if (domain === 'zen.spamhaus.org') return 'Spamhaus ZEN';
  if (domain === 'cbl.abuseat.org') return 'Abuseat CBL';
  if (domain === 'bl.spamcop.net') return 'Spamcop';
  if (domain === 'b.barracudacentral.org') return 'Barracuda';
  if (domain === 'dnsbl.sorbs.net') return 'SORBS';
  if (domain === 'psbl.surriel.com') return 'PSBL';
  if (domain === 'fresh.spameatingmonkey.net') return 'SEM Fresh';
  if (domain === 'uribl.spameatingmonkey.net') return 'SEM URI';
  if (domain === 'hostkarma.junkemailfilter.com') return 'HostKarma';
  if (domain === 'dnsbl.protectedsky.com') return 'Protected Sky';
  if (domain === 'ivmSIP24.emptyshell.net') return 'IVM SIP24';
  if (domain === 'dnsbl.dronebl.org') return 'DroneBL';
  if (domain === 'rbl.spamlab.com') return 'SpamLab RBL';
  if (domain === 'spamrbl.imp.ch') return 'IMP SpamRBL';
  if (domain === 'dnsbl.inps.de') return 'INPS DNSBL';
  if (domain === 'spam.spamrats.com') return 'SpamRATS SPAM';
  if (domain === 'dyna.spamrats.com') return 'SpamRATS DYNA';
  if (domain === 'noptr.spamrats.com') return 'SpamRATS NOPTR';
  return domain;
}

module.exports = {
  checkIPsInBatches,
  checkSingleIP,
  loadIPs
};
