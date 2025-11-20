import express from 'express';
import { getStudentCompleteGroupData } from '../controllers/studentGroupAnalyticsController.js';

const router = express.Router();

router.get('/student-groups/:student_id', getStudentCompleteGroupData);

export default router;