const Session = require('../models/Session');

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const syncAiDetectionForSessionStatus = async (session, status) => {
  try {
    if (status === 'active') {
      const params = new URLSearchParams({
        session_id: String(session._id),
        camera_id: '0',
      });
      await fetch(`${AI_SERVICE_BASE_URL}/start?${params.toString()}`, { method: 'POST' });
    } else if (status === 'completed') {
      await fetch(`${AI_SERVICE_BASE_URL}/stop`, { method: 'POST' });
    }
  } catch (err) {
    console.error('[AI Sync] Session status sync failed:', err.message);
  }
};

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private
exports.createSession = async (req, res) => {
  try {
    const { title, startTime, endTime, assignedCameras } = req.body;
    
    const session = await Session.create({
      title,
      startTime,
      endTime,
      assignedCameras: assignedCameras || [],
      invigilatorId: req.user._id
    });
    
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all sessions
// @route   GET /api/sessions
// @access  Private
exports.getSessions = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { invigilatorId: req.user._id };
    const sessions = await Session.find(filter)
      .populate('invigilatorId', 'name email role')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update session details (title, cameras, times)
// @route   PUT /api/sessions/:id
// @access  Private
exports.updateSession = async (req, res) => {
  try {
    const { title, startTime, endTime, assignedCameras } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { title, startTime, endTime, assignedCameras },
      { new: true, runValidators: true }
    );
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
// @access  Private
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.status === 'active') {
      return res.status(400).json({ success: false, message: 'Cannot delete an active session. Stop it first.' });
    }
    await session.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update session status (start/stop)
// @route   PUT /api/sessions/:id/status
// @access  Private
exports.updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // If setting to active, check if there's already an active session
    if (status === 'active') {
      const activeSession = await Session.findOne({ status: 'active' });
      if (activeSession && activeSession._id.toString() !== req.params.id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Another session is currently active. Please stop it before starting a new one.' 
        });
      }
    }
    
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    await syncAiDetectionForSessionStatus(session, status);

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
