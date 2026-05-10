const Alert = require('../models/Alert');

// @desc    Get all alerts (newest first). Filter by sessionId via ?sessionId=...
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.sessionId) filter.sessionId = req.query.sessionId;
    if (req.query.status)    filter.status = req.query.status;

    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(200);
    res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve a specific alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private
exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete all resolved alerts (cleanup)
// @route   DELETE /api/alerts/resolved
// @access  Private
exports.clearResolved = async (req, res) => {
  try {
    await Alert.deleteMany({ status: 'resolved' });
    res.status(200).json({ success: true, message: 'Resolved alerts cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
