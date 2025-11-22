const { readStock, removeByCodes } = require("../../utils/groupStock");
const { isOwner } = require("../../utils/ownerCheck");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const inviteRegex = /chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i;

const extractCode = (link) => {
  const match = inviteRegex.exec(link);
  return match ? match[1] : null;
};

module.exports = {
  name: "startjoin",
  category: "owner",
  description:
    "Join ke semua link grup di stock dengan jeda acak 3-6 menit antar join.",
  aliases: [],

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
          text: "[ STOCK KOSONG ]\nTambahkan link terlebih dahulu dengan .addstock <link>.",
        },
        { quoted: msg }
      );
    }

    await client.sendMessage(
      msg.key.remoteJid,
      {
        text: `[ JOIN DIMULAI ]\nTotal link: ${stock.length}\nBot akan join dengan jeda acak 3-6 menit setelah setiap keberhasilan.`,
      },
      { quoted: msg }
    );

    let success = 0;
    let failed = 0;

    for (let idx = 0; idx < stock.length; idx++) {
      const item = stock[idx];
      const code = item.code || extractCode(item.link);

      if (!code) {
        failed++;
        console.log("Gagal join: Link tidak memiliki invite code.");
        await client.sendMessage(
          msg.key.remoteJid,
          {
            text: `[ GAGAL JOIN ]\nLink: ${item.link || "-"}\nError: Invite code tidak ditemukan pada link.`,
          },
          { quoted: msg }
        );
        continue;
      }

      try {
        await client.groupAcceptInvite(code);
        success++;
        console.log(`Berhasil join ke ${code}`);

        // Hapus dari stock jika sudah berhasil join
        removeByCodes([code]);

        const isLastItem = idx === stock.length - 1;
        if (!isLastItem) {
          const waitSeconds = 180 + Math.floor(Math.random() * 181);
          console.log(`Menunggu ${waitSeconds} detik sebelum lanjut...`);
          await delay(waitSeconds * 1000);
        }
      } catch (err) {
        failed++;
        console.log(`Gagal join: ${err.message}`);
        removeByCodes([code]);
        await client.sendMessage(
          msg.key.remoteJid,
          {
            text: `[ GAGAL JOIN ]\nLink: ${item.link}\nError: ${err.message}`,
          },
          { quoted: msg }
        );
      }
    }

    return client.sendMessage(
      msg.key.remoteJid,
      {
        text: `[ JOIN SELESAI ]\nBerhasil: ${success}\nGagal: ${failed}\nSisa stock: ${readStock().length}`,
      },
      { quoted: msg }
    );
  },
};
