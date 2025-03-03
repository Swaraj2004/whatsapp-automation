const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { askQuestion } = require("./utils.js");
const {
  BASE_DIR,
  CHROME_PATH,
  CONTACTS_FILE,
  GROUPS_FILE,
  MEDIA_DIR,
  SESSION_PATH,
} = require("./consts.js");
const {
  getContactsFromMultipleGroups,
  getGroupContacts,
  logout,
  saveContactsToExcel,
  saveGroupsToExcel,
  sendMessagesFromExcel,
  deleteSentMessages,
} = require("./controllers.js");

// Ensure the directorys exists
if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR);
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR);

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: SESSION_PATH }),
  puppeteer: {
    executablePath: CHROME_PATH,
    headless: false,
  },
});

client.on("qr", (qr) => {
  console.log("Scan this QR code with WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("✅ Client is ready!");

  while (true) {
    const action = await askQuestion(
      "\nChoose an option:\n" +
        "1. Save Contacts Data to Excel\n" +
        "2. Save Groups Data to Excel\n" +
        "3. Get Contacts from a Specific Group\n" +
        "4. Get Contacts from Multiple Groups\n" +
        "5. Send Messages / Media to Contacts from Excel\n" +
        "6. Send Messages / Media to Groups from Excel\n" +
        "7. Delete Last Sent Messages (Delete for Everyone)\n" +
        "8. Logout\n" +
        "9. Exit\n\n" +
        "Enter your choice (1-9): "
    );

    if (action === "1") await saveContactsToExcel();
    else if (action === "2") await saveGroupsToExcel();
    else if (action === "3") await getGroupContacts();
    else if (action === "4") await getContactsFromMultipleGroups();
    else if (action === "5")
      await sendMessagesFromExcel(CONTACTS_FILE, "user_id");
    else if (action === "6")
      await sendMessagesFromExcel(GROUPS_FILE, "group_id");
    else if (action === "7") await deleteSentMessages();
    else if (action === "8") await logout();
    else if (action === "9") {
      console.log("👋 Exiting...");
      process.exit();
    } else console.log("❌ Invalid choice! Please try again.");
  }
});

client.initialize();

module.exports = { client };
