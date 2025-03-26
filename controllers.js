const fs = require("fs");
const xlsx = require("xlsx");
const {
  askQuestion,
  delayRandom,
  getRandomInt,
  getMediaFiles,
  getClient,
  saveSentMessages,
  loadSentMessages,
} = require("./utils.js");

const {
  CONTACTS_FILE,
  DATA_FOLDER,
  GROUP_CONTACTS_FILE,
  GROUPS_FILE,
  MESSAGE_FILE,
  MULTIPLE_GROUP_CONTACTS_FILE,
  SESSION_PATH,
} = require("./consts.js");

async function saveGroupsToExcel() {
  const chats = await getClient().getChats();
  const groups = [];

  for (const chat of chats) {
    if (chat.isGroup) {
      let inviteLink = "N/A";

      try {
        inviteLink = chat.groupMetadata.announce
          ? "N/A"
          : `https://chat.whatsapp.com/${await chat.getInviteCode()}`;
      } catch (error) {
        console.log(
          `⚠️ Failed to get invite link for ${chat.name}: ${error.message}`
        );
      }

      groups.push({
        name: chat.name,
        group_id: chat.id._serialized,
        invite_link: inviteLink,
        admin_only: chat.groupMetadata.announce,
        total_members: chat.groupMetadata.participants.length,
      });

      await delayRandom();
    }
  }

  if (groups.length === 0) {
    console.log("❌ No groups found!");
    return;
  }

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(groups);
  xlsx.utils.book_append_sheet(workbook, worksheet, "Groups");

  xlsx.writeFile(workbook, GROUPS_FILE);
  console.log("✅ Groups saved to 'groups.xlsx'");
}

async function saveContactsToExcel() {
  const chats = await getClient().getChats();
  const contacts = chats
    .filter((chat) => !chat.isGroup)
    .map((chat) => ({
      user_id: chat.id._serialized,
      name: chat.name || "Unknown",
      number: chat.id.user,
    }));

  if (contacts.length === 0) {
    console.log("❌ No contacts found!");
    return;
  }

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(contacts);
  xlsx.utils.book_append_sheet(workbook, worksheet, "Contacts");

  xlsx.writeFile(workbook, CONTACTS_FILE);
  console.log("✅ Contacts saved to 'contacts.xlsx'");
}

async function getGroupContacts() {
  const groupId = await askQuestion("Enter the group ID: ");
  const chat = await getClient()
    .getChatById(groupId)
    .catch(() => null);

  if (!chat || !chat.isGroup) {
    console.log("❌ Group not found! Please enter a valid group ID.");
    return;
  }

  const participants = chat.groupMetadata.participants.map((participant) => ({
    user_id: participant.id._serialized,
    number: participant.id.user,
  }));

  if (participants.length === 0) {
    console.log("❌ No contacts found in this group!");
    return;
  }

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(participants);
  xlsx.utils.book_append_sheet(workbook, worksheet, "Group Contacts");

  xlsx.writeFile(workbook, GROUP_CONTACTS_FILE);
  console.log(
    `✅ Contacts from group '${chat.name}' saved to 'group_contacts.xlsx'`
  );
}

async function getContactsFromMultipleGroups() {
  if (!fs.existsSync(GROUPS_FILE)) {
    console.log("❌ groups.xlsx not found!");
    return;
  }

  const workbook = xlsx.readFile(GROUPS_FILE);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const groups = xlsx.utils.sheet_to_json(sheet);

  let allContacts = [];

  for (const group of groups) {
    if (!group.group_id) continue;

    const chat = await getClient().getChatById(group.group_id);
    if (!chat.isGroup) continue;

    console.log(
      `📥 Fetching contacts from ${group.name} (${group.group_id})...`
    );

    const participants = chat.participants.map((p) => ({
      group_id: group.group_id,
      user_id: p.id._serialized,
      number: p.id.user,
    }));

    await delayRandom(10000, 20000);

    allContacts.push(...participants);
  }

  if (allContacts.length === 0) {
    console.log("❌ No contacts found in the groups.");
    return;
  }

  const newWorkbook = xlsx.utils.book_new();
  const newSheet = xlsx.utils.json_to_sheet(allContacts);
  xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Contacts");

  xlsx.writeFile(newWorkbook, MULTIPLE_GROUP_CONTACTS_FILE);
  console.log(`✅ Contacts saved to ${MULTIPLE_GROUP_CONTACTS_FILE}`);
}

