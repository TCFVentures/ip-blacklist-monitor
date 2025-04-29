require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const bodyParser = require('body-parser');

const { checkIPsInBatches, loadIPs, checkSingleIP } = require('./blacklistChecker');

const app = express();
const port = process.env.PORT || 3000;

let ipResults = {};
let lastChecked = {};

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Load last checked timestamps
function loadLastChecked() {
  if (fs.existsSync('data/lastChecked.json')) {
    const data = fs.readFileSync('data/lastChecked.json');
    lastChecked = JSON.parse(data);
    console.log(chalk.blue(`[INFO] Last checked timestamps loaded.`));
  }
}

// Save last checked timestamps
function saveLastChecked() {
  fs.writeFileSync('data/lastChecked.json', JSON.stringify(lastChecked, null, 2));
  console.log(chalk.blue(`[INFO] Last checked timestamps saved.`));
}

// Update timestamp for an IP
function updateLastChecked(ip) {
  lastChecked[ip] = new Date().toISOString();
  saveLastChecked();
}

// Validate IPv4
function isValidIPv4(ip) {
  const regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  return regex.test(ip);
}

// Save IPs
function saveIPs(ips) {
  fs.writeFileSync('data/ips.json', JSON.stringify(ips, null, 2));
  console.log(chalk.blue('[INFO] Saved updated IP list to ips.json.'));
}

// Scheduled IP blacklist checks
async function runAllChecks() {
  console.log(chalk.cyan(`[${new Date().toISOString()}] [INFO] Starting scheduled blacklist checks...`));
  
  const ips = loadIPs();
  const batchResults = await checkIPsInBatches(256);

  for (const ip of ips) {
    ipResults[ip] = batchResults[ip];
    updateLastChecked(ip);
  }

  console.log(chalk.green(`[${new Date().toISOString()}] [SUCCESS] Blacklist checks completed.`));
}

// CRON Job: daily at 3AM
cron.schedule('0 3 * * *', async () => {
  console.log(chalk.magenta(`[SCHEDULED] Running daily blacklist checks...`));
  await runAllChecks();
});

// Web Routes
app.get('/', (req, res) => {
  res.render('index', { ipResults, lastChecked });
});

app.get('/manual-check', async (req, res) => {
  const ip = req.query.ip;
  if (!ip) {
    console.error(chalk.red(`[ERROR] Manual check failed: Missing IP parameter.`));
    return res.status(400).send('Missing IP parameter.');
  }

  const results = await checkSingleIP(ip);
  ipResults[ip] = results;
  updateLastChecked(ip);

  console.log(chalk.yellow(`[MANUAL] Rechecked IP: ${ip}`));
  res.redirect('/');
});

// API Routes

// POST /add-ip
app.post('/add-ip', (req, res) => {
  const { ip, token } = req.body;

  if (!ip || !token) {
    console.error(chalk.red('[ERROR] Missing IP or token in request.'));
    return res.status(400).json({ error: 'Missing IP or token.' });
  }

  if (token !== process.env.ADMIN_TOKEN) {
    console.warn(chalk.red('[SECURITY] Invalid admin token provided.'));
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  if (!isValidIPv4(ip)) {
    console.error(chalk.red('[ERROR] Invalid IPv4 address format.'));
    return res.status(400).json({ error: 'Invalid IPv4 address.' });
  }

  const ips = loadIPs();
  if (ips.includes(ip)) {
    return res.status(409).json({ error: 'IP already exists.' });
  }

  ips.push(ip);
  saveIPs(ips);
  console.log(chalk.green(`[SUCCESS] Added new IP: ${ip}`));

  // Update memory for frontend
  ipResults[ip] = []; // No checks yet
  lastChecked[ip] = null;
  saveLastChecked();

  res.json({ message: `IP ${ip} added successfully.` });
});

// POST /remove-ip
app.post('/remove-ip', (req, res) => {
  const { ip, token } = req.body;

  if (!ip || !token) {
    console.error(chalk.red('[ERROR] Missing IP or token in request.'));
    return res.status(400).json({ error: 'Missing IP or token.' });
  }

  if (token !== process.env.ADMIN_TOKEN) {
    console.warn(chalk.red('[SECURITY] Invalid admin token provided.'));
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  if (!isValidIPv4(ip)) {
    console.error(chalk.red('[ERROR] Invalid IPv4 address format.'));
    return res.status(400).json({ error: 'Invalid IPv4 address.' });
  }

  let ips = loadIPs();
  if (!ips.includes(ip)) {
    return res.status(404).json({ error: 'IP not found.' });
  }

  ips = ips.filter(existingIP => existingIP !== ip);
  saveIPs(ips);
  console.log(chalk.green(`[SUCCESS] Removed IP: ${ip}`));

  // Update memory for frontend
  delete ipResults[ip];
  delete lastChecked[ip];
  saveLastChecked();

  res.json({ message: `IP ${ip} removed successfully.` });
});

// Start server
app.listen(port, () => {
  console.log(chalk.greenBright(`[READY] Blacklist Monitor running at http://localhost:${port}`));

  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
    console.log(chalk.blue('[INFO] /data folder (re)created.'));
  }

  loadLastChecked();
  runAllChecks();
});
