import * as courseStudentsMarksService from '../services/courseStudentsMarksService.js';

export const createCourseStudentMarks = async (req, res) => {
  try {
    const result = await courseStudentsMarksService.createCourseStudentMarks(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateCourseStudentMarks = async (req, res) => {
  try {
    const result = await courseStudentsMarksService.updateCourseStudentMarks(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCourseStudentMarks = async (req, res) => {
  try {
    const result = await courseStudentsMarksService.deleteCourseStudentMarks(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMarksByStudentId = async (req, res) => {
  try {
    const result = await courseStudentsMarksService.getMarksByStudentId(req.params.student_refer_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMarksByCourseId = async (req, res) => {
  try {
    const result = await courseStudentsMarksService.getMarksByCourseId(req.params.semester_courses_refer_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getCourseMarksByCourseAndProgram = async (req, res) => {
  const { semester_courses_refer_id, program_id } = req.params;
  try {
    const result = await courseStudentsMarksService.getCourseMarksByCourseAndProgram(
      semester_courses_refer_id,
      program_id
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



export const getStudentCompleteMarksBySemester = async (req, res) => {
  const { student_id } = req.params;
  try {
    const result = await courseStudentsMarksService.getStudentCompleteMarksBySemester(student_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getAllStudentsMarksSummaryByProgramSemester = async (req, res) => {
  const { program_id, semester_id } = req.params;
  try {
    const result = await courseStudentsMarksService.getAllStudentsMarksSummaryByProgramSemester(
      program_id, semester_id
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};