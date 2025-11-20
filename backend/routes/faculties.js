import express from 'express';
import {
  signupFaculty,
  loginFaculty,
  modifyFacultyPassword,
  getFacultiesByInstitution,
  deleteFaculty
} from '../controllers/facultiesController.js';
import { verifyFacultyToken } from '../middlewares/authMiddleware.js';
import { getCoursesByFacultyId } from '../controllers/coursesController.js';

const router = express.Router();

router.post('/signup', signupFaculty);
router.post('/login', loginFaculty);
router.put('/modify-password', modifyFacultyPassword);
// router.get('/institution/:institution_id',verifyFacultyToken, getFacultiesByInstitution);
router.get('/institution/:institution_id', getFacultiesByInstitution);
router.delete('/:institution_id/:faculty_id', deleteFaculty);

export default router;
