import express from 'express';
import {
  signupInstitutionAdmin,
  loginInstitutionAdmin,
  modifyInstitutionPassword,
  getInstitutionAdminsByInstitution,
  deleteInstitutionAdmin
} from '../controllers/institutionsController.js';
import { verifyInstitutionAdminToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signupInstitutionAdmin);
router.post('/login', loginInstitutionAdmin);
router.put('/modify-password', modifyInstitutionPassword);
// router.get('/institution/:institution_id',verifyInstitutionAdminToken, getInstitutionAdminsByInstitution);
router.get('/institution/:institution_id', getInstitutionAdminsByInstitution);
router.delete('/:institution_id/:username', deleteInstitutionAdmin);

export default router;
