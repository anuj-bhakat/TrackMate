import * as studentDetailsService from '../services/studentDetailsService.js';

export const createStudentDetail = async (req, res) => {
  if (!req.body.refer_id) {
    return res.status(400).json({ error: 'refer_id is required' });
  }
  try {
    const detail = await studentDetailsService.createStudentDetail(req.body);
    res.status(201).json(detail);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateStudentDetail = async (req, res) => {
  const { refer_id } = req.params;
  // Validate refer_id
  if (!refer_id) {
    return res.status(400).json({ error: 'refer_id param is required' });
  }
  try {
    const detail = await studentDetailsService.updateStudentDetail(refer_id, req.body);
    res.json(detail);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateStudentCourses = async (req, res) => {
  const { refer_id } = req.params;
  if (!refer_id) {
    return res.status(400).json({ error: 'refer_id param is required' });
  }
  try {
    const detail = await studentDetailsService.updateStudentCourses(refer_id, req.body.courses);
    res.json(detail);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getDetailsByInstitutionProgramSemester = async (req, res) => {
  const { institution_id, program_code, semester_code } = req.params;
  try {
    const details = await studentDetailsService.getDetailsByInstitutionProgramSemester(institution_id, program_code, semester_code);
    res.json(details);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getDetailByStudentId = async (req, res) => {
  const { refer_id } = req.params;
  if (!refer_id) {
    return res.status(400).json({ error: 'refer_id param is required' });
  }
  try {
    const detail = await studentDetailsService.getDetailByStudentId(refer_id);
    res.json(detail);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const deleteStudentDetail = async (req, res) => {
  const { refer_id } = req.params;
  if (!refer_id) {
    return res.status(400).json({ error: 'refer_id param is required' });
  }
  try {
    const result = await studentDetailsService.deleteStudentDetail(refer_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getStudentDetailsByInstitution = async (req, res) => {
  const { institution_id } = req.params;
  if (!institution_id) {
    return res.status(400).json({ error: 'institution_id param is required' });
  }
  try {
    const data = await studentDetailsService.getStudentDetailsByInstitution(institution_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};