require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Session = require('./models/Session');
const Alert = require('./models/Alert');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const alertRoutes   = require('./routes/alertRoutes');
app.use('/api/auth',     authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/alerts',   alertRoutes);
// ──────────────────────────────────────────────────────────────────────────────

// ─── MongoDB ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fyp';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    startSessionScheduler();
  })
  .catch(err => console.error('MongoDB connection error:', err));
// ──────────────────────────────────────────────────────────────────────────────

// ─── Session Scheduler ────────────────────────────────────────────────────────
function startSessionScheduler() {
  setInterval(async () => {
    const now = new Date();
    try {
      const toStart = await Session.find({ status: 'scheduled', startTime: { $lte: now } });
      for (const session of toStart) {
        const alreadyActive = await Session.findOne({ status: 'active' });
        if (!alreadyActive) {
          session.status = 'active';
          await session.save();
          console.log(`[Scheduler] Auto-started: "${session.title}"`);
          io.emit('session_status_changed', { sessionId: session._id, status: 'active', session });
        }
      }

      const toClose = await Session.find({ status: 'active', endTime: { $lte: now } });
      for (const session of toClose) {
        session.status = 'completed';
        await session.save();
        console.log(`[Scheduler] Auto-closed: "${session.title}"`);
        io.emit('session_status_changed', { sessionId: session._id, status: 'completed', session });
      }
    } catch (err) {
      console.error('[Scheduler] Error:', err.message);
    }
  }, 30000);
}
// ──────────────────────────────────────────────────────────────────────────────

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // AI service sends live detection stats + annotated frame
  socket.on('ai_detection', (data) => {
    io.emit('frontend_update', data);
  });

  // AI service sends an alert — persist to MongoDB, then broadcast
  socket.on('ai_alert', async (alertData) => {
    try {
      const alert = await Alert.create({
        type:       alertData.type,
        severity:   alertData.severity,
        cameraId:   alertData.cameraId,
        cameraName: alertData.cameraName || '',
        sessionId:  alertData.sessionId  || null,
      });
      // Broadcast the full saved document (includes _id for resolve actions)
      io.emit('new_alert', alert);
      console.log(`[Alert] ${alert.severity} — ${alert.type} on ${alert.cameraId}`);
    } catch (err) {
      console.error('Error saving alert:', err.message);
    }
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});
// ──────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
