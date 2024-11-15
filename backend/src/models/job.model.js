import mongoose, { Mongoose } from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  requirements: {
    type: String,
  },
  salary: {
    type: Number,
    require: true,
  },
  experienceLevel:{
    type:Number,
    required:true
  },
  location: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  created_By:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  appliction:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application"
  }
},{timestamps:{createdAt:true,updatedAt:true}});

export const Job = mongoose.model("Job", jobSchema);
