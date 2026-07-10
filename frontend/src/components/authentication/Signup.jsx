import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_API_END_POINT } from "@/utils/constant.js";
import { toast } from "sonner";
import api from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import { Loader2, ImagePlus } from "lucide-react";
import { AuthLayout, RoleSelector, PasswordInput } from "./AuthLayout";
import { useI18n } from "@/i18n/I18nProvider";

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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);
  const { lang } = useI18n();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input.role) {
      toast.error("Please select how you'll use RozgarHub.");
      return;
    }
    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("username", input.username);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("password", input.password);
    formData.append("role", input.role);
    formData.append("language", lang);
    if (input.file) {
      formData.append("file", input.file);
    }
    try {
      dispatch(setLoading(true));
      const res = await api.post(`${AUTH_API_END_POINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error, "ERROR IN SIGNUP PAGE");
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      navigate(user.role === "employer" ? "/admin/companies" : "/jobs");
    }
  }, [user, navigate]);

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever for job seekers — start in under two minutes."
    >
      <form onSubmit={submitHandler} className="space-y-5">
        <RoleSelector
          value={input.role}
          onChange={(role) => setInput({ ...input, role })}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="signup-fullname">Full name</Label>
            <Input
              id="signup-fullname"
              value={input.fullname}
              name="fullname"
              onChange={changeEventHandler}
              type="text"
              autoComplete="name"
              placeholder="Ramesh Kumar"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-username">Username</Label>
            <Input
              id="signup-username"
              value={input.username}
              name="username"
              onChange={changeEventHandler}
              type="text"
              autoComplete="username"
              placeholder="rameshk"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              value={input.email}
              name="email"
              onChange={changeEventHandler}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-phone">Phone number</Label>
            <Input
              id="signup-phone"
              value={input.phoneNumber}
              name="phoneNumber"
              onChange={changeEventHandler}
              type="tel"
              autoComplete="tel"
              placeholder="98765 43210"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <PasswordInput
            id="signup-password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="At least 6 characters"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-photo" className="flex items-center gap-1.5">
            <ImagePlus className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Profile photo <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="signup-photo"
            onChange={changeFileHandler}
            accept="image/*"
            type="file"
            className="cursor-pointer file:mr-3 file:font-medium file:text-foreground"
          />
          {input.file && (
            <p className="text-xs text-muted-foreground">Selected: {input.file.name}</p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Signup;
