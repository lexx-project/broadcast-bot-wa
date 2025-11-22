const settings = require("../../settings"); // <-- Kita panggil settings untuk cek nomor owner
const { isOwner } = require("../../utils/ownerCheck");

module.exports = {
  name: "listgrup",
  category: "owner",
  description: "Menampilkan semua grup bot dan adminnya.",
  aliases: ["groups", "cekgroup"],

  /**
   * @param {WAClient} client
   * @param {Object} msg
   * @param {string[]} args
   */
  run: async (client, msg, args) => {
    // --- VALIDASI OWNER ---
    if (!isOwner(msg)) {
      return client.sendMessage(
        msg.key.remoteJid,
        {
          text: "[ AKSES DITOLAK ]\nCommand ini hanya bisa digunakan oleh Owner Bot.",
        },
        { quoted: msg }
      );
    }
    // --- AKHIR VALIDASI OWNER ---

    await client.sendMessage(
      msg.key.remoteJid,
      {
        text: "Mohon tunggu...\nSedang mengambil data semua grup.",
      },
      { quoted: msg }
    );

    let mentions = [];
    let replyText = `==========================\n`;
    replyText += `   DAFTAR GRUP - ${settings.botName}\n`;
    replyText += `==========================\n\n`;

    try {
      const groups = await client.groupFetchAllParticipating();
      const allGroups = Object.values(groups);

      replyText += `Total ${allGroups.length} Grup Ditemukan:\n\n`;

      // Loop setiap grup
      for (const group of allGroups) {
        replyText += `--------------------------\n`;
        replyText += `*Nama Grup:* ${group.subject}\n`;
        replyText += `*ID Grup:* ${group.id}\n`;

        const admins = group.participants.filter(
          (p) => p.admin === "admin" || p.admin === "superadmin"
        );

        replyText += `*Total Admin:* ${admins.length}\n`;

        // Loop setiap admin dan tandai (mention)
        admins.forEach((admin, index) => {
          const adminNumber = admin.id.split("@")[0];
          replyText += `  ${index + 1}. @${adminNumber}\n`; // Kita buat jadi numbered list
          mentions.push(admin.id); // Kumpulkan JID untuk di-mention
        });
        replyText += `\n`; // Kasih jarak antar grup
      }

      replyText += `==========================\n`;
      replyText += `     Akhir Daftar Grup\n`;
      replyText += `==========================\n`;

      // Kirim pesan dengan text dan mentions
      await client.sendMessage(
        msg.key.remoteJid,
        {
          text: replyText,
          mentions: mentions,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error("Error di command listgrup:", err);
      await client.sendMessage(
        msg.key.remoteJid,
        {
          text: `[ ERROR ]\nTerjadi error saat mengambil data grup: ${err.message}`,
        },
        { quoted: msg }
      );
    }
  },
};
