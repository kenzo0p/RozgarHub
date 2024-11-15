import { Job } from "../models/job.model.js";
// for admin
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      position,
      experience,
      companyId,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !position ||
      !experience ||
      !companyId
    ) {
      return res.status(400).json({
        message: "SOMETHING IS MISSING",
        success: false,
      });
    }
    const job = await Job.create({
      title,
      description,
      requirements: requirements,
      salary: Number(salary),
      location,
      jobType,
      position,
      experienceLevel: experience,
      position,
      company: companyId,
      created_By: userId,
    });

    return res.status(201).json({
      message: "NEW JOB CREATED SUCCESSFULLY.",
      job,
      success: true,
    });
  } catch (error) {
    console.log(error, "ERROR DURING POSTING A JOB.");
  }
};
// for student
export const getAllJob = async (req, res) => {
  console.log("Job controller file loaded")
  try {
    const jobs = await Job.find().populate("company").sort({ createdAt: -1 });
    console.log("Jobs found:", jobs);
    if (!jobs) {
      return res.status(404).json({
        message: "JOBS NOT FOUND",
        success: false,
      });
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.log(error, "ERROR DURING GETTING ALL JOBS");
  }
};

// for student
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "JOB NOT FOUND",
        success: false,
      });
    }

    return res.status(200).json({
      job,
      success: true,
    });
  } catch (error) {
    console.log(error, "SOMETHING WENT WRONG DURING GETING A JOB");
  }
};
// how many jobs are created by admin
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_By: adminId });
    if (!jobs) {
      res.status(404).json({
        message: "JOBS ARE NOT FOUND",
        success: true,
      });
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.log(error, "SOMETHING WENT WRONG DURING GETTING ADMIN JOBS");
  }
};
