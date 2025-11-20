import express from 'express';
import {
  createGroupDetail,
  deleteGroupDetail,
  getEligibleStudentsForGroup,
  getEligibleStudentsWithCgpaAndBacklogs,
  getGroupMembersByGroupId,
  getGroupsByStudentId,
  getGroupsForStudentDetail,
  getStudentsByCourseId
} from '../controllers/groupDetailsController.js';

const router = express.Router();

router.post('/', createGroupDetail); // Insert
router.delete('/:id', deleteGroupDetail); // Delete by id

router.get('/group/:group_refer_id', getGroupMembersByGroupId); // Get by group ID (with student info)
router.get('/student-detail/:student_details_refer_id', getGroupsForStudentDetail); // Get by student_details ID
router.get('/eligible/group/:group_id', getEligibleStudentsForGroup);
router.get('/students/course/:course_id', getStudentsByCourseId);
router.get('/student-groups/:student_id', getGroupsByStudentId);
router.get('/eligible-students-data/:group_id', getEligibleStudentsWithCgpaAndBacklogs);

export default router;
