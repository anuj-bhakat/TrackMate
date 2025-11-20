import * as semesterGradesService from '../services/semesterGradesService.js';

export const insert = async (req, res) => {
  try {
    const data = await semesterGradesService.insertSemesterGrade(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await semesterGradesService.modifySemesterGrade(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const get = async (req, res) => {
  try {
    const data = await semesterGradesService.getSemesterGrade(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const result = await semesterGradesService.deleteSemesterGrade(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllByStudent = async (req, res) => {
  try {
    const data = await semesterGradesService.getSemestersByStudent(req.params.student_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllBySemester = async (req, res) => {
  try {
    const data = await semesterGradesService.getStudentsBySemester(req.params.semester_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
