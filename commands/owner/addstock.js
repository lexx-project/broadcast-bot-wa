const { addInvitesToStock } = require("../../utils/groupStock");
const { isOwner } = require("../../utils/ownerCheck");

const inviteRegex = /https?:\/\/chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/gi;

module.exports = {
  name: "addstock",
  category: "owner",
  description: "Menambah stock link grup yang akan di-join otomatis.",
  aliases: ["stock"],

  /**
   * @param {WAClient} client
   * @param {Object} msg
   * @param {string[]} args
   */
  run: async (client, msg, args) => {
    if (!isOwner(msg)) {
      return client.sendMessage(
        msg.key.remoteJid,
        {
          text: "[ AKSES DITOLAK ]\nCommand ini hanya bisa digunakan oleh Owner Bot.",
        },
        { quoted: msg }
      );
    }

    const rawText = args.join(" ");
    if (!rawText) {
      return client.sendMessage(
        msg.key.remoteJid,
        {
          text:
            "[ FORMAT SALAH ]\nMasukkan link grup yang ingin ditambahkan.\n\nContoh:\n.addstock https://chat.whatsapp.com/CUTYdNJOAtVBs3ARMKoSqo?mode=wwt\nhttps://chat.whatsapp.com/KRYu3DtSsedBuBBLfGpzp1?mode=wwt",
        },
        { quoted: msg }
      );
    }

    const invites = [];
    let match;
    inviteRegex.lastIndex = 0;
    while ((match = inviteRegex.exec(rawText)) !== null) {
      const code = match[1];
      invites.push({ code });
    }

    if (invites.length === 0) {
      return client.sendMessage(
        msg.key.remoteJid,
        {
          text:
            "[ TIDAK ADA LINK VALID ]\nGunakan format link WhatsApp seperti https://chat.whatsapp.com/XXXXXXXX untuk menambah stock.",
        },
        { quoted: msg }
      );
    }

    const uniqueInvites = [];
    const seen = new Set();
    for (const invite of invites) {
      if (!seen.has(invite.code)) {
        seen.add(invite.code);
        uniqueInvites.push(invite);
      }
    }

    const { added, skipped, total } = addInvitesToStock(uniqueInvites);

    return client.sendMessage(
      msg.key.remoteJid,
      {
        text: `[ STOCK DITAMBAHKAN ]\nBerhasil: ${added}\nDuplikat dilewati: ${skipped}\nTotal stock sekarang: ${total}`,
      },
      { quoted: msg }
    );
  },
};
