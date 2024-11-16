import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;
    if (!jobId) {
      return res
        .status(400)
        .json({ message: "JOB ID IS REQUIRED", success: false });
    }
    // check if user has already applied for job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "YOU HAVE ALREADY APPLIED FOR THIS JOB",
        success: false,
      });
    }

    // check if the jobs exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "JOB IS NOT AVAILABLE",
        success: false,
      });
    }
    // create a new application

    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });
    job.applictions.push(newApplication._id);
    await job.save();

    return res
      .status(201)
      .json({ message: "JOB APPLIED SUCCESSFULLY", success: true });
  } catch (error) {
    console.log(error, "ERROR DURING APPLYING JOBS");
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const application = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "company",
        },
      });
    if (!application) {
      return res.status(404).json({
        message: "APPLICATION NOT FOUND",
        success: false,
      });
    }

    return res.status(200).json({
      application,
      succcess: true,
    });
  } catch (error) {
    console.log(error, "ERROR DURING GETTING APLLIED JOBS");
  }
};

// for admin to see how many users are applied here
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applictions",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "applicant",
      },
    });

    if (!job) {
      return res.staus(404).json({
        message: "JOB IS NOT FOUND",
        success: false,
      });
    }

    return res.status(200).json({
      job,
      success: true,
    });
  } catch (error) {
    console.log(error, "ERROR DURING GETTING APPLICANTS");
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    if (!status) {
      return res.staus(400).json({
        message: "STATUS IS REQUIRED",
        success: false,
      });
    }
    // find the  application by applicant id

    const application = await Application.findOne({ _id: applicationId });
    if (!application) {
      return res.staus(404).json({
        message: "APPLICATION IS NOT FOUND",
        success: false,
      });
    }
    // update the status
    application.status = status.toLowerCase();
    await application.save();

    return res.status(200).json({
      message: "STATUS UPDATED SUCCESSFULLY",
      success: true,
    });
  } catch (error) {
    console.log(error, "ERROR DURING UPDATING STATUS");
  }
};
