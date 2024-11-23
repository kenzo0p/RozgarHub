import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { LogOut, User2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";
// import { Link } from "react-router-dom";

function Navbar() {
  const {user} = useSelector(store=>store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const logoutHandler = async()=>{
    try {
      const response = await axios.get(`${USER_API_END_POINT}/logout`,{withCredentials:true})
      if(response.data.success){
        dispatch(setUser(null))
        navigate("/")
        toast.success(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    }
  }
  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16">
        <div>
          <Link to="/"><h1 className="text-2xl font-bold text-blue-600">
            ROZGAR<span className="text-blue-700">HUB</span>
          </h1></Link>
        </div>
        <div className="flex items-center gap-12">
          <ul className="flex font-medium items-center gap-5">
            <Link to='/'><li>Home</li></Link>
            <Link to='/jobs'><li>Jobs</li></Link>
            <Link to='/browse'><li>Browse</li></Link>
          </ul>
          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to={"/signup"}>
                <Button className="bg-[#2A9DF4] hover:bg-[#1989de]">
                  Signup
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="flex items-center gap-3">
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                  </Avatar>
                  <div>
                    <h4 className="font-medium">Om Bhor</h4>
                    <p className="text-sm text-muted-foreground-200">
                      Lorem ipsum dolor{" "}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col my-4 gap-4 ">
                  <div className="flex items-center gap-2">
                    <User2 />
                    <Button variant="link"><Link to="/profile">View Profile</Link></Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <LogOut />
                    <Button onClick={logoutHandler} variant="link">Logout</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
