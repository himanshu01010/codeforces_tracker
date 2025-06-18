import axios from 'axios';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Contest from '../models/Contest.js';
import Submission from '../models/Submission.js';
import { sendInactivityEmail } from './emailService.js';
import dotenv from 'dotenv';
dotenv.config();

const codeforceApi = process.env.CODEFORCES_API_BASE;

const checkDbConnection = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  console.log(`Database connection state: ${states[mongoose.connection.readyState]}`);
  return mongoose.connection.readyState === 1;
};

export const syncStudentData = async (student) => {
  try {
    if (!checkDbConnection()) {
      throw new Error('Database not connected');
    }

    console.log(`Starting sync for ${student.codeforcesHandle}...`);

    const userInfoResponse = await axios.get(`${codeforceApi}/user.info`, {
      params: { handles: student.codeforcesHandle },
      timeout: 10000
    });

    if (userInfoResponse.data.status !== 'OK') {
      throw new Error(`Failed to fetch user info for ${student.codeforcesHandle}`);
    }

    const userInfo = userInfoResponse.data.result[0];
    student.currentRating = userInfo.rating || 0;
    student.maxRating = userInfo.maxRating || 0;
    student.lastUpdated = new Date();

    try {
      const ratingsResponse = await axios.get(`${codeforceApi}/user.rating`, {
        params: { handle: student.codeforcesHandle },
        timeout: 10000
      });

      if (ratingsResponse.data.status === 'OK') {
        const ratings = ratingsResponse.data.result;
        console.log(`Found ${ratings.length} contests for ${student.codeforcesHandle}`);

        for (const rating of ratings) {
          await Contest.findOneAndUpdate(
            { studentId: student._id, contestId: rating.contestId },
            {
              studentId: student._id,
              contestId: rating.contestId,
              contestName: rating.contestName,
              handle: rating.handle,
              rank: rating.rank,
              oldRating: rating.oldRating,
              newRating: rating.newRating,
              ratingChange: rating.newRating - rating.oldRating,
              ratingUpdateTimeSeconds: rating.ratingUpdateTimeSeconds,
              date: new Date(rating.ratingUpdateTimeSeconds * 1000)
            },
            { upsert: true, new: true }
          );
        }
      }
    } catch (error) {
      console.error(`Contest history error for ${student.codeforcesHandle}:`, error.message);
    }

  
    try {
      const submissionsResponse = await axios.get(`${codeforceApi}/user.status`, {
        params: { 
          handle: student.codeforcesHandle,
          from: 1,
          count: 1000
        },
        timeout: 15000
      });

      if (submissionsResponse.data.status === 'OK') {
        const submissions = submissionsResponse.data.result;
        console.log(`Found ${submissions.length} submissions for ${student.codeforcesHandle}`);
        
        if (submissions.length > 0) {
          console.log('Sample submission:', JSON.stringify(submissions[0], null, 2));
        }

        let lastSubmissionDate = null;
        let savedCount = 0;
        let errorCount = 0;

        for (const submission of submissions) {
          try {
            const submissionDate = new Date(submission.creationTimeSeconds * 1000);
            if (!lastSubmissionDate || submissionDate > lastSubmissionDate) {
              lastSubmissionDate = submissionDate;
            }

            const problemData = {
              contestId: submission.problem?.contestId || null,
              index: submission.problem?.index || '?',
              name: submission.problem?.name || 'Unknown',
              type: submission.problem?.type || 'PROGRAMMING',
              points: submission.problem?.points || 0,
              rating: submission.problem?.rating || 0,
              tags: submission.problem?.tags || []
            };

            const authorData = {
              contestId: submission.author?.contestId || null,
              members: (submission.author?.members || []).map(m => ({
                handle: m?.handle || 'unknown'
              })),
              participantType: submission.author?.participantType || 'UNKNOWN',
              ghost: submission.author?.ghost || false,
              room: submission.author?.room || null,
              startTimeSeconds: submission.author?.startTimeSeconds || 0
            };

            const result = await Submission.findOneAndUpdate(
              { studentId: student._id, submissionId: submission.id },
              {
                studentId: student._id,
                submissionId: submission.id,
                contestId: submission.contestId || null,
                creationTimeSeconds: submission.creationTimeSeconds,
                relativeTimeSeconds: submission.relativeTimeSeconds,
                problem: problemData,
                author: authorData,
                programmingLanguage: submission.programmingLanguage || '',
                verdict: submission.verdict || '',
                testset: submission.testset || 'TESTS',
                passedTestCount: submission.passedTestCount || 0,
                timeConsumedMillis: submission.timeConsumedMillis || 0,
                memoryConsumedBytes: submission.memoryConsumedBytes || 0,
                submissionDate: submissionDate
              },
              { upsert: true, new: true, runValidators: true }
            );

            if (result) {
              savedCount++;
              if (savedCount % 50 === 0) {
                console.log(`Saved ${savedCount} submissions for ${student.codeforcesHandle}`);
              }
            }
          } catch (subError) {
            errorCount++;
            console.error(`Submission ${submission.id} error:`, subError.message);
            if (errorCount <= 3) {
              console.error('Error details:', {
                problem: submission.problem,
                error: subError
              });
            }
          }
        }

        student.lastSubmissionDate = lastSubmissionDate;
        console.log(`Submissions saved: ${savedCount}, errors: ${errorCount}`);
      }
    } catch (error) {
      console.error(`Submissions fetch error for ${student.codeforcesHandle}:`, error.message);
    }

    await student.save();
    console.log(`Completed sync for ${student.codeforcesHandle}`);
  } catch (error) {
    console.error(`Critical error syncing ${student.codeforcesHandle}:`, error.message);
    throw error;
  }
};

export const syncAllStudents = async () => {
  try {
    if (!checkDbConnection()) {
      throw new Error('Database not connected');
    }

    const students = await Student.find().select('codeforcesHandle _id');
    console.log(`Starting sync for ${students.length} students...`);

    for (const [index, student] of students.entries()) {
      try {
        console.log(`\nProcessing student ${index + 1}/${students.length}: ${student.codeforcesHandle}`);
        await syncStudentData(student);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`Failed to sync ${student.codeforcesHandle}:`, error.message);
      }
    }

    await checkInactiveStudents();
    console.log('\nSync completed for all students');
  } catch (error) {
    console.error('Global sync error:', error.message);
    throw error;
  }
};

export const checkInactiveStudents = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactiveStudents = await Student.find({
      emailEnabled: true,
      $or: [
        { lastSubmissionDate: { $lt: sevenDaysAgo } },
        { lastSubmissionDate: null }
      ]
    }).select('name email codeforcesHandle currentRating maxRating lastSubmissionDate');

    console.log(`Found ${inactiveStudents.length} inactive students`);

    for (const student of inactiveStudents) {
      try {
        await sendInactivityEmail(student);
        console.log(`Sent email to ${student.email}`);
      } catch (emailError) {
        console.error(`Email failed for ${student.email}:`, emailError.message);
      }
    }
  } catch (error) {
    console.error('Inactive check error:', error.message);
  }
};