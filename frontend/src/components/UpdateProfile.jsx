import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

function UpdateProfile({ open, setOpen }) {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    fullname: user?.fullname,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
    bio: user?.profile?.bio,
    skills:user?.profile?.skills?.map((skill)=>skill),
    file:user?.profile?.resume
  });

  const changeEventHandler = (e)=>{
    setInput({...input,[event.target.name]:e.target.value})
  }

  const fileChangeHandler = (e)=>{
    const file = e.target.files?.[0]
    setInput({...input , file})
  }

  const submitHandler = (e)=>{
    e.preventDefault()
  }


  return (
    <div>
      <Dialog open={open}>
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={() => setOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitHandler}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name">Name</Label>
                <Input type="text" id="name" onChange={changeEventHandler} value={input.fullname} className="col-span-3" name="name" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email">email</Label>
                <Input type="email" id="email" className="col-span-3" onChange={changeEventHandler} value={input.email} name="email" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number">Number</Label>
                <Input id="number" className="col-span-3" value={input.phoneNumber} onChange={changeEventHandler} name="number" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio">bio</Label>
                <Input id="bio" onChange={changeEventHandler} value={input.bio} className="col-span-3" name="bio" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="skills">skills</Label>
                <Input value={input.skills} id="skills" onChange={changeEventHandler} className="col-span-3" name="skills" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file">resume</Label>
                <Input
                  type="file"
                  id="file"
                  onChange={fileChangeHandler}
                  value={input.file}
                  accept="application/pdf"
                  className="col-span-3"
                  name="file"
                />
              </div>
            </div>
            <DialogFooter>
              {loading ? (
                <Button className="w-full my-4">
                  <Loader2 className="mr-2  h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button type="submit" className="w-full my-4">
                  Update
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UpdateProfile;