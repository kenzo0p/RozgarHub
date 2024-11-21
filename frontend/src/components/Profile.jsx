import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfile from "./UpdateProfile";
const skills = ["html", "css"];
const isResume = true;
function Profile() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src="https://plus.unsplash.com/premium_photo-1682096259050-361e2989706d?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8eW91bmclMjBtYW58ZW58MHx8MHx8fDA%3D"
                alt="profile"
              />
            </Avatar>
            <div>
              <h1 className="font-medium text-xl">fullname</h1>
              <p>add your bio here</p>
            </div>
          </div>
          <Button onClick={()=>setOpen(true)} className="text-right" variant="outline">
            <Pen />
          </Button>
        </div>
        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span>p@p.com</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>24387547</span>
          </div>
        </div>
        <div className="my-5">
          <h1>skills</h1>
          <div className="flex items-center gap-1">
            {skills.length !== 0 ? (
              skills.map((item, index) => <Badge key={index}>{item}</Badge>)
            ) : (
              <span>NA</span>
            )}
          </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label classaName="text-md font-bold">Resume</Label>
          {isResume ? (
            <a
              href="https://youtube.com/"
              target="_blank"
              className="text-blue-500 w-full hover:underline cursor-pointer"
            >
              om
            </a>
          ) : (
            <span>NA</span>
          )}
        </div>
      </div>
      <div className="max-w-4xl mx-auto bg-white  rounded-2xl">
        <h1 className="font-bold text-lg my-5">All Aplied Jobs</h1>
        <AppliedJobTable />
      </div>
      <UpdateProfile open={open} setOpen={setOpen}/>
    </div>
  );
}

export default Profile;
