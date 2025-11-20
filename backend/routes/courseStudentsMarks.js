import express from 'express';
import {
  createCourseStudentMarks,
  updateCourseStudentMarks,
  deleteCourseStudentMarks,
  getMarksByStudentId,
  getMarksByCourseId,
  getCourseMarksByCourseAndProgram,
  getStudentCompleteMarksBySemester,
  getAllStudentsMarksSummaryByProgramSemester
} from '../controllers/courseStudentsMarksController.js';

const router = express.Router();

router.post('/', createCourseStudentMarks); // Insert
router.put('/:id', updateCourseStudentMarks); // Modify
router.delete('/:id', deleteCourseStudentMarks); // Delete
router.get('/by-student/:student_refer_id', getMarksByStudentId); // Get by student (with course info)
router.get('/by-course/:semester_courses_refer_id', getMarksByCourseId); // Get by course (with student info)

router.get('/by-course-and-program/:semester_courses_refer_id/:program_id', getCourseMarksByCourseAndProgram);
router.get('/summary/by-student/:student_id', getStudentCompleteMarksBySemester);
router.get('/summary/by-program-semester/:program_id/:semester_id', getAllStudentsMarksSummaryByProgramSemester);

export default router;
