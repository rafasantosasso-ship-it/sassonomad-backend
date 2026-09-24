const Subscriber = require('../models/subscriber');
const User = require('../models/user');

const DAY_MS = 24 * 60 * 60 * 1000;

const countBy = async (field) => {
  const rows = await Subscriber.aggregate([
    { $group: { _id: `$${field}`, total: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);
  return Object.fromEntries(rows.map(({ _id, total }) => [_id ?? 'desconhecido', total]));
};

// GET /admin/stats — números da lista (protegida por x-admin-key).
module.exports.getStats = async (req, res, next) => {
  try {
    const now = Date.now();
    const [
      total, byStatus, byLang, bySource, last7Days, last30Days, accounts, latest,
    ] = await Promise.all([
      Subscriber.countDocuments(),
      countBy('status'),
      countBy('lang'),
      countBy('source'),
      Subscriber.countDocuments({ createdAt: { $gte: new Date(now - 7 * DAY_MS) } }),
      Subscriber.countDocuments({ createdAt: { $gte: new Date(now - 30 * DAY_MS) } }),
      User.countDocuments(),
      Subscriber.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email status source lang createdAt confirmedAt -_id'),
    ]);

    const confirmed = byStatus.confirmed || 0;

    return res.send({
      total,
      confirmed,
      pending: byStatus.pending || 0,
      unsubscribed: byStatus.unsubscribed || 0,
      confirmationRate: total ? `${Math.round((confirmed / total) * 100)}%` : '0%',
      last7Days,
      last30Days,
      accounts,
      byLang,
      bySource,
      latest,
    });
  } catch (err) {
    return next(err);
  }
};
