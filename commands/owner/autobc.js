const settings = require("../../settings");
const logger = require("../../utils/logger");

// Delay sederhana untuk jeda antar grup
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 10 variasi kata-kata promo untuk mengurangi pola bot
const promoMessages = [
  "Hai admin, saya di sini menawarkan bot untuk grub supaya lebih seru. Fiturnya juga banyak, harga cuma 10k per bulan. Review bot silakan masuk\n\nhttps://chat.whatsapp.com/G2S6UXOWn7h7Ci6FtQBPfP",
  "Halo admin, saya punya bot biar grub makin rame. Fitur lengkap dan murah, hanya 10k sebulan. Review bot ada di sini\n\nhttps://chat.whatsapp.com/G2S6UXOWn7h7Ci6FtQBPfP",
  "Hi admin, butuh bot yang bikin grub aktif? Fiturnya banyak banget, biaya cuma 10k/bulan. Lihat review bot di link ini\n\nhttps://chat.whatsapp.com/G2S6UXOWn7h7Ci6FtQBPfP",
  "Permisi admin, mau naikin aktivitas grub? Saya tawarkan bot dengan banyak fitur, harga 10k per bulan. Review bot bisa dicek di sini\n\nhttps://chat.whatsapp.com/G2S6UXOWn7h7Ci6FtQBPfP",
  "Selamat siang admin, saya jual bot untuk grub biar lebih seru. Fitur melimpah, tarif 10k sebulan. Reviewnya bisa dilihat\n\nhttps://chat.whatsapp.com/G2S6UXOWn7h7Ci6FtQBPfP",
  "Halo kak admin, ada bot biar grub makin hidup. Fitur komplit, harga cuma 10k/bulan. Silakan cek review bot\n\nhttps://chat.whatsapp.com/G2S6UXOWn7h7Ci6FtQBPfP",
  "Hai kak, saya tawarkan bot buat grup supaya makin ramai. Banyak fitur, cukup 10k per bulan. Review bisa masuk link ini\n\nhttps://chat.whatsapp.com/G2S6UXOWn7h7Ci6FtQBPfP",
  "Halo admin, ada bot murah 10k/bulan dengan fitur lengkap untuk grub. Mau lihat review bot? Kunjungi link ini\n\nhttps://chat.whatsapp.com/G2S6UXOWn7h7Ci6FtQBPfP",
  "Hi kak admin, menawarkan bot biar grub lebih aktif. Fiturnya banyak dan langganan cuma 10k per bulan. Review bot ada di link berikut\n\nhttps://chat.whatsapp.com/G2S6UXOWn7h7Ci6FtQBPfP",
  "Permisi admin, saya jual bot untuk grup agar lebih seru. Banyak fitur, biaya langganan 10k/bulan. Review bot bisa dicek di sini\n\nhttps://chat.whatsapp.com/G2S6UXOWn7h7Ci6FtQBPfP",
];

module.exports = {
  name: "autobc",
  category: "owner",
  description:
    "Broadcast otomatis dengan 10 variasi pesan random (hanya tag admin).",
  aliases: ["autobroadcast"],

  /**
   * @param {WAClient} client
   * @param {Object} msg
   * @param {string[]} args
   */
  run: async (client, msg, args) => {
    // --- VALIDASI OWNER ---
    const senderJid = msg.key.remoteJid.endsWith("@g.us")
      ? msg.key.participant
      : msg.key.remoteJid;

    const senderNumber = senderJid.split("@")[0];

    if (senderNumber !== settings.ownerNumber) {
      return client.sendMessage(
        msg.key.remoteJid,
        {
          text: "[ AKSES DITOLAK ]\nCommand ini hanya bisa digunakan oleh Owner Bot.",
        },
        { quoted: msg }
      );
    }
    // --- AKHIR VALIDASI OWNER ---

    let allGroups = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      const groups = await client.groupFetchAllParticipating();
      allGroups = Object.values(groups);

      await client.sendMessage(
        msg.key.remoteJid,
        {
          text: `[ AUTO BC DIMULAI ]\nMengirim promo ke ${allGroups.length} grup dengan pesan acak.\nMohon tunggu, ada jeda agar tidak spam.`,
        },
        { quoted: msg }
      );

      for (const group of allGroups) {
        const groupId = group.id;

        try {
          const admins = group.participants.filter(
            (p) => p.admin === "admin" || p.admin === "superadmin"
          );

          const mentions = admins.map((admin) => admin.id);
          const visibleTags = admins
            .map((admin) => `@${admin.id.split("@")[0]}`)
            .join(" ");

          const randomMessage =
            promoMessages[Math.floor(Math.random() * promoMessages.length)];
          const finalMessage = `${randomMessage}\n\n${visibleTags}`;

          await client.sendMessage(groupId, {
            text: finalMessage,
            mentions: mentions,
          });

          successCount++;

          // Jeda 3 detik antar grup agar tidak terlihat spam
          await delay(3000);
        } catch (err) {
          errorCount++;
          logger.error(
            `Gagal auto BC ke grup ${group.subject || groupId}: ${err.message}`
          );
        }
      }

      await client.sendMessage(
        msg.key.remoteJid,
        {
          text: `[ AUTO BC SELESAI ]\nBerhasil terkirim: ${successCount} grup\nGagal terkirim: ${errorCount} grup`,
        },
        { quoted: msg }
      );
    } catch (err) {
      logger.error("Error fatal saat proses auto broadcast:", err);
      await client.sendMessage(
        msg.key.remoteJid,
        {
          text: `[ ERROR FATAL ]\nAuto broadcast gagal total: ${err.message}`,
        },
        { quoted: msg }
      );
    }
  },
};
