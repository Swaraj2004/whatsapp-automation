const path = require("path");

// Define base directory for storing data
const DATA_FOLDER = "whatsapp-automator-data";
const BASE_DIR = path.join(process.cwd(), DATA_FOLDER);
const SESSION_PATH = path.join(BASE_DIR, "session");
const MEDIA_DIR = path.join(BASE_DIR, "media");
const SENT_MESSAGES_FILE = path.join(BASE_DIR, "sent_messages.json");

// Define absolute paths for files
const MESSAGE_FILE = path.join(BASE_DIR, "message.txt");
const GROUPS_FILE = path.join(BASE_DIR, "groups.xlsx");
const CONTACTS_FILE = path.join(BASE_DIR, "contacts.xlsx");
const GROUP_CONTACTS_FILE = path.join(BASE_DIR, "group_contacts.xlsx");
const MULTIPLE_GROUP_CONTACTS_FILE = path.join(
  BASE_DIR,
  "multiple_group_contacts.xlsx"
);
const CHROME_PATH =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

module.exports = {
  DATA_FOLDER,
  BASE_DIR,
  SESSION_PATH,
  MEDIA_DIR,
  SENT_MESSAGES_FILE,
  MESSAGE_FILE,
  GROUPS_FILE,
  CONTACTS_FILE,
  GROUP_CONTACTS_FILE,
  MULTIPLE_GROUP_CONTACTS_FILE,
  CHROME_PATH,
};
