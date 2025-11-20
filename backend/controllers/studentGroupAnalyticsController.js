import * as studentGroupAnalyticsService from '../services/studentGroupAnalyticsService.js';

export const getStudentCompleteGroupData = async (req, res) => {
  const { student_id } = req.params;
  try {
    const data = await studentGroupAnalyticsService.getStudentCompleteGroupData(student_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
