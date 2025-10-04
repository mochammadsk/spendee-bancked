const Account = require('../models/account');
const { store, update, listQuery } = require('../validators/account.schema');

const pick = (a) => ({
  id: a._id.toString(),
  name: a.name,
  opening_balance: a.opening_balance,
  current_balance: a.current_balance,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

exports.index = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

    const { page = 1, limit = 10 } = listQuery.parse(req.query || {});
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };
    const [rows, count] = await Promise.all([
      Account.find(where)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Account.countDocuments(where),
    ]);

    res.json({
      data: rows.map(pick),
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      itemsPerPage: limit,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.detail = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

    const data = await Account.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();
    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });

    res.json({ data: pick(data) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.store = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

    const { name, opening_balance, current_balance } = req.body;
    if (!name || !opening_balance) {
      return res.status(400).json({ message: 'Kolom wajib diisi' });
    }

    if (opening_balance < 0 || current_balance < 0) {
      return res
        .status(400)
        .json({ message: 'Saldo tidak boleh kurang dari 0' });
    }

    const current = current_balance ?? opening_balance ?? 0;

    const data = await Account.create({
      userId: req.user.id,
      name: name,
      opening_balance: opening_balance ?? 0,
      current_balance: current,
    });

    res.status(201).json({ data: pick(data.toObject()) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

    const patch = update.parse(req.body || {});
    const set = {};
    if (patch.name !== undefined) set.name = patch.name;
    if (patch.opening_balance !== undefined)
      set.opening_balance = patch.opening_balance;
    if (patch.current_balance !== undefined)
      set.current_balance = patch.current_balance;

    const data = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: set },
      { new: true }
    );

    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json({ data: pick(data.toObject()) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

    const data = await Account.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });

    res.json({ data: pick(data.toObject()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
