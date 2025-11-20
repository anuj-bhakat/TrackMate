import * as courseGradesService from '../services/courseGradesService.js';

export const insert = async (req, res) => {
  try {
    const data = await courseGradesService.insertCourseGrade(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await courseGradesService.modifyCourseGrade(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const get = async (req, res) => {
  try {
    const data = await courseGradesService.getCourseGrade(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const result = await courseGradesService.deleteCourseGrade(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllByStudentSemester = async (req, res) => {
  const { student_id, semester_id } = req.params;
  try {
    const data = await courseGradesService.getCourseGradesByStudentSemester(student_id, semester_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

