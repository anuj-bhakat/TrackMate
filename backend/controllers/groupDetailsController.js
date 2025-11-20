import * as groupDetailsService from '../services/groupDetailsService.js';

// Insert
export const createGroupDetail = async (req, res) => {
  try {
    const detail = await groupDetailsService.createGroupDetail(req.body);
    res.status(201).json(detail);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete (by id)
export const deleteGroupDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await groupDetailsService.deleteGroupDetail(id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all group members by group id (with student info)
export const getGroupMembersByGroupId = async (req, res) => {
  const { group_refer_id } = req.params;
  try {
    const members = await groupDetailsService.getGroupMembersByGroupId(group_refer_id);
    res.json(members);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all groups that a student is in, by student_details_refer_id
export const getGroupsForStudentDetail = async (req, res) => {
  const { student_details_refer_id } = req.params;
  try {
    const groups = await groupDetailsService.getGroupsForStudentDetail(student_details_refer_id);
    res.json(groups);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getEligibleStudentsForGroup = async (req, res) => {
  const { group_id } = req.params;
  if (!group_id) return res.status(400).json({ error: 'group_id param is required' });
  try {
    const students = await groupDetailsService.getEligibleStudentsForGroup(group_id);
    res.json(students);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getEligibleStudentsWithCgpaAndBacklogs = async (req, res) => {
  try {
    const result = await groupDetailsService.getEligibleStudentsWithCgpaAndBacklogs(req.params.group_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getStudentsByCourseId = async (req, res) => {
  const { course_id } = req.params;
  if (!course_id) return res.status(400).json({ error: 'course_id param is required' });
  try {
    const students = await groupDetailsService.getStudentsByCourseId(course_id);
    res.json(students);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getGroupsByStudentId = async (req, res) => {
  const { student_id } = req.params;
  if (!student_id) return res.status(400).json({ error: 'student_id param is required' });
  try {
    const groups = await groupDetailsService.getGroupsByStudentId(student_id);
    res.json(groups);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};