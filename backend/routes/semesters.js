import express from 'express';
import {
  createSemester,
  getSemestersByInstitution,
  getSemestersByInstitutionAndProgram,
  updateSemester,
  deleteSemester
} from '../controllers/semestersController.js';

const router = express.Router();

router.post('/', createSemester); // Create a semester
router.get('/:institution_id', getSemestersByInstitution); // Get all semesters for institution
router.get('/:institution_id/:program_code', getSemestersByInstitutionAndProgram); // Get all for program in institution
router.put('/:institution_id/:program_code/:semester_code', updateSemester); // Update semester
router.delete('/:institution_id/:program_code/:semester_code', deleteSemester); // Delete semester

export default router;
