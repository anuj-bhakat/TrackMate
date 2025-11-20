import express from 'express';
import {
  createInstitution,
  getInstitutions,
  getInstitutionById,
  updateInstitution,
  deleteInstitution
} from '../controllers/availableInstitutionsController.js';

const router = express.Router();

router.post('/', createInstitution);
router.get('/', getInstitutions);
router.get('/:institution_id', getInstitutionById);
router.put('/:institution_id', updateInstitution);
router.delete('/:institution_id', deleteInstitution);

export default router;
