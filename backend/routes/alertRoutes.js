const express = require('express');
const router = express.Router();
const { getAlerts, acknowledgeAlert, resolveAlert, clearResolved } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAlerts);
router.delete('/resolved', clearResolved);
router.put('/:id/acknowledge', acknowledgeAlert);
router.put('/:id/resolve', resolveAlert);

module.exports = router;
