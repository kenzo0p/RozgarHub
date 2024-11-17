import React,{useState} from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";


function Signup() {
  const [input, setInput] = useState({
    username: "",
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    file: "",
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] });
  };

  const submitHandler =async (e) =>{
    e.preventDefault();
    console.log(input)
  }

  return (
    <div>
      <div>
        ROZAGAR<span>HUB</span>
      </div>
      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <form
          onSubmit={submitHandler}
          className="w-1/2 border border-gray-200 rounded-md p-4 my-10"
        >
          <h1 className="font-bold text-xl mb-5">Sign Up</h1>
          <div className="my-2">
            <Label>Full Name</Label>
            <Input
              value={input.fullname}
              name="fullname"
              onChange={changeEventHandler}
              type="text"
              placeholder="Enter your full name"
            />
          </div>
          <div className="my-2">
            <Label>Enter your username</Label>
            <Input
              type="text"
              value={input.username}
              name="username"
              onChange={changeEventHandler}
              placeholder="Enter your username"
            />
          </div>
          <div className="my-2">
            <Label>Enter your email</Label>
            <Input
              value={input.email}
              name="email"
              onChange={changeEventHandler}
              type="email"
              placeholder="xyz@gmail.com"
            />
          </div>
          <div className="my-2">
            <Label>Phone number</Label>
            <Input
              value={input.phoneNumber}
              name="phoneNumber"
              onChange={changeEventHandler}
              type="number"
              placeholder="+91 XXXXX-XXXXX"
            />
          </div>
          <div className="my-2">
            <Label>Enter your password</Label>
            <Input
              value={input.password}
              name="password"
              onChange={changeEventHandler}
              type="password"
              placeholder="password"
            />
          </div>
          <div className="flex items-center justify-between">
            <RadioGroup className="flex  my-5 items-center gap-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  checked={input.role === 'employee'}
                  onChange={changeEventHandler}
                  value="employee"
                  className="cursor-pointer"
                />
                <Label htmlFor="r1">Employee</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  name="role"
                  value="employer"
                  checked={input.role === 'employer'}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="r2">Employer</Label>
              </div>
            </RadioGroup>
            <div className="flex items-center gap-2">
              <Label>Profile</Label>
              <Input
                onChange={changeFileHandler}
                accept="image/*"
                type="file"
                className="cursor-pointer"
              />
            </div>
          </div>
          <Button type="submit" className="w-full my-4">
            Signup
          </Button>
          <span className="text-sm">
            Alreadt have an account{" "}
            <Link to="login" className="text-blue-600">
              Login
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
}


export default Signup;
