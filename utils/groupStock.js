const fs = require("fs");
const path = require("path");

const stockPath = path.join(__dirname, "..", "data", "groupStock.json");

const ensureStockFile = () => {
  const dir = path.dirname(stockPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(stockPath)) {
    fs.writeFileSync(stockPath, "[]", "utf-8");
  }
};

const readStock = () => {
  ensureStockFile();
  try {
    const raw = fs.readFileSync(stockPath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Gagal membaca file stock:", err);
    return [];
  }
};

const writeStock = (stock) => {
  ensureStockFile();
  fs.writeFileSync(stockPath, JSON.stringify(stock, null, 2), "utf-8");
};

const addInvitesToStock = (invites) => {
  const stock = readStock();
  const existingCodes = new Set(stock.map((item) => item.code));

  let added = 0;
  for (const invite of invites) {
    if (!existingCodes.has(invite.code)) {
      stock.push({
        code: invite.code,
        link: `https://chat.whatsapp.com/${invite.code}`,
        addedAt: new Date().toISOString(),
      });
      existingCodes.add(invite.code);
      added++;
    }
  }

  writeStock(stock);

  return {
    added,
    skipped: invites.length - added,
    total: stock.length,
    stock,
  };
};

const removeByCodes = (codesToRemove) => {
  const stock = readStock();
  const codes = new Set(codesToRemove);
  const filtered = stock.filter((item) => !codes.has(item.code));
  writeStock(filtered);
  return filtered;
};

module.exports = {
  readStock,
  writeStock,
  addInvitesToStock,
  removeByCodes,
};
