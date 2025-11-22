const { readStock } = require("../../utils/groupStock");
const { isOwner } = require("../../utils/ownerCheck");

module.exports = {
  name: "totalstock",
  category: "owner",
  description: "Menampilkan jumlah stock link grup yang tersisa.",
  aliases: ["stockcount"],

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

    const total = readStock().length;

    return client.sendMessage(
      msg.key.remoteJid,
      {
        text: `[ TOTAL STOCK ]\nSisa link yang tersimpan: ${total}`,
      },
      { quoted: msg }
    );
  },
};
