// Dark Mode Toggle + Persistence
const darkToggle = document.getElementById('darkModeToggle');
const pageBody = document.getElementById('pageBody');

function applyTheme(isDark) {
  if (isDark) {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    pageBody.classList.remove('bg-light', 'text-dark');
    pageBody.classList.add('bg-dark', 'text-light');
    darkToggle.checked = true;
  } else {
    document.documentElement.setAttribute('data-bs-theme', 'light');
    pageBody.classList.remove('bg-dark', 'text-light');
    pageBody.classList.add('bg-light', 'text-dark');
    darkToggle.checked = false;
  }
  pageBody.classList.add('theme-transition');
  setTimeout(() => pageBody.classList.remove('theme-transition'), 500);
}

// On page load
const savedTheme = localStorage.getItem('darkMode');
applyTheme(savedTheme === 'true');

// Toggle dark mode
darkToggle.addEventListener('change', () => {
  const isDark = darkToggle.checked;
  applyTheme(isDark);
  localStorage.setItem('darkMode', isDark);
});

// IP Search Filter + Hide Overview/Health if Searching + No Results Message
const ipSearch = document.getElementById('ipSearch');
const globalStats = document.getElementById('globalStats');
const blacklistHealth = document.getElementById('blacklistHealth');

// Create "No Results" message
const noResultsMsg = document.createElement('div');
noResultsMsg.id = 'noResultsMsg';
noResultsMsg.className = 'alert alert-warning mt-3';
noResultsMsg.innerText = '🚫 No IPs match your search.';
noResultsMsg.style.display = 'none';
document.getElementById('ipAccordion').parentNode.insertBefore(noResultsMsg, document.getElementById('ipAccordion'));

ipSearch.addEventListener('input', () => {
  const filter = ipSearch.value.toLowerCase();
  let matchCount = 0;

  document.querySelectorAll('[data-ip]').forEach(item => {
    const ip = item.getAttribute('data-ip').toLowerCase();
    if (ip.includes(filter)) {
      item.style.display = '';
      matchCount++;
    } else {
      item.style.display = 'none';
    }
  });

  if (filter.length > 0) {
    globalStats.style.display = 'none';
    blacklistHealth.style.display = 'none';
  } else {
    globalStats.style.display = '';
    blacklistHealth.style.display = '';
  }

  if (filter.length > 0 && matchCount === 0) {
    noResultsMsg.style.display = 'block';
  } else {
    noResultsMsg.style.display = 'none';
  }
});

