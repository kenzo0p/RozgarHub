import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './components/authentication/Login'
import Signup from './components/authentication/Signup'
import Home from './components/Home'
import Jobs from './components/Jobs'
import Browse from './components/Browse'
import Profile from './components/Profile'
import JobDetails from './components/JobDetails'
import Companies from './components/employer/Companies'
import CreateCompany from './components/employer/CreateCompany'
import CompanySetup from './components/employer/CompanySetup'
import EmployerJobs from './components/employer/EmployerJobs'
import PostJob from './components/employer/PostJob'

const appRouter = createBrowserRouter([
  {
    path:'/',
    element:<Home/>
  },
  {
    path:'/login',
    element:<Login/>
  },
  {
    path:'/signup',
    element:<Signup/>
  },
  {
    path:"/jobs",
    element:<Jobs/>
  },
  {
    path:"/details/:id",
    element:<JobDetails/>
  },
  {
    path:"/browse",
    element:<Browse/>
  },
  {
    path:"/profile",
    element:<Profile/>
  },
  // for employer
  {
    path:"/admin/companies",
    element:<Companies/>
  },{
    path:"/admin/companies/create",
    element:<CreateCompany/>
  },
  {
    path:"/admin/companies/:id",
    element:<CompanySetup/>
  },
  {
    path:"/admin/jobs",
    element:<EmployerJobs/>
  },
  {
    path:"/admin/jobs/create",
    element:<PostJob/>
  }
])
function App() {

  return (
    <>
     <RouterProvider router={appRouter}/>
    </>
  )
}

export default App
