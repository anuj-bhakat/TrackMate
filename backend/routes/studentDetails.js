import express from 'express';
import {
  createStudentDetail,
  updateStudentDetail,
  updateStudentCourses,
  getDetailsByInstitutionProgramSemester,
  getDetailByStudentId,
  deleteStudentDetail,
  getStudentDetailsByInstitution
} from '../controllers/studentDetailsController.js';

const router = express.Router();

router.post('/', createStudentDetail);
router.put('/:refer_id', updateStudentDetail);
router.patch('/:refer_id/courses', updateStudentCourses);

router.get('/institution/:institution_id', getStudentDetailsByInstitution);
router.get('/:institution_id/:program_code/:semester_code', getDetailsByInstitutionProgramSemester);
router.get('/student/:refer_id', getDetailByStudentId);

router.delete('/student/:refer_id', deleteStudentDetail);


export default router;
