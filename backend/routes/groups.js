import express from 'express';
import {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupsByCourseId,
  getGroupsByFacultyId,
  getGroupsByInstitutionId
} from '../controllers/groupsController.js';

const router = express.Router();

router.post('/', createGroup);                       // Create group
router.put('/:id', updateGroup);                     // Modify group (by group id)
router.delete('/:id', deleteGroup);                  // Delete group (by group id)
router.get('/course/:course_refer_id', getGroupsByCourseId);      // Get groups by course id
router.get('/faculty/:faculty_id', getGroupsByFacultyId);         // Get groups by assigned faculty (via join)
router.get('/institution/:institution_id', getGroupsByInstitutionId);

export default router;