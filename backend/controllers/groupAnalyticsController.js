import * as groupAnalyticsService from '../services/groupAnalyticsService.js';

export const getStudentsAssignmentSummaryByGroupId = async (req, res) => {
  const { group_id } = req.params;
  try {
    const data = await groupAnalyticsService.getStudentsAssignmentSummaryByGroupId(group_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
