const User = require('../models/User');
const Session = require('../models/Session');

// GET /api/admin/students?search=&status=
exports.getStudents = async (req, res) => {
  try {
    const { search = '', status = 'all' } = req.query;
    const q = { role: 'student' };

    if (status === 'active') q.isActive = true;
    if (status === 'inactive') q.isActive = false;

    if (search.trim()) {
      const s = search.trim();
      q.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { studentId: { $regex: s, $options: 'i' } },
      ];
    }

    const students = await User.find(q).select('-password').sort({ createdAt: -1 }).limit(300);
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/students
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      studentId: studentId || '',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        studentId: student.studentId,
        isActive: student.isActive,
        createdAt: student.createdAt,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/students/:id
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, studentId, isActive, password } = req.body;

    const student = await User.findById(id).select('+password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (email && email !== student.email) {
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== student._id.toString()) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      student.email = email;
    }
    if (typeof name === 'string') student.name = name;
    if (typeof studentId === 'string') student.studentId = studentId;
    if (typeof isActive === 'boolean') student.isActive = isActive;
    if (typeof password === 'string' && password.trim().length >= 6) {
      student.password = password.trim();
    }

    await student.save();

    res.status(200).json({
      success: true,
      data: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        studentId: student.studentId,
        isActive: student.isActive,
        updatedAt: student.updatedAt,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/invigilators
exports.getInvigilators = async (req, res) => {
  try {
    const invigilators = await User.find({ role: 'invigilator' })
      .select('-password')
      .sort({ name: 1 })
      .lean();

    const counts = await Session.aggregate([
      { $match: { invigilatorId: { $ne: null } } },
      {
        $group: {
          _id: { invigilatorId: '$invigilatorId', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      const invId = c?._id?.invigilatorId;
      const status = c?._id?.status;
      if (!invId || !status) return;
      const k = String(invId);
      if (!countMap[k]) countMap[k] = { scheduled: 0, completed: 0 };
      if (status === 'scheduled') countMap[k].scheduled = c.count;
      if (status === 'completed') countMap[k].completed = c.count;
    });

    const data = invigilators.map((u) => ({
      ...u,
      scheduledCount: countMap[String(u._id)]?.scheduled || 0,
      completedCount: countMap[String(u._id)]?.completed || 0,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/invigilators/:id
exports.getInvigilatorById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user || user.role !== 'invigilator') {
      return res.status(404).json({ success: false, message: 'Invigilator not found' });
    }

    const sessions = await Session.find({ invigilatorId: user._id })
      .populate('invigilatorId', 'name email role')
      .sort('-createdAt')
      .lean();

    const scheduledSessions = sessions.filter((s) => s.status === 'scheduled');
    const completedSessions = sessions.filter((s) => s.status === 'completed');

    res.status(200).json({
      success: true,
      data: {
        ...user,
        scheduledCount: scheduledSessions.length,
        completedCount: completedSessions.length,
        scheduledSessions,
        completedSessions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    await student.deleteOne();
    res.status(200).json({ success: true, message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

