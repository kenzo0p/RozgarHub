import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const companyArray = [];
function PostJob() {
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    experience: "",
    position: 0,
    companyId: "",
  });
  const { companies } = useSelector((store) => store.company);
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const selectChangeHandler = (value) =>{
    const selectedCompany = companies.find((company) => company.name.toLowerCase() === value)
    setInput({...input,companyId:selectedCompany._id})
  }
  const submitHandler = (e) =>{
    e.preventDefault()
    
  }
  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center w-screen my-5">
        <form onSubmit={submitHandler} className="p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Title</Label>
              <Input
                value={input.title}
                onChange={changeEventHandler}
                type="text"
                name="title"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 ,my-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={input.description}
                onChange={changeEventHandler}
                type="text"
                name="Description"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 ,my-1"
              />
            </div>
            <div>
              <Label>Requirements</Label>
              <Input
                value={input.requirements}
                onChange={changeEventHandler}
                type="text"
                name="requirements"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 ,my-1"
              />
            </div>
            <div>
              <Label>Salary</Label>
              <Input
                value={input.salary}
                onChange={changeEventHandler}
                type="text"
                name="salary"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 ,my-1"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={input.location}
                onChange={changeEventHandler}
                type="text"
                name="location"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 ,my-1"
              />
            </div>
            <div>
              <Label>Job Type</Label>
              <Input
                value={input.jobType}
                onChange={changeEventHandler}
                type="text"
                name="jobType"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 ,my-1"
              />
            </div>
            <div>
              <Label>Experience</Label>
              <Input
                value={input.experience}
                onChange={changeEventHandler}
                type="text"
                name="experience"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 ,my-1"
              />
            </div>
            <div>
              <Label>No of positions</Label>
              <Input
                value={input.position}
                onChange={changeEventHandler}
                type="number"
                name="position"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 ,my-1"
              />
            </div>
          {companies.length > 0 && (

            <Select onValueChange ={selectChangeHandler}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {companies.map((company) => {
                    return (
                      <SelectItem key={company._id} value={company.name.toLowerCase()}>
                        {company.name}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          </div>

          <Button className="bg-blue-500 w-full mt-5" type="subit">
            Post New Job
          </Button>
          {companies.length === 0 && (
            <p className="text-xs text-red-600 font-bold text-center my-3">
              *Please register company first before posting a job
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default PostJob;
