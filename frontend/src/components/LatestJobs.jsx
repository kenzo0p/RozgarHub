import React from "react";
import LatestJobCard from "./LatestJobCard";
const randomJob = [1, 2, 3, 4, 6, 7, 8];
function LatestJobs() {
  return (
    <div className="max-w-7xl my-20 mx-auto">
      <h1 className="text-4xl font-bold text-[#526a6e]">Job Openings</h1>
      <div className="grid grid-cols-3 gap-4 my-5">
        {" "}
        {randomJob.slice(0,6).map((job, index) => (
          <LatestJobCard key={index} />
        ))}
      </div>
    </div>
  );
}

export default LatestJobs;
