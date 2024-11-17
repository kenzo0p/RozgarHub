
import Navbar from './components/shared/Navbar'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './components/authentication/Login'
import Signup from './components/authentication/Signup'
import Home from './components/Home'

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
