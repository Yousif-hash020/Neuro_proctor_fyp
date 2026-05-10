const express = require('express');
const router = express.Router();
const { createSession, getSessions, updateSession, deleteSession, updateSessionStatus } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

// Protect all session routes
router.use(protect);

router.route('/')
  .post(createSession)
  .get(getSessions);

router.route('/:id')
  .put(updateSession)
  .delete(deleteSession);

router.route('/:id/status')
  .put(updateSessionStatus);

module.exports = router;
