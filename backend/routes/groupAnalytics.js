import express from 'express';
import { getStudentsAssignmentSummaryByGroupId } from '../controllers/groupAnalyticsController.js';

const router = express.Router();

router.get('/group-summary/:group_id', getStudentsAssignmentSummaryByGroupId);

export default router;
