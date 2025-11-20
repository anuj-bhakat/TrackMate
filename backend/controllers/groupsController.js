import * as groupsService from '../services/groupsService.js';

export const createGroup = async (req, res) => {
  try {
    const group = await groupsService.createGroup(req.body);
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await groupsService.updateGroup(id, req.body);
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await groupsService.deleteGroup(id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getGroupsByCourseId = async (req, res) => {
  const { course_refer_id } = req.params;
  try {
    const groups = await groupsService.getGroupsByCourseId(course_refer_id);
    res.json(groups);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getGroupsByFacultyId = async (req, res) => {
  const { faculty_id } = req.params;
  try {
    const groups = await groupsService.getGroupsByFacultyId(faculty_id);
    res.json(groups);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getGroupsByInstitutionId = async (req, res) => {
  const { institution_id } = req.params;
  if (!institution_id) {
    return res.status(400).json({ error: 'institution_id param is required' });
  }
  try {
    const groups = await groupsService.getGroupsByInstitutionId(institution_id);
    res.json(groups);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};