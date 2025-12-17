import express from 'express';
import {
  signupStudent,
  loginStudent,
  modifyStudentPassword,
  getStudentsByInstitution,
  deleteStudent
} from '../controllers/studentsController.js';
import { verifyStudentToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signupStudent);
router.post('/login', loginStudent);
// router.put('/modify-password',verifyStudentToken, modifyStudentPassword);
router.put('/modify-password', modifyStudentPassword);
// router.get('/institution/:institution_id', verifyStudentToken, getStudentsByInstitution);
router.get('/institution/:institution_id', getStudentsByInstitution);
router.delete('/:institution_id/:student_id', deleteStudent);

export default router;
