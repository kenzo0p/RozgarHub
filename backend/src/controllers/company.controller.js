// import {Company} from '../models/company.model.js'

import { Company } from "../models/company.model.js";

export const registerCompany = async (req, res) => {
  const { companyName } = req.body;
  if (!companyName) {
    res.status(401).json({
      message: "COMPANY NAME IS REQUIRED",
      success: false,
    });
  }

  let company = await Company.findOne({ name: companyName });
  if (company) {
    return res.status(400).json({
      message: "YOU CAN'T REGISTER SAME COMPANY",
      success: false,
    });
  }
  company = await Company.create({
    name: companyName,
    userId: req.id,
  });

  return res.status(200).json({
    message:"COMPANU REGISTER SUCCESSFULLY.",
    company,
    success:false
  })
};


export const getCompany = async (req,res)=>{
    try {
        const userId =req.id
        const companies = await Company.find(userId)
        if(!companies){
            return res.status(404).json({
                message:"COMPANIES NOT FOUND.",
                success:false
            })
        }

    } catch (error) {
        console.log(error , "GET COMPANY ERROR")
    }
}

// get company by id
export const getCompanyById = async(req,res)=>{
    try {
        const companyId = req.params.id
        const company = await Company.findById(companyId)
        if(!company){
            return res.status(401).json({
                message:"COMPANY IS NOT FOUND", 
                success:false
            })
        }
        return res.status(200).json({
            message:"COMPANY FOUND SUCCESSFULLY.",
            company,
            success:true
        })
    } catch (error) {
        console.log(error,"ERROR OCCURED DURING GET COMPANY BY ID")
    }
}

export const updateCompany = async (req,res) => {
    try {
        const {name,description,website,location} = req.body
        const file = req.file
        // cloudinary


        const updateData = {name,description,website,location}

        const company = await Company.findByIdAndUpdate(req.params.id, updateData , {new:true})

        if(!company){
            return res.status(404).json({
                message:"COMAPANY NOT FOUND",
                success:false
            })
        }
        return res.status(200).json({
            message:"COMPANY INFORMATION UPDATED SUCCESSFULLY",
            success:true
        })
    } catch (error) {
        console.log(error , "UPDATE COMPANY ERROR")
    }
}   