async function sendMessagesFromExcel(fileName, idColumn) {
  if (!fs.existsSync(fileName)) {
    console.log(
      `❌ '${fileName}' not found! Please run the save option first.`
    );
    return;
  }

  if (!fs.existsSync(MESSAGE_FILE)) {
    console.log(
      `❌ 'message.txt' not found! Create this file in '${DATA_FOLDER}' directory.`
    );
    return;
  }

  const workbook = xlsx.readFile(fileName);
  const sheetName = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];
  const entries = xlsx.utils.sheet_to_json(sheet);

  const message = fs.readFileSync(MESSAGE_FILE, "utf-8").trim();
  const mediaFiles = getMediaFiles();

  const sentMessages = [];
  saveSentMessages(sentMessages);

  let sentCount = 0; // Track sent messages

  for (const entry of entries) {
    if (entry.hasOwnProperty("admin_only") && entry.admin_only === true) {
      console.log(`⚠️ Skipping non-admin entry: ${entry.name}`);
      continue;
    }

    try {
      if (message) {
        const sentMsg = await getClient().sendMessage(entry[idColumn], message);
        console.log(`✅ Message sent to '${entry.name}'`);

        sentMessages.push({
          chatId: entry[idColumn],
          msgId: sentMsg.id._serialized,
        });
        saveSentMessages(sentMessages);
        await delayRandom();
      }

      for (const media of mediaFiles) {
        console.log(`🖼️ Sending media: ${media.filename} to ${entry.name}`);
        const sentMedia = await getClient().sendMessage(entry[idColumn], media);

        sentMessages.push({
          chatId: entry[idColumn],
          msgId: sentMedia.id._serialized,
        });
        saveSentMessages(sentMessages);
        await delayRandom();
      }

      sentCount++; // Increment count

      // Introduce a long delay every 10-20 messages
      if (sentCount % getRandomInt(10, 20) === 0) {
        console.log("⏳ Taking a longer break to avoid detection...");
        await delayRandom(15000, 30000); // 15 to 30 seconds
      }
    } catch (error) {
      console.log(
        `❌ Failed to send message to '${entry.name}': ${error.message}`
      );
    }
  }
}

async function deleteSentMessages() {
  let sentMessages = loadSentMessages();

  if (sentMessages.length === 0) {
    console.log("❌ No messages to delete!");
    return;
  }

  for (const { chatId, msgId } of sentMessages) {
    try {
      const chat = await getClient().getChatById(chatId);
      await delayRandom(2000, 5000);
      const messages = await chat.fetchMessages({ limit: 50 });

      const messageToDelete = messages.find(
        (msg) => msg.id._serialized === msgId
      );

      if (messageToDelete) {
        await messageToDelete.delete(true);
        console.log(`🗑️ Deleted message in ${chatId}`);
      } else {
        console.log(
          `⚠️ Message ${msgId} not found in ${chatId}, might be too old.`
        );
      }
      await delayRandom();
    } catch (error) {
      console.log(`❌ Failed to delete message in ${chatId}: ${error.message}`);
    }
  }

  sentMessages = [];
  saveSentMessages(sentMessages);
}

async function logout() {
  console.log("⚠️ Logging out...");

  try {
    await getClient().logout();
    console.log("✅ Logged out successfully!");
  } catch (error) {
    console.log("❌ Logout failed, manually clearing session...");
  }

  if (fs.existsSync(SESSION_PATH)) {
    fs.rmSync(SESSION_PATH, { recursive: true, force: true });
    console.log("🗑️ Session cleared! Restart the app to scan a new QR code.");
  }

  process.exit();
}

module.exports = {
  saveGroupsToExcel,
  saveContactsToExcel,
  getGroupContacts,
  getContactsFromMultipleGroups,
  sendMessagesFromExcel,
  deleteSentMessages,
  logout,
};
