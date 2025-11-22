const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const path = require("path");
const fs = require("fs");
const qrcode = require("qrcode-terminal"); // <-- Diimpor untuk QR

// Impor kustom
const settings = require("./settings");
const logger = require("./utils/logger");
const { loadCommands } = require("./utils/commandLoader");

// Setup logger PINO (untuk Baileys)
const pinoLogger = pino({
  level: "silent", // 'silent' agar tidak mengganggu logger kustom kita
  stream: pino.destination(path.join(__dirname, "baileys.log")), // Simpan log baileys ke file
});

// Fungsi utama untuk menjalankan bot
async function connectToWhatsApp() {
  logger.info("Memulai koneksi ke WhatsApp...");

  // Mengambil versi Baileys terbaru
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`Menggunakan Baileys versi ${version} (Latest: ${isLatest})`);

  // Setup autentikasi
  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__dirname, "session")
  );

  // Membuat socket (client)
  const client = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pinoLogger),
    },
    logger: pinoLogger,
    // printQRInTerminal: true, // <-- INI DIHAPUS/DIKOMEN
    browser: [settings.botName, "Chrome", "1.0.0"],
    markOnlineOnConnect: true,
  });

  // === Memuat Perintah ===
  loadCommands(client);

  // === Penangan Event Koneksi ===
  client.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info("QR Code diterima, silakan scan di terminal Anda:");
      // Tampilkan QR code secara manual di terminal
      qrcode.generate(qr, { small: true }); // <-- INI DITAMBAHKAN
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      logger.warn(
        `Koneksi ditutup: ${lastDisconnect.error?.message}. ${
          shouldReconnect
            ? "Mencoba menghubungkan kembali..."
            : "Tidak dapat terhubung (Logged Out)."
        }`
      );

      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 5000); // Coba lagi setelah 5 detik
      } else {
        logger.error("Silakan hapus folder 'session' dan scan ulang QR code.");
      }
    } else if (connection === "open") {
      logger.success(`Terhubung ke WhatsApp sebagai ${settings.botName}!`);
      logger.info(`Nomor Owner: ${settings.ownerNumber}`);
    }
  });

  // === Simpan Sesi (Credentials) ===
  client.ev.on("creds.update", saveCreds);

  // === Penangan Pesan Masuk (Handler Utama) ===
  client.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    // Izinkan pesan dari nomor bot sendiri agar bisa mengetik command dari device yang sama
    if (!msg.message) return;

    const msgType = Object.keys(msg.message)[0];
    if (msgType !== "conversation" && msgType !== "extendedTextMessage") return; // Hanya proses pesan teks

    const text =
      msgType === "conversation"
        ? msg.message.conversation
        : msg.message.extendedTextMessage.text;

    // Cek prefix
    if (!text || !text.startsWith(settings.prefix)) return;

    const args = text.slice(settings.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Cari command di Map
    const command =
      client.commands.get(commandName) ||
      client.commands.get(client.aliases.get(commandName));

    if (command) {
      // Dapatkan info pengirim
      const senderName = msg.pushName || "Pengguna";
      const groupInfo = msg.key.remoteJid.endsWith("@g.us")
        ? await client.groupMetadata(msg.key.remoteJid)
        : null;
      const groupName = groupInfo ? groupInfo.subject : null;

      // Log eksekusi command
      logger.command(command.name, senderName, groupName);

      try {
        // Jalankan command
        await command.run(client, msg, args);
      } catch (err) {
        logger.error(
          `Error saat menjalankan command ${command.name}: ${err.message}`
        );
        await client.sendMessage(
          msg.key.remoteJid,
          { text: `Terjadi error saat menjalankan command: ${err.message}` },
          { quoted: msg }
        );
      }
    }
  });

  return client;
}

// === Mulai Bot ===
connectToWhatsApp().catch((err) => {
  logger.error(`Gagal memulai bot: ${err.message}`);
});
