import express from 'express';
import upload from '../config/multer.js';
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByGroupId,
  getAssignmentsByCourseId
} from '../controllers/assignmentsController.js';

const router = express.Router();

// Insert with multiple PDF upload (body fields + PDFs)
router.post('/', upload.array('files', 10), createAssignment);

router.put('/:id', updateAssignment); // Modify assignment (marks can be updated)
router.delete('/:id', deleteAssignment); // Delete assignment

router.get('/group/:group_refer_id', getAssignmentsByGroupId); // Get by group id
router.get('/course/:course_id', getAssignmentsByCourseId);    // Get by course id (joins groups)

export default router;
