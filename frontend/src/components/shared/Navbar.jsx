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
import axios from "axios";
import { Link as LinkScroll } from "react-scroll";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      const response = await axios.post(`${AUTH_API_END_POINT}/logout`, {}, {
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
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ROZGAR<span className="text-blue-700 dark:text-blue-300">HUB</span>
            </h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex font-medium items-center gap-5 text-foreground">
            {user && user.role === "employer" ? (
              <>
                <Link to="/admin/companies">
                  <li className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Companies</li>
                </Link>
                <Link to="/admin/jobs">
                  <li className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Jobs</li>
                </Link>
              </>
            ) : (
              <>
                <Link to="/">
                  <li className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</li>
                </Link>
                <Link to="/jobs">
                  <li className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Jobs</li>
                </Link>
                <Link to="/browse">
                  <li className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Browse</li>
                </Link>
                <LinkScroll
                  className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Signup
                </Button>
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
                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    {user?.fullname?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="flex items-center gap-3">
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={user?.profile?.profilePhoto}
                      alt="User Avatar"
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      {user?.fullname?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{user?.fullname}</h4>
                    <p className="text-sm text-muted-foreground">
                      {user?.profile?.bio}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col my-4 gap-4 ">
                  {user && user.role === "employee" && (
                    <div className="flex items-center gap-2">
                      <User2 />
                      <Button variant="link">
                        <Link to="/profile">View Profile</Link>
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <LogOut />
                    <Button onClick={logoutHandler} variant="link">
                      Logout
                    </Button>
                  </div>
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
                ) : (
                  <>
                    <Link to="/">
                      <li>Home</li>
                    </Link>
                    <Link to="/jobs">
                      <li>Jobs</li>
                    </Link>
                    <Link to="/browse">
                      <li>Browse</li>
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
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                      Signup
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  {user.role === "employee" && (
                    <Button variant="link">
                      <Link to="/profile">View Profile</Link>
                    </Button>
                  )}
                  <Button onClick={logoutHandler} variant="link">
                    Logout
                  </Button>
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
