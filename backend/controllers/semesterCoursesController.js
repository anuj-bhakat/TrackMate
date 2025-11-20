import * as semesterCoursesService from '../services/semesterCoursesService.js';

export const createSemesterCourse = async (req, res) => {
  try {
    const result = await semesterCoursesService.createSemesterCourse(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateSemesterCourse = async (req, res) => {
  try {
    const result = await semesterCoursesService.updateSemesterCourse(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteSemesterCourse = async (req, res) => {
  try {
    const result = await semesterCoursesService.deleteSemesterCourse(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getSemesterCoursesBySemesterId = async (req, res) => {
  try {
    const result = await semesterCoursesService.getSemesterCoursesBySemesterId(req.params.semester_refer_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getSemesterCoursesByProgramId = async (req, res) => {
  try {
    const result = await semesterCoursesService.getSemesterCoursesByProgramId(req.params.programs_refer_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getSemesterCourseById = async (req, res) => {
  try {
    const result = await semesterCoursesService.getSemesterCourseById(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};