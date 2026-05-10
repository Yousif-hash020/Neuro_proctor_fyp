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

const emitAlertUpdated = (req, alert) => {
  const io = req.app.get('io');
  if (io) io.emit('alert_updated', alert);
};

// @desc    Acknowledge a specific alert
// @route   PUT /api/alerts/:id/acknowledge
// @access  Private
exports.acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    if (alert.status === 'resolved') {
      return res.status(400).json({ success: false, message: 'Resolved alert cannot be acknowledged' });
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = req.user._id;
    await alert.save();

    emitAlertUpdated(req, alert);
    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve a specific alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private
exports.resolveAlert = async (req, res) => {
  try {
    const { note } = req.body || {};
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.user._id;
    if (typeof note === 'string') {
      alert.resolutionNote = note.trim();
    }
    await alert.save();

    emitAlertUpdated(req, alert);
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
