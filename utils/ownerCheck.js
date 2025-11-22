const settings = require("../settings");

// Returns true when the message is from the configured owner or sent by the bot itself.
const isOwner = (msg) => {
  if (msg?.key?.fromMe) return true;

  const remoteJid = msg?.key?.remoteJid || "";
  const senderJid = remoteJid.endsWith("@g.us")
    ? msg?.key?.participant
    : remoteJid;

  if (!senderJid) return false;

  const senderNumber = senderJid.split("@")[0];
  return senderNumber === settings.ownerNumber;
};

module.exports = { isOwner };
