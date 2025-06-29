# MITPA Beta Bot — Discord Onboarding & Countdown System

> 🤖 Welcoming members and counting down to launch — professionally and privately.

## Overview

**MITPA Beta Bot** is a professional, elegant, and pre-launch Discord bot built for the **MITPA** community.  
It welcomes new members with a private onboarding message and keeps everyone informed with a real-time countdown to the official launch — all in beautifully designed embeds.

---

## 🌟 Purpose

- Professionally onboard new users joining the Discord server.
- Display a public, live countdown to the launch of **PRACTA**.
- Help build anticipation and engagement before the platform goes live.

---

## Features

### 🎉 Private Welcome System
- Sends a personalized embedded message directly to the new member.
- Ensures the welcome feels exclusive and user-focused.

### ⏳ Public Countdown
- Updates every minute with an elegant countdown embed.
- Visible to all members in a configured channel.

### 💬 Clean Embed Design
- All messages are sent in rich, well-styled embeds.
- Optimized for readability and professionalism.

---

## 🛠️ Tech Stack

- **Discord.js v14** — Powering interaction with the Discord API.
- **Node.js** — JavaScript runtime for the bot engine.
- **dotenv** — Secure environment variable management.
- **JSON Config** — Easy and clean configuration.

---

## 🔧 Setup & Usage

1. Clone this repository:
   ```bash
   git clone https://github.com/PRACTAcademy/bot-beta.git
   cd bot-beta

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment:

   * Create a `.env` file:

     ```env
     DISCORD_TOKEN=your-discord-bot-token
     ```
   * Set launch time and channel ID in `config.json`:

     ```json
     {
       "welcomeChannelId": "YOUR_CHANNEL_ID",
       "launchTimestamp": "2025-12-31T00:00:00Z"
     }
     ```

4. Run the bot:

   ```bash
   node src/index.js
   ```

---

## 🧱 Folder Structure

```
bot-beta/
├── src/
│   ├── events/               # Event listeners
│   │   ├── countdown.js      # Handles countdown updates
│   │   └── welcome.js        # Handles private welcome messages
│   ├── utils/                # Utility functions
│   │   └── createCountdownEmbed.js
│   └── index.js              # Main entry point
├── config.json               # Configuration file
├── .env                      # Secret token storage
├── .gitignore
├── package.json
├── LICENSE
├── README.md
```

---

## 🤝 Contributing

Want to improve the PRACTA Beta Bot? Feel free to collaborate:

1. Fork this repository.
2. Create a new branch: `git checkout -b feat-my-feature`.
3. Commit your changes: `git commit -m 'feat: add my feature'`.
4. Push your branch: `git push origin feat-my-feature`.
5. Open a Pull Request.

Enhancements to embed design, performance, or new event handling are welcome! 💜

---

## 📚 Documentation

* [Discord.js Docs](https://discord.js.org/#/docs)
* [Node.js Docs](https://nodejs.org/en/docs/)
* [dotenv Docs](https://www.npmjs.com/package/dotenv)

---

## 📡 Contact & Community

* 🌐 **Website:** [https://practa.tech](https://practa.tech)
* 💬 **Discord:** [PRACTA Community](https://practa.tech/discord)
* 💻 **GitHub:** [PRACTAcademy](https://github.com/PRACTAcademy)

---

## 📄 License

MIT — see the `LICENSE` file for more details.

---

> 🧠 PRACTA Beta Bot — Creating first impressions that matter.
 