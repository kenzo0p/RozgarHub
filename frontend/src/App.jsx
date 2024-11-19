import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './components/authentication/Login'
import Signup from './components/authentication/Signup'
import Home from './components/Home'
import Jobs from './components/Jobs'

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
  }
])
function App() {

  return (
    <>
     <RouterProvider router={appRouter}>

     </RouterProvider>
    </>
  )
}

export default App
