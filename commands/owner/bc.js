const settings = require("../../settings");
const logger = require("../../utils/logger"); // Kita pakai logger untuk error

// Fungsi delay sederhana
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  name: "bc",
  category: "owner",
  description: "Broadcast pesan ke semua grup (hanya tag admin).",
  aliases: ["broadcast", "bcall"],

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

    // --- VALIDASI TEKS ---
    const broadcastText = args.join(" "); // Ambil semua teks setelah command
    if (!broadcastText) {
      return client.sendMessage(
        msg.key.remoteJid,
        {
          text: "[ FORMAT SALAH ]\nSilakan masukkan teks yang ingin di-broadcast.\n\nContoh:\n.bc Pengumuman penting untuk semua admin.",
        },
        { quoted: msg }
      );
    }
    // --- AKHIR VALIDASI TEKS ---

    let allGroups = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      // Ambil semua grup
      const groups = await client.groupFetchAllParticipating();
      allGroups = Object.values(groups);

      await client.sendMessage(
        msg.key.remoteJid,
        {
          text: `[ BROADCAST DIMULAI ]\n\nMengirim pesan ke ${allGroups.length} grup...\nMohon tunggu, ini mungkin perlu waktu.`,
        },
        { quoted: msg }
      );

      // Loop setiap grup
      for (const group of allGroups) {
        const groupId = group.id;

        try {
          // 1. Dapatkan admin dari grup saat ini
          const admins = group.participants.filter(
            (p) => p.admin === "admin" || p.admin === "superadmin"
          );

          // 2. Siapkan JID untuk 'mentions' (agar bisa di-tag)
          const mentions = admins.map((admin) => admin.id);

          // 3. Buat string tag yang terlihat (e.g., "@62812...")
          // Kita pakai spasi, bukan newline, agar lebih rapi di bawah teks
          const visibleTags = admins
            .map((admin) => `@${admin.id.split("@")[0]}`)
            .join(" ");

          // 4. Buat pesan akhir (sesuai permintaan Anda: Teks + tag)
          const finalMessage = `${broadcastText}\n\n${visibleTags}`;

          // 5. Kirim pesan
          await client.sendMessage(groupId, {
            text: finalMessage,
            mentions: mentions, // Ini properti penting agar tag berfungsi
          });

          successCount++;

          // 6. JEDA PENTING! (2 detik antar grup)
          await delay(2000);
        } catch (err) {
          // Jika gagal di 1 grup, catat dan lanjut ke grup lain
          errorCount++;
          logger.error(
            `Gagal BC ke grup ${group.subject || groupId}: ${err.message}`
          );
        }
      }

      // Kirim laporan hasil akhir ke owner
      await client.sendMessage(
        msg.key.remoteJid,
        {
          text: `[ BROADCAST SELESAI ]\n\nBerhasil terkirim: ${successCount} grup\nGagal terkirim: ${errorCount} grup`,
        },
        { quoted: msg }
      );
    } catch (err) {
      logger.error("Error fatal saat proses broadcast:", err);
      await client.sendMessage(
        msg.key.remoteJid,
        {
          text: `[ ERROR FATAL ]\nBroadcast gagal total: ${err.message}`,
        },
        { quoted: msg }
      );
    }
  },
};
