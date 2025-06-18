import express from 'express';
import { getSyncStatus, syncAllStudentsData, syncSingleStudent } from '../controllers/syncController.js';


const router = express.Router();

router.post('/student/:id',syncSingleStudent);
router.post('/all', syncAllStudentsData);
router.get('/status',getSyncStatus);


export default router;