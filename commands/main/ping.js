module.exports = {
  name: "ping",
  category: "main",
  description: "Cek kecepatan respon bot",
  aliases: ["p", "status"], // Contoh alias

  /**
   * @param {WAClient} client
   * @param {Object} msg
   * @param {string[]} args
   */
  run: async (client, msg, args) => {
    const startTime = Date.now();

    // Mengirim pesan awal
    const sentMsg = await client.sendMessage(
      msg.key.remoteJid,
      { text: "Menghitung kecepatan..." },
      { quoted: msg }
    );

    const endTime = Date.now();
    const latency = endTime - startTime;

    // Mengedit pesan (jika didukung) atau mengirim pesan baru
    // Baileys v6 lebih disarankan mengirim pesan baru untuk update
    await client.sendMessage(
      msg.key.remoteJid,
      {
        text: `*PONG!* 🏓\nKecepatan Respon: *${latency} ms*`,
      },
      { quoted: msg }
    );

    // Hapus pesan "Menghitung kecepatan..." (opsional)
    // await client.sendMessage(msg.key.remoteJid, { delete: sentMsg.key });
  },
};
