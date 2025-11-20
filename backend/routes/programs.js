import express from 'express';
import {
  createProgram,
  getPrograms,
  getProgramByCode,
  updateProgram,
  deleteProgram,
  getStudentsByProgramId
} from '../controllers/programsController.js';

const router = express.Router();

router.post('/', createProgram); // Insert
router.get('/:institution_id', getPrograms);
router.get('/:institution_id/:program_code', getProgramByCode); // Get one
router.put('/:institution_id/:program_code', updateProgram); // Modify
router.delete('/:institution_id/:program_code', deleteProgram); // Delete
router.get('/by-program/:program_id/students', getStudentsByProgramId);

export default router;
