import Student from '../models/Student.js';
import Contest from '../models/Contest.js';
import Submission from '../models/Submission.js';
import {Parser} from 'json2csv';
import { syncStudentData } from '../utils/codeforcesSync.js';


export const getAllStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'name';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { codeforcesHandle: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const sortObject = {};
        sortObject[sortBy] = sortOrder;

        const totalStudents = await Student.countDocuments(searchQuery);
        
        const students = await Student.find(searchQuery)
            .sort(sortObject)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalStudents / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        res.json({
            students,
            pagination: {
                currentPage: page,
                totalPages,
                totalStudents,
                hasNextPage,
                hasPrevPage,
                limit,
                skip
            },
            search: {
                query: search,
                sortBy,
                sortOrder: sortOrder === 1 ? 'asc' : 'desc'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getStudentById = async (req,res)=>{
    try{
        const student = await Student.findById(req.params.id);
        if(!student) return res.status(404).json({error:'Student not found'});
        res.json(student);
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
};

export const createStudent = async (req,res)=>{
    try{
        const {name, email, phone ,codeforcesHandle} = req.body;

        const existingStudent = await Student.findOne({
            $or: [{email},{codeforcesHandle}]
        });

        if(existingStudent){
            return res.status(404).json({
                error:'Student with this email or codeforces handle already exists'
            });
        }
        const student = new Student({name, email, phone, codeforcesHandle});
        await student.save();

        res.status(201).json(student);
        
        syncStudentData(student).catch(syncError => {
            console.log(`Error syncing student ${codeforcesHandle}:`, syncError.message);
        });

        
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
};

export const updateStudent = async(req,res)=>{
    try{
        const {name,email,phone,codeforcesHandle,emailEnabled} = req.body;
        const student = await Student.findById(req.params.id);
        if(!student) return res.status(404).json({error:'Student not found'});

        const oldHandle = student.codeforcesHandle;

        student.name = name || student.name;
        student.email = email || student.email;
        student.phone = phone || student.phone;
        student.codeforcesHandle = codeforcesHandle || student.codeforcesHandle;
        student.emailEnabled = emailEnabled !== undefined ? emailEnabled : student.emailEnabled;

        await student.save();

        if(oldHandle !== student.codeforcesHandle){
            try{
                await syncStudentData(student);
            }
            catch(syncError){
                console.error('Error syncing update student data:',syncError);
            }
        }

        res.json(student);
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
};

export const deleteStudent = async (req, res)=>{
    try{
        const student = await Student.findById(req.params.id);
        if(!student) return res.status(404).json({error:'Student not found'});

        await Contest.deleteMany({studentId: req.params.id});
        await Submission.deleteMany({studentId: req.params.id});
        await Student.findByIdAndDelete(req.params.id);

        res.json({message: 'Student deleted successfully'});
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
}


export const getStudentProfile = async (req, res) => {
  try {
    const { period = 365 } = req.query;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const periodDate = new Date();
    periodDate.setDate(periodDate.getDate() - parseInt(period));

    const contests = await Contest.find({
      studentId: req.params.id,
      date: { $gte: periodDate }
    }).sort({ date: -1 });

    const submissions = await Submission.find({
      studentId: req.params.id,
      submissionDate: { $gte: periodDate },
      verdict: 'OK'
    }).sort({ submissionDate: -1 });

    res.json({ student, contests, submissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentStats = async (req, res) => {
  try {
    const { period = 365 } = req.query;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const periodDate = new Date();
    periodDate.setDate(periodDate.getDate() - parseInt(period));

    const date = new Date(periodDate);

    const submissions = await Submission.find({
      studentId: req.params.id,
      submissionDate: { $gte: periodDate },
      verdict: 'OK'
    });

    const totalProblems = submissions.length;
    const avgRating = totalProblems > 0
      ? submissions.reduce((sum, sub) => sum + (sub.problem.rating || 0), 0) / totalProblems
      : 0;

    const mostDifficult = submissions.reduce((max, sub) =>
      (sub.problem.rating || 0) > (max.problem?.rating || 0) ? sub : max, {});

    const avgProblemsPerDay = totalProblems / parseInt(period);

    const ratingBuckets = {};
    submissions.forEach(sub => {
      const rating = sub.problem.rating || 0;
      const bucket = Math.floor(rating / 100) * 100;
      ratingBuckets[bucket] = (ratingBuckets[bucket] || 0) + 1;
    });

    const heatmapData = {};
    submissions.forEach(sub => {
      const date = sub.submissionDate.toISOString().split('T')[0];
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    res.json({
      totalProblems,
      avgRating: Math.round(avgRating),
      mostDifficult: mostDifficult.problem || null,
      avgProblemsPerDay: Math.round(avgProblemsPerDay * 100) / 100,
      ratingBuckets,
      heatmapData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadCSV = async (req, res) => {
  try {
    const students = await Student.find();
    const fields = ['name', 'email', 'phone', 'codeforcesHandle', 'currentRating', 'maxRating', 'lastUpdated'];
    const parser = new Parser({ fields });
    const csv = parser.parse(students);

    res.header('Content-Type', 'text/csv');
    res.attachment('students.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
