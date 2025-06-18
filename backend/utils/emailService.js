import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transpoter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
});


export const sendInactivityEmail = async (student)=>{
    const mailOptions ={
        from:process.env.EMAIL_USER,
        to:student.email,
        subject:'Time to get back to problem solving! 🚀',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Hi ${student.name}! 👋</h2>
        
        <p>We noticed you haven't made any submissions on Codeforces in the last 7 days. 
        Consistent practice is key to improving your programming skills!</p>
        
        <p><strong>Your current stats:</strong></p>
        <ul>
          <li>Current Rating: ${student.currentRating}</li>
          <li>Max Rating: ${student.maxRating}</li>
          <li>Codeforces Handle: ${student.codeforcesHandle}</li>
        </ul>
        
        <p>Why not solve a problem today? Here are some suggestions:</p>
        <ul>
          <li>Try problems around your rating level (${student.currentRating - 100} - ${student.currentRating + 200})</li>
          <li>Focus on topics you want to improve</li>
          <li>Participate in upcoming contests</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://codeforces.com/problemset" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px;">
            Solve Problems Now
          </a>
        </div>
        
        <p>Keep pushing your limits 🚀</p>
      </div>
    `
        
    };

    try{
        await transpoter.sendMail(mailOptions);
        console.log(`Email sent to ${student.email}`);
        student.emailsSent = (Number(student.emailsSent) || 0) + 1;
        student.lastEmailDate = new Date(); 
        await student.save();
      }
    catch(error){
        console.error(`Failed to send email to ${student.email}:`,error.message);
        throw error;
    }
    
};
export const testEmailConnection = async ()=>{
    try{
        await transpoter.verify();
        console.log('Email service is ready');
        return true;
    }
    catch(error){
        console.log('Email service error:',error);
        return false;
    }
}

