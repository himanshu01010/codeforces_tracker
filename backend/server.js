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
const allowedOrigins = [
  "http://localhost:3000",
  "https://codeforces-tracker-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,    
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/students',studentRoutes);
app.use('/api/sync',syncRoutes);
app.use('/api/settings',settingRoutes);

app.get('/',(req,res)=>{
    res.json({message:'codeforce Tracker API is running'});

})

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB is connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); 
  }
};

startServer(); 

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