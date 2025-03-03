const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { MessageMedia } = require("whatsapp-web.js");
const { MEDIA_DIR, SENT_MESSAGES_FILE } = require("./consts.js");

function getClient() {
  return require("./script.js").client;
}

function delayRandom(min = 6000, max = 15000) {
  const range = max - min;
  const delay = min + Math.pow(Math.random(), 2) * range;
  console.log(`⏳ Waiting ${(delay / 1000).toFixed(2)} seconds...`);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMediaFiles() {
  const mediaFiles = fs.readdirSync(MEDIA_DIR);
  if (mediaFiles.length === 0) return [];

  return mediaFiles.map((file) => {
    const filePath = path.join(MEDIA_DIR, file);
    return MessageMedia.fromFilePath(filePath);
  });
}

function askQuestion(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function loadSentMessages() {
  if (fs.existsSync(SENT_MESSAGES_FILE)) {
    return JSON.parse(fs.readFileSync(SENT_MESSAGES_FILE, "utf-8"));
  }
  return [];
}

function saveSentMessages(messages) {
  fs.writeFileSync(SENT_MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

module.exports = {
  askQuestion,
  delayRandom,
  getMediaFiles,
  getRandomInt,
  getClient,
  loadSentMessages,
  saveSentMessages,
};
