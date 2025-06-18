import Student from "../models/Student.js";
import { syncStudentData,syncAllStudents } from "../utils/codeforcesSync.js";

export const syncSingleStudent = async (req, res)=>{
    try{
        const student = await Student.findById(req.params.id);
        if(!student){
            return res.status(404).json({error:'Student not found'});
        }

        await syncStudentData(student);
        res.json({message:'Student data synced successfully'});
    }
    catch(error){
        console.error('Sync error:',error);
        res.status(500).json({error:'Failed to sync student data'});
    }
};


export const syncAllStudentsData = async (req, res)=>{
    try{
        await syncAllStudents();
        res.json({message:'All students data synced successfully'});
    }
    catch(error){
        console.error('Sync all error:',error);
        res.status(500).json({error:'Failed to sync all students data'});
    }
};


export const getSyncStatus = async (req, res)=>{
    try{
        const students = await Student.find({},'name codeforcesHandle lastupdate').sort({lastUpdated:-1});
        res.json(students);
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
};