import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";
import { AuthLayout, RoleSelector, PasswordInput } from "./AuthLayout";

function Login() {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input.role) {
      toast.error("Please select how you use RozgarHub.");
      return;
    }
    try {
      dispatch(setLoading(true));
      const res = await api.post(`${AUTH_API_END_POINT}/login`, input);
      if (res.data.success) {
        const loggedInUser = res.data.data.user;
        dispatch(setUser(loggedInUser));
        // Land users where their work is, not on the marketing page
        navigate(loggedInUser.role === "employer" ? "/admin/companies" : "/jobs");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
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
      title="Welcome back"
      subtitle="Log in to continue your job search or manage your postings."
    >
      <form onSubmit={submitHandler} className="space-y-5">
        <RoleSelector
          value={input.role}
          onChange={(role) => setInput({ ...input, role })}
        />

        <div className="space-y-1.5">
          <Label htmlFor="login-username">Username</Label>
          <Input
            id="login-username"
            value={input.username}
            name="username"
            onChange={changeEventHandler}
            type="text"
            autoComplete="username"
            placeholder="yourusername"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            value={input.email}
            name="email"
            onChange={changeEventHandler}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password">Password</Label>
          <PasswordInput
            id="login-password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="Your password"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Logging in…
            </>
          ) : (
            "Log in"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Sign up free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