// Export to CSV
document.getElementById('exportCSV').addEventListener('click', () => {
  let csv = 'IP,Blacklist,Status,Last Checked\n';
  document.querySelectorAll('.accordion-item').forEach(item => {
    const ip = item.getAttribute('data-ip');
    const lastChecked = item.querySelector('.last-checked')?.innerText.trim() || 'Unknown';
    item.querySelectorAll('.list-group-item').forEach(row => {
      const label = row.querySelector('strong')?.innerText.trim() || 'Unknown';
      const status = row.querySelector('span')?.innerText.trim() || 'Unknown';
      csv += `${ip},"${label}",${status},"${lastChecked}"\n`;
    });
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'blacklist_export.csv';
  link.click();
});

// Global Stats
function updateGlobalStats() {
  const ips = document.querySelectorAll('.accordion-item');
  let totalIPs = ips.length;
  let listedIPs = 0;

  ips.forEach(item => {
    const badge = item.querySelector('.accordion-button .badge');
    if (badge && badge.innerText.trim() === 'LISTED') {
      listedIPs++;
    }
  });

  let percent = totalIPs > 0 ? ((listedIPs / totalIPs) * 100).toFixed(1) : 0;

  document.getElementById('globalStats').innerHTML = `
    <div class="alert alert-info">
      <strong>Tracked IPs:</strong> ${totalIPs} | 
      <strong>Blacklisted:</strong> ${listedIPs} (${percent}%)
    </div>
  `;
}

// Blacklist Health Table
function updateBlacklistHealth() {
  const counts = {};

  document.querySelectorAll('.accordion-item').forEach(item => {
    item.querySelectorAll('.list-group-item').forEach(row => {
      const label = row.querySelector('strong')?.innerText.trim();
      const status = row.querySelector('span')?.innerText.trim();
      if (!label) return;
      if (!counts[label]) counts[label] = { listed: 0, total: 0 };
      if (status === 'LISTED') counts[label].listed++;
      counts[label].total++;
    });
  });

  let html = '<h4>Blacklist Health Overview</h4><table class="table table-striped"><thead><tr><th>Blacklist</th><th>Listed</th><th>Total Checks</th></tr></thead><tbody>';

  Object.keys(counts).forEach(bl => {
    html += `<tr><td>${bl}</td><td>${counts[bl].listed}</td><td>${counts[bl].total}</td></tr>`;
  });

  html += '</tbody></table>';
  document.getElementById('blacklistHealth').innerHTML = html;
}

// Warn on stale IP checks (>24 hours)
function highlightStaleChecks() {
  const now = Date.now();
  document.querySelectorAll('.last-checked').forEach(el => {
    const timeStr = el.getAttribute('data-time');
    if (!timeStr) return;
    const lastCheckTime = new Date(timeStr).getTime();
    if (isNaN(lastCheckTime)) return;
    const hoursDiff = (now - lastCheckTime) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      el.classList.add('stale');
      el.innerHTML += ' ⚠️';
    }
  });
}

// Admin Token Handling
let adminToken = localStorage.getItem('adminToken') || '';

function promptAdminToken(defaultFieldId) {
  if (!adminToken) {
    const enteredToken = prompt('Enter Admin Token:');
    if (!enteredToken) {
      alert('Admin token is required.');
      return false;
    }
    adminToken = enteredToken;
    localStorage.setItem('adminToken', adminToken);
  }
  if (defaultFieldId) {
    document.getElementById(defaultFieldId).value = adminToken;
  }
  return true;
}

function openAddModal() {
  const modal = new bootstrap.Modal(document.getElementById('addIpModal'));
  
  // Autofill admin token if available
  const savedToken = localStorage.getItem('adminToken');
  if (savedToken) {
    document.getElementById('addIpToken').value = savedToken;
  }

  modal.show();
}

// Submit Add IP
function submitAddIp() {
  const ip = document.getElementById('addIpInput').value.trim();
  const token = document.getElementById('addIpToken').value.trim();

  if (!ip || !token) {
    alert('IP address and token are required.');
    return;
  }

  fetch('/add-ip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, token })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert('Error: ' + data.error);
    } else {
      alert(data.message);
      window.location.reload();
    }
  })
  .catch(err => {
    alert('Request failed.');
    console.error(err);
  });
}

// Open Remove IP Modal
function openRemoveModal(ip) {
  const modal = new bootstrap.Modal(document.getElementById('removeIpModal'));
  document.getElementById('removeIpInput').value = ip;

  // Autofill admin token if available
  const savedToken = localStorage.getItem('adminToken');
  if (savedToken) {
    document.getElementById('removeIpToken').value = savedToken;
  }

  modal.show();
}

// Submit Remove IP
function submitRemoveIp() {
  const ip = document.getElementById('removeIpInput').value.trim();
  const token = document.getElementById('removeIpToken').value.trim();

  if (!ip || !token) {
    alert('IP address and token are required.');
    return;
  }

  fetch('/remove-ip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, token })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert('Error: ' + data.error);
    } else {
      alert(data.message);
      window.location.reload();
    }
  })
  .catch(err => {
    alert('Request failed.');
    console.error(err);
  });
}

// Safe Auto Refresh (only if no accordion expanded)
setInterval(() => {
  const anyOpen = document.querySelector('.accordion-collapse.show');
  if (!anyOpen) {
    location.reload();
  }
}, 1800000); // 30 minutes

// Run everything on load
updateGlobalStats();
updateBlacklistHealth();
highlightStaleChecks();

// Optional: Auto-focus IP Search field on page load
ipSearch.focus();
