import React, { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useParams } from "react-router-dom";
import axios from "axios";
import { setSingleJob } from "@/redux/jobSlice";
import { useDispatch } from "react-redux";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";

function JobDetails() {
  const { singleJob } = useSelector((store) => store.job);
  const {user} = useSelector(store=>store.auth)
  const isInitiallyApplied = singleJob?.applications?.some(application=>application.applicant === user?._id) || false ;
  const [isApplied ,setIsApplied] = useState(isInitiallyApplied)

  const params = useParams();
  const jobId = params.disabled;
  const dispatch = useDispatch();

  const applyJobHandler = async() =>{
    try {
      const response = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`,{withCredentials:true});
      if(res.data.success){
        setIsApplied(true) //update the local state
        const updatedSingleJOb = {...singleJob,applications:[...singleJob.applications,{applicant:user?._id}]}
        dispatch(setSingleJob(updatedSingleJOb))//help us to realtime ui update
        toast.success(res.data.message)
      }
    } catch (error) {
        console.log(error)
        toast.error(error.response.data.message)      
    }
  }
  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`,{
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(res.data.job.applications.some(application=>application.applicant === user?._id))//ensure the state is in sync with fetch data
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleJob();
  }, [jobId, dispatch, user?._id]);

  return (
    <div className="max-w-7xl mx-auto my-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">{singleJob?.title}</h1>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="ghost" className={"text-blue-500  font-bold"}>
              {singleJob?.position} Positions
            </Badge>
            <Badge variant="ghost" className={"text-red-500  font-bold"}>
              {singleJob.jobType}
            </Badge>
            <Badge variant="ghost" className={"text-slate-600  font-bold"}>
              {singleJob?.salary}LPA
            </Badge>
          </div>
        </div>
        <Button
        onClick ={isApplied ? null : applyJobHandler}
          disabled={isApplied}
          className={`rounded-lg ${
            isApplied
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-500 cursor-pointer hover:bg-blue-400"
          }`}
        >
          {isApplied ? "Already Applied" : "Apply Now"}
        </Button>
      </div>
      <h1 className="border-b-2 border-b-gray-300 font-medium py-4">
        Job Description
      </h1>
      <div className="my-4">
        <h1 className="font-bold my-1">
          Role : <span className="pl-4 font-normal text-gray-800">{singleJob?.title}</span>
        </h1>
        <h1 className="font-bold my-1">
          Location :
          <span className="pl-4 font-normal text-gray-800">{singleJob?.location}</span>
        </h1>
        <h1 className="font-bold my-1">
          Description :
          <span className="pl-4 font-normal text-gray-800">
          {singleJob?.description}
          </span>
        </h1>
        <h1 className="font-bold my-1">
          Experience :
          <span className="pl-4 font-normal text-gray-800">{singleJob?.experience}</span>
        </h1>
        <h1 className="font-bold my-1">
          Salary :
          <span className="pl-4 font-normal text-gray-800">{singleJob?.salary}LPA</span>
        </h1>
        <h1 className="font-bold my-1">
          Total Applicants :
          <span className="pl-4 font-normal text-gray-800">{singleJob?.applications?.length}LPA</span>
        </h1>
        <h1 className="font-bold my-1">
          Posted Date :
          <span className="pl-4 font-normal text-gray-800">{singleJob?.createdAt.split("T")}</span>
        </h1>
      </div>
    </div>
  );
}

export default JobDetails;
