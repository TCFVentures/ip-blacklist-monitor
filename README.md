<p align="center">
  <img src="https://tcf-ventures.b-cdn.net/branding/banners/StatusZERO.png" alt="StatusZero" />
</p>

<p align="center">
  <a href="https://github.com/TCFVentures/status-zero">
    <img alt="Maintenance" src="https://img.shields.io/maintenance/yes/2025?style=for-the-badge&color=lightgreen">
  </a>
  <a href="https://github.com/TCFVentures/status-zero/stargazers">
    <img src="https://img.shields.io/github/stars/TCFVentures/status-zero?style=for-the-badge" alt="Stars">
  </a>
  <a href="https://github.com/TCFVentures/status-zero/issues">
    <img src="https://img.shields.io/github/issues/TCFVentures/status-zero?style=for-the-badge" alt="Issues">
  </a>
  <a href="https://github.com/TCFVentures/status-zero/license">
    <img alt="Static Badge" src="https://img.shields.io/badge/license-CC--BY--4.0-blue?style=for-the-badge">
  </a>
</p>

<p align="center"><em>"See your IPs as the world sees them."</em></p>

---

# 🚀 Philosophy

**StatusZero** was built from a simple but important belief: IP reputation monitoring should be **fast, lightweight, fully self-hosted, and free of SaaS dependency**. 

There are dozens of DNS-based blacklists that matter, yet few tools exist to monitor them efficiently without paying for external services, relying on unreliable APIs, or bloating your stack with heavy frameworks.

StatusZero bridges that gap — a sleek, no-nonsense dashboard that gives you control of your IP health at a glance.

---

# 🌐 Features

- 🔍 **Fast IP Search** and instant filtering
- 📊 **Clear Status Summary**: Listed, Clean, or Error
- 🔁 **Manual Re-checks** with zero reliance on external APIs
- 🛡️ **Fully DNS-Based** — No API keys required
- 🌎 **18 Supported DNSBL/RBL Providers**
- ➕ **On-demand IP Adding and Removal** from the web UI
- 🛑 **Batch Checking** to protect DNS servers and prevent overload
- 💾 **Export to CSV** for reports or audits
- 🌙 **Dark Mode Ready** with smooth persistence
- 🔐 **Token-protected IP Management** for security
- ⚡ **Minimal, Responsive UI** powered by Bootstrap 5

---

# 🛠️ Tech Stack

- Node.js (Express backend)
- EJS Templates
- Bootstrap 5
- Vanilla JavaScript

---

# 📦 Installation

```bash
git clone https://github.com/TCFVentures/status-zero.git
cd status-zero
npm run setup [PORT]    # Optional: specify a port, defaults to 3000
npm run start          # Start the application
```

Then open [http://localhost:PORT](http://localhost:PORT) in your browser!

---

# ⚙️ Configuration

You can customize the environment using a `.env` file or system variables:

| Variable              | Default    | Description                              |
|----------------------|------------|------------------------------------------|
| `PORT`               | `3000`     | Port to run the web UI                   |
| `ADMIN_TOKEN`        | (required) | Token required to add/remove IPs         |

---

# 🧪 Dashboard Preview

<p align="center">
  <img src="https://tcf-ventures.b-cdn.net/blob/img/.demo/statusZERO-dashboard-1.png" alt="StatusZero Dashboard Screenshot 1" />
  <img src="https://tcf-ventures.b-cdn.net/blob/img/.demo/statusZERO-dashboard-2.png" alt="StatusZero Dashboard Screenshot 2" />
</p>

> **Live Demo:** [demo.statuszero.org](https://demo.statuszero.org)


---

# 🛡️ Usage Scenarios

- **Mail Server Operators**: Ensure outbound IPs are not blacklisted before major email campaigns.
- **Proxy Providers**: Proactively detect IP reputation issues to protect customer experience.
- **Network Admins**: Monitor public-facing nodes for sudden blacklisting.
- **Hosting Companies**: Keep VPS and shared hosting environments clear of reputation penalties.
- **Security Teams**: Watch for signs of compromise or abuse leading to blacklisting.

---

# ⚠️ Important Disclaimer

**Batch Checking** is implemented with safety defaults to prevent overwhelming DNS servers. 

While you may adjust batching parameters inside the code, doing so is **at your own risk**. Excessively aggressive settings could cause query failures, bans from DNSBL services, or denial of service. Modify carefully.

---

# ✨ Feature Requests

We are open to new ideas! Feel free to [open an issue](https://github.com/TCFVentures/status-zero/issues) if you have feature suggestions or enhancements you'd like to see in future versions of StatusZero.

---

# 🖼️ Branding

<p align="center">
  <img src="https://tcf-ventures.b-cdn.net/branding/banners/StatusZERO.png" alt="StatusZero Logo" height="150"/>
</p>

Logo assets and branding may only be used as shipped in the source code. 

---

# 📄 License

This project is licensed under  
**Creative Commons Attribution 4.0 International (CC-BY-4.0)**.  
You are free to use, modify, and share it — just give appropriate credit.

[View Full License](https://github.com/TCFVentures/status-zero/blob/main/LICENSE)

---

# ❤️ Credits

Built by dreamers, developers, and defenders of clean IPs.  
**[TCF Ventures LLC](https://tcf.ventures)**

_"Built for those who believe infrastructure deserves simplicity and transparency."_

---
