const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chalk = require('chalk');

console.log(chalk.blueBright('--- Starting setup process ---'));

// Step 1: Create /data folder
const dataPath = path.join(__dirname, 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath);
  console.log(chalk.blue('[INFO] Created /data directory.'));
} else {
  console.log(chalk.blue('[INFO] /data directory already exists.'));
}

// Step 2: Set port from CLI args
const portArg = process.argv[2];
const port = portArg && !isNaN(portArg) ? portArg : '3000';

if (!portArg) {
  console.log(chalk.yellow('[WARN] No port specified, defaulting to 3000.'));
} else {
  console.log(chalk.blue(`[INFO] Using specified port: ${port}`));
}

// Step 3: Generate admin token
const adminToken = crypto.randomBytes(24).toString('hex');
console.log(chalk.blue('[INFO] Generated secure admin token.'));

// Step 4: Write .env file
const envPath = path.join(__dirname, '.env');
const envContent = `PORT=${port}
ADMIN_TOKEN=${adminToken}
BATCH_LIMIT=256
CRON_HOUR=3
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log(chalk.green('[SUCCESS] .env file created.'));
} catch (err) {
  console.error(chalk.red('[ERROR] Failed to create .env file.'));
  console.error(err);
  process.exit(1);
}

// Step 5: Write lastChecked.json
const lastCheckedPath = path.join(dataPath, 'lastChecked.json');
try {
  fs.writeFileSync(lastCheckedPath, JSON.stringify({}, null, 2));
  console.log(chalk.green('[SUCCESS] data/lastChecked.json initialized.'));
} catch (err) {
  console.error(chalk.red('[ERROR] Failed to create lastChecked.json.'));
  console.error(err);
  process.exit(1);
}

// Step 6: Write ips.json with demo IPs
const ipsPath = path.join(dataPath, 'ips.json');
const demoIPs = [
  "8.8.8.8",
  "1.1.1.1",
  "208.67.222.222",
  "4.2.2.1",
  "9.9.9.9",
  "127.0.0.2"
];
try {
  fs.writeFileSync(ipsPath, JSON.stringify(demoIPs, null, 2));
  console.log(chalk.green('[SUCCESS] data/ips.json created with demo IPs.'));
} catch (err) {
  console.error(chalk.red('[ERROR] Failed to create ips.json.'));
  console.error(err);
  process.exit(1);
}

// Step 7: Confirm setup complete
console.log(chalk.greenBright('✅ Setup complete.'));
console.log(chalk.cyan('⚡ Please now run: npm start or manually start the server.'));

// Step 8: Self-delete setup.js
try {
  fs.unlinkSync(__filename);
  console.log(chalk.magenta('[CLEANUP] setup.js deleted itself.'));
} catch (err) {
  console.error(chalk.red('[ERROR] Failed to delete setup.js automatically.'));
  console.error(err);
}
