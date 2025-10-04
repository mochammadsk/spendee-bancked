const app = require('../index');
const database = require('../src/lib/database');

let inited = false;
async function ensureInit() {
  if (!inited && database && typeof database.connectDB === 'function') {
    await database.connectDB();
    inited = true;
  }
}

module.exports = async (req, res) => {
  await ensureInit();
  return app(req, res);
};
