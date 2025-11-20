import express from 'express';
import * as controller from '../controllers/programGradesController.js';

const router = express.Router();

router.post('/', controller.upsert); // upsert (insert or update)
router.put('/:id', controller.update);
router.get('/:id', controller.get);
router.delete('/:id', controller.remove);

router.get('/program/:program_id', controller.getAllByProgram);
router.get('/student/:student_id', controller.getAllByStudent);

export default router;