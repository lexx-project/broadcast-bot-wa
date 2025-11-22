const { readStock } = require("../../utils/groupStock");
const { isOwner } = require("../../utils/ownerCheck");

module.exports = {
  name: "cekstock",
  category: "owner",
  description: "Melihat daftar stock link grup yang siap di-join.",
  aliases: ["stocklist"],

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

    const stock = readStock();
    if (!stock.length) {
      return client.sendMessage(
        msg.key.remoteJid,
        {
          text: "[ STOCK KOSONG ]\nBelum ada link grup yang tersimpan. Tambahkan dengan .addstock <link>.",
        },
        { quoted: msg }
      );
    }

    const list = stock
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.link} (code: ${item.code})`
      )
      .join("\n");

    return client.sendMessage(
      msg.key.remoteJid,
      {
        text: `[ STOCK GRUP ]\nTotal: ${stock.length} link\n\n${list}`,
      },
      { quoted: msg }
    );
  },
};
