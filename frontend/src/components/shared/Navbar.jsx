import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { LogOut, Menu, User2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";
import { AUTH_API_END_POINT } from "../../utils/constant.js";
import api from "@/lib/api";
import { Link as LinkScroll } from "react-scroll";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      const response = await api.post(`${AUTH_API_END_POINT}/logout`, {}, {
        withCredentials: true,
      });
      if (response.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Logout failed.");
    }
  };

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 shadow-sm border-b border-border sticky top-0">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4">
        {/* Logo */}
        <div>
          <Link to="/">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Rozgar<span className="text-primary">Hub</span>
            </h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex font-medium items-center gap-5 text-foreground">
            {user && user.role === "employer" ? (
              <>
                <Link to="/admin/companies">
                  <li className="hover:text-primary transition-colors">Companies</li>
                </Link>
                <Link to="/admin/jobs">
                  <li className="hover:text-primary transition-colors">Jobs</li>
                </Link>
              </>
            ) : user ? (
              /* Logged-in employee — the landing page redirects away, so no
                 Home/About links here */
              <>
                <Link to="/jobs">
                  <li className="hover:text-primary transition-colors">Jobs</li>
                </Link>
                <Link to="/profile">
                  <li className="hover:text-primary transition-colors">My applications</li>
                </Link>
              </>
            ) : (
              <>
                <Link to="/">
                  <li className="hover:text-primary transition-colors">Home</li>
                </Link>
                <Link to="/jobs">
                  <li className="hover:text-primary transition-colors">Jobs</li>
                </Link>
                <LinkScroll
                  className="cursor-pointer hover:text-primary transition-colors"
                  to="about"
                  smooth={true}
                  duration={500}
                  offset={-50}
                >
                  About us
                </LinkScroll>
              </>
            )}
          </ul>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {user && <NotificationBell />}
          </div>

          {/* Authentication Buttons */}
          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Signup</Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={user?.profile?.profilePhoto}
                    alt="User Avatar"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.fullname?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-0">
                {/* Identity header */}
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.profile?.profilePhoto}
                      alt=""
                    />
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {user?.fullname?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user?.fullname}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Menu */}
                <div className="p-1.5">
                  {user?.role === "employee" ? (
                    <Link
                      to="/profile"
                      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <User2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      View profile
                    </Link>
                  ) : (
                    <Link
                      to="/admin/companies"
                      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <User2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      My companies
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logoutHandler}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Dropdown Menu for Mobile */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          {user && <NotificationBell />}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <ul className="flex flex-col gap-2">
                {user && user.role === "employer" ? (
                  <>
                    <Link to="/admin/companies">
                      <li>Companies</li>
                    </Link>
                    <Link to="/admin/jobs">
                      <li>Jobs</li>
                    </Link>
                  </>
                ) : user ? (
                  <>
                    <Link to="/jobs">
                      <li>Jobs</li>
                    </Link>
                    <Link to="/profile">
                      <li>My applications</li>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/">
                      <li>Home</li>
                    </Link>
                    <Link to="/jobs">
                      <li>Jobs</li>
                    </Link>
                    <LinkScroll
                      className="cursor-pointer"
                      to="about"
                      smooth={true}
                      duration={500}
                      offset={-50}
                    >
                      About us
                    </LinkScroll>
                  </>
                )}
              </ul>
              {!user ? (
                <div className="flex flex-col gap-2 mt-4">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full">
                      Signup
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3">
                  {user.role === "employee" && (
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <User2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      View profile
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logoutHandler}
                    className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
