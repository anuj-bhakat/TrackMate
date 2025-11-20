import express from 'express';
import {
  createSemesterCourse,
  updateSemesterCourse,
  deleteSemesterCourse,
  getSemesterCoursesBySemesterId,
  getSemesterCoursesByProgramId,
  getSemesterCourseById
} from '../controllers/semesterCoursesController.js';

const router = express.Router();

router.post('/', createSemesterCourse); // Insert
router.put('/:id', updateSemesterCourse); // Modify
router.delete('/:id', deleteSemesterCourse); // Delete
router.get('/:id', getSemesterCourseById);
router.get('/by-semester/:semester_refer_id', getSemesterCoursesBySemesterId); // Get by semester
router.get('/by-program/:programs_refer_id', getSemesterCoursesByProgramId); // Get by program (join)
export default router;
