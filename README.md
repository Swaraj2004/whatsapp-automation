# WhatsApp Automation Bot

**WhatsApp automation bot** built using `whatsapp-web.js` and `puppeteer`. It allows users to extract contacts and group details, send messages to contacts or groups from an Excel sheet, and perform various automation tasks while minimizing the risk of being banned.

## 🚀 Features

- ✅ Extract contacts and groups from WhatsApp
- ✅ Save extracted data into an Excel file
- ✅ Send messages to contacts or groups from an Excel sheet
- ✅ Support for sending media (images, videos, documents)
- ✅ Randomized delays to avoid detection
- ✅ Auto-reconnect on session loss

## 🛠️ Installation

### Prerequisites

- Node.js (>= 16)
- Google Chrome

### Steps

```sh
# Clone the repository
git clone https://github.com/Swaraj2004/whatsapp-automation.git
cd whatsapp-automation

# Install dependencies
npm install
```

## 🔧 Configuration

### 1️⃣ Update Constants

Edit the `consts.js` file to set paths and configurations:

```js
export const BASE_DIR = "./data";
export const MEDIA_DIR = "./media";
export const SESSION_PATH = "./session";
export const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
```

### 2️⃣ Running the Script

To start the bot, run:

```sh
node script.js
```

Scan the QR code with your **WhatsApp Web** to log in.
