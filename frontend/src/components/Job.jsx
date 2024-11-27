import React from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

function Job({job}) {
  const navigate = useNavigate()
  const daysAgoFunction = (mongodbtime) =>{
    const createdAt = new Date(mongodbtime)
    const currentTime = new Date()
    const timeDifference = currentTime - createdAt
    return Math.floor(timeDifference/(1000*24*60*60)) 
  }
  return (
    <div className="p-5 rounded-md shadow-xl bg-white border border-gray-200 hover:shadow-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{daysAgoFunction(job?.createdAt) === 0?"Today":`${daysAgoFunction(job?.createAt)} Days ago`}</p>
        <Button variant="outline" className="rounded-full" size="icons">
          <Bookmark />
        </Button>
      </div>
      <div className="flex items-center gap-2 my-2">
        <Button className="p-6" variant="outline" size="icon">
          <Avatar>
            <AvatarImage src={job?.company?.logo} />
          </Avatar>
        </Button>
        <div>
          <h1 className="font-medium text-lg">{job?.name}</h1>
          <p className="text-sm text-gray-600">India</p>
        </div>
      </div>
      <div>
        <h1 className="font-bold text-lg my-2">{job?.title}</h1>
        <p className="text-sm text-gray-600">{job?.description}</p>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Badge variant="ghost" className={"text-blue-500  font-bold"}>
          {job?.position} Positions
        </Badge>
        <Badge variant="ghost" className={"text-red-500  font-bold"}>
        {job?.jobType}
        </Badge>
        <Badge variant="ghost" className={"text-slate-600  font-bold"}>
        {job?.salary} LPA
        </Badge>
      </div>
      <div className="flex items-center gap-4 mt-4">
        <Button onClick={()=>navigate(`/details/${job?._id}`)} variant="outline">Details</Button>
        <Button className="bg-blue-500">Save for later</Button>
      </div>
    </div>
  );
}

export default Job;
