import express from 'express';
import * as controller from '../controllers/courseGradesController.js';

const router = express.Router();

router.post('/', controller.insert);
router.put('/:id', controller.update);
router.get('/:id', controller.get);
router.delete('/:id', controller.remove);
router.get('/by-student-semester/:student_id/:semester_id', controller.getAllByStudentSemester);

export default router;
