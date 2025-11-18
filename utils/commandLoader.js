const fs = require("fs");
const path = require("path");
const logger = require("./logger");

/**
 * Memuat semua command dari direktori commands
 * @param {WAClient} client - Instance client Baileys
 */
function loadCommands(client) {
  client.commands = new Map(); // Menyimpan semua command
  client.aliases = new Map(); // MenyKpan alias (jika Anda ingin menambahkannya nanti)

  const commandPath = path.join(__dirname, "..", "commands");

  // Membaca folder kategori (e.g., main, tools, etc.)
  fs.readdirSync(commandPath).forEach((categoryDir) => {
    const categoryPath = path.join(commandPath, categoryDir);

    // Pastikan itu adalah direktori
    if (fs.statSync(categoryPath).isDirectory()) {
      // Membaca file command di dalam folder kategori
      const commandFiles = fs
        .readdirSync(categoryPath)
        .filter((file) => file.endsWith(".js"));

      logger.info(
        `Memuat ${
          commandFiles.length
        } command dari kategori ${categoryDir.toUpperCase()}...`
      );

      for (const file of commandFiles) {
        try {
          const filePath = path.join(categoryPath, file);
          const command = require(filePath);

          if (command.name) {
            client.commands.set(command.name, command);
            logger.success(`Command terdaftar: ${command.name}`);

            // Jika ada alias
            if (command.aliases && Array.isArray(command.aliases)) {
              command.aliases.forEach((alias) => {
                client.aliases.set(alias, command.name);
              });
            }
          } else {
            logger.warn(
              `Command di ${filePath} tidak memiliki properti 'name'.`
            );
          }
        } catch (err) {
          logger.error(`Gagal memuat command di ${file}: ${err.message}`);
        }
      }
    }
  });

  logger.success(`Total ${client.commands.size} command berhasil dimuat!`);
}

module.exports = { loadCommands };
