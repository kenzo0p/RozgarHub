import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/authentication/Login";
import Signup from "./components/authentication/Signup";
import Home from "./components/Home";
import Jobs from "./components/Jobs";
import Browse from "./components/Browse";
import Profile from "./components/Profile";
import JobDetails from "./components/JobDetails";
import Companies from "./components/employer/Companies";
import CreateCompany from "./components/employer/CreateCompany";
import CompanySetup from "./components/employer/CompanySetup";
import EmployerJobs from "./components/employer/EmployerJobs";
import PostJob from "./components/employer/PostJob";
import Applicants from "./components/employer/Applicants";
import ProtectedRoute from "./components/employer/ProtectedRoute";
import ProtectedEmployeeRoute from "./components/ProtectedEmployeeRoute";
import ChatPage from "./components/ChatPage";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/chatSlice";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/jobs",
    element: (
      <ProtectedEmployeeRoute>
        <Jobs />
      </ProtectedEmployeeRoute>
    ),
  },
  {
    path: "/details/:id",
    element: (
      <ProtectedEmployeeRoute>
        <JobDetails />
      </ProtectedEmployeeRoute>
    ),
  },
  {
    path: "/browse",
    element: (
      <ProtectedEmployeeRoute>
        <Browse />
      </ProtectedEmployeeRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedEmployeeRoute>
        <Profile />
      </ProtectedEmployeeRoute>
    ),
  },
  {
    path: "/chat",
    element: <ChatPage />,
  },
  // for employer
  {
    path: "/admin/companies",
    element: (
      <ProtectedRoute>
        <Companies />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <ProtectedRoute>
        <CreateCompany />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <ProtectedRoute>
        <CompanySetup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <ProtectedRoute>
        <EmployerJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <ProtectedRoute>
        <PostJob />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <ProtectedRoute>
        <Applicants />
      </ProtectedRoute>
    ),
  },
]);
function App() {
  const { user } = useSelector((store) => store.auth);
  const {socket} = useSelector((store) => store.socketio)
  const dispatch = useDispatch();
  useEffect(() => {
    if (user) {
      const socketio = io("http://localhost:8000", {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });
      dispatch(setSocket(socketio));
      // listening all the events
      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      return () => {
        //cleanup if we left the page
        socketio.close();
        dispatch(setSocket(null));
      };
    } else if(socket) {
      socket?.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
}

export default App;