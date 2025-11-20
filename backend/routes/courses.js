import express from 'express';
import {
  createCourse,
  getCoursesByProgramAndSemester,
  updateCourse,
  deleteCourse,
  assignFaculty,
  getCoursesByFacultyId,
  getCoursesByInstitutionId
} from '../controllers/coursesController.js';

const router = express.Router();

router.post('/', createCourse); // Create course, assigned_faculty is null
router.get('/faculty/:faculty_id', getCoursesByFacultyId);
router.get('/institution/:institution_id', getCoursesByInstitutionId);
router.get('/:institution_id/:program_code/:semester_code', getCoursesByProgramAndSemester); // Get courses by institution/program/semester
router.put('/:id', updateCourse); // Modify course by id
router.delete('/:id', deleteCourse); // Delete course by id

// Assign faculty to course by id - PATCH is semantic for partial update
router.patch('/:id/assign-faculty', assignFaculty);

export default router;
