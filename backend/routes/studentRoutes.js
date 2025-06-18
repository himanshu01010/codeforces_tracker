import express from "express";
import { createStudent, deleteStudent, downloadCSV, getAllStudents, getStudentById, getStudentProfile, getStudentStats, updateStudent } from "../controllers/studentController.js";

const router = express.Router();

router.get('/',getAllStudents);
router.get('/:id', getStudentById);
router.post('/',createStudent);
router.put('/:id',updateStudent);
router.delete('/:id',deleteStudent);
router.get('/:id/profile',getStudentProfile);
router.get('/:id/stats',getStudentStats);
router.get('/download/csv',downloadCSV);

export default router;