import React from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

function Job() {
  const navigate = useNavigate()
  const jobId = "1223445555";
  return (
    <div className="p-5 rounded-md shadow-xl bg-white border border-gray-200 hover:shadow-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">2 days ago</p>
        <Button variant="outline" className="rounded-full" size="icons">
          <Bookmark />
        </Button>
      </div>
      <div className="flex items-center gap-2 my-2">
        <Button className="p-6" variant="outline" size="icon">
          <Avatar>
            <AvatarImage src="data:image/png;base64,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" />
          </Avatar>
        </Button>
        <div>
          <h1 className="font-medium text-lg">company name</h1>
          <p className="text-sm text-gray-600">India</p>
        </div>
      </div>
      <div>
        <h1 className="font-bold text-lg my-2">Title</h1>
        <p className="text-sm text-gray-600">Lorem ipsum dolor sit amet.</p>
      </div>
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
      <div className="flex items-center gap-4 mt-4">
        <Button onClick={()=>navigate(`/details/${jobId}`)} variant="outline">Details</Button>
        <Button className="bg-blue-500">Save for later</Button>
      </div>
    </div>
  );
}

export default Job;
