import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import studentRoutes  from './routes/studentRoutes.js';
import syncRoutes from './routes/syncRoutes.js'
import settingRoutes from './routes/settingRoutes.js';
import { syncAllStudents } from "./utils/codeforcesSync.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/students',studentRoutes);
app.use('/api/sync',syncRoutes);
app.use('/api/settings',settingRoutes);

app.get('/',(req,res)=>{
    res.json({message:'codeforce Tracker API is running'});

})

mongoose.connect(process.env.MONGODB_URI)
.then(()=> console.log('MongoDB is connected sucessfully'))
.catch(err => console.error('MongoDB connection error:',err));

cron.schedule('0 2 * * *',async ()=>{
    console.log('starting daily codeforces data sync...');
    try{
        await syncAllStudents();
        console.log('Daily sync completed sucessfully');
    }
    catch(error){
        console.log('Daily sync failed:',error);
    }
});

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
});