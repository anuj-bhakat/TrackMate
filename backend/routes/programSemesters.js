import express from 'express';
import {
  createProgramSemester,
  updateProgramSemester,
  deleteProgramSemester,
  getProgramSemestersByProgramId
} from '../controllers/programSemestersController.js';

const router = express.Router();

router.post('/', createProgramSemester); // Insert
router.put('/:id', updateProgramSemester); // Modify
router.delete('/:id', deleteProgramSemester); // Delete
router.get('/by-program/:programs_refer_id', getProgramSemestersByProgramId); // Get by program

export default router;
