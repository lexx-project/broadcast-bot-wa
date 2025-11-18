const chalk = require("chalk");
const moment = require("moment-timezone"); // Anda mungkin perlu: npm install moment-timezone

// Fungsi untuk mendapatkan waktu lokal (WIB)
const time = () => moment().tz("Asia/Jakarta").format("HH:mm:ss");

// Style dasar
const log = (text) => console.log(text);
const info = (text) =>
  log(`[${chalk.blue(time())}] ${chalk.blue("INFO")} ${text}`);
const success = (text) =>
  log(`[${chalk.green(time())}] ${chalk.green("SUCCESS")} ${text}`);
const warn = (text) =>
  log(`[${chalk.yellow(time())}] ${chalk.yellow("WARN")} ${text}`);
const error = (text) =>
  log(`[${chalk.red(time())}] ${chalk.red("ERROR")} ${text}`);

/**
 * Logger khusus untuk command
 * @param {string} commandName - Nama command yang dieksekusi
 * @param {string} user - Nama pengguna
 *_ @param {string} group - Nama grup (jika ada)
 */
const command = (commandName, user, group) => {
  const timeLog = chalk.magenta(time());
  const cmdLog = chalk.cyan.bold(commandName.toUpperCase());
  const userLog = chalk.green(user);
  const groupLog = group ? `di ${chalk.blue(group)}` : "";

  log(`[${timeLog}] ${cmdLog} dieksekusi oleh ${userLog} ${groupLog}`);
};

module.exports = { info, success, warn, error, command, log };
