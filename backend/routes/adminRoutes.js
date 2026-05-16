const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getInvigilators,
  getInvigilatorById,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/invigilators', getInvigilators);
router.get('/invigilators/:id', getInvigilatorById);

router.get('/students', getStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

module.exports = router;

