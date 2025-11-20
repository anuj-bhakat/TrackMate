import express from 'express';
import upload from '../config/multer.js';
import {
  createSubmission,
  deleteSubmission,
  reviewSubmission,
  getSubmissionsByAssignment,
  getSubmissionById,
  getSubmissionsByStudent
} from '../controllers/assignmentSubmissionsController.js';

const router = express.Router();

// Insert with PDF upload (body fields + files)
router.post('/', upload.array('files', 10), createSubmission); // Insert

router.delete('/:id', deleteSubmission); // Delete by id

router.put('/review/:id', reviewSubmission); // Update marks/comments/status (review)
router.get('/assignment/:assignment_refer_id', getSubmissionsByAssignment); // Get by assignment
router.get('/student/:student_refer_id', getSubmissionsByStudent); // Get by student
router.get('/:id', getSubmissionById); // Get by submission id

export default router;
