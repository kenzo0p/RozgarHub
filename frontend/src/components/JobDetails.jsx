import React from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

function JobDetails() {
  const isApplied = true;
  
  return (
    <div className="max-w-7xl mx-auto my-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">Title</h1>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="ghost" className={"text-blue-500  font-bold"}>
              12 Positions
            </Badge>
            <Badge variant="ghost" className={"text-red-500  font-bold"}>
              full time
            </Badge>
            <Badge variant="ghost" className={"text-slate-600  font-bold"}>
              1000/per month
            </Badge>
          </div>
        </div>
        <Button
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
      <h1 className="border-b-2 border-b-gray-300 font-medium py-4">Job Description</h1>
      <div className="my-4">
        <h1 className="font-bold my-1">Role : <span className="pl-4 font-normal text-gray-800">Driver</span></h1>
        <h1 className="font-bold my-1">Location : <span className="pl-4 font-normal text-gray-800">Pune</span></h1>
        <h1 className="font-bold my-1">Description : <span className="pl-4 font-normal text-gray-800">Lorem ipsum dolor sit amet.</span></h1>
        <h1 className="font-bold my-1">Experience : <span className="pl-4 font-normal text-gray-800">Driver</span></h1>
        <h1 className="font-bold my-1">Salary : <span className="pl-4 font-normal text-gray-800">Driver</span></h1>
        <h1 className="font-bold my-1">Posted Date : <span className="pl-4 font-normal text-gray-800">Driver</span></h1>

      </div>
    </div>
  );
}

export default JobDetails;
