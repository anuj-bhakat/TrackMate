import express from 'express';
import * as controller from '../controllers/semesterGradesController.js';

const router = express.Router();

router.post('/', controller.insert);
router.put('/:id', controller.update);
router.get('/:id', controller.get);
router.delete('/:id', controller.remove);
router.get('/student/:student_id', controller.getAllByStudent);
router.get('/semester/:semester_id', controller.getAllBySemester);

export default router;
