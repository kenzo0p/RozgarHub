import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// ─── Eagerly loaded (needed immediately on first render) ─────────────────────
import Home from "./components/Home";
import Login from "./components/authentication/Login";
import Signup from "./components/authentication/Signup";
import ProtectedRoute from "./components/employer/ProtectedRoute";
import ProtectedEmployeeRoute from "./components/ProtectedEmployeeRoute";

// ─── Lazy loaded (code-split into separate chunks) ───────────────────────────
// These routes are loaded on-demand when the user navigates to them.
// This reduces the initial bundle size significantly — the employer admin
// section, for example, is never loaded for employee users.
const Jobs = lazy(() => import("./components/Jobs"));
const Browse = lazy(() => import("./components/Browse"));
const Profile = lazy(() => import("./components/Profile"));
const JobDetails = lazy(() => import("./components/JobDetails"));
const Companies = lazy(() => import("./components/employer/Companies"));
const CreateCompany = lazy(() => import("./components/employer/CreateCompany"));
const CompanySetup = lazy(() => import("./components/employer/CompanySetup"));
const EmployerJobs = lazy(() => import("./components/employer/EmployerJobs"));
const PostJob = lazy(() => import("./components/employer/PostJob"));
const Applicants = lazy(() => import("./components/employer/Applicants"));

/**
 * Loading fallback — shown while lazy-loaded route chunks are downloading.
 * In production, this appears for ~50-200ms depending on chunk size and connection.
 */
function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Wrap a lazy-loaded component with Suspense.
 */
function LazyRoute({ children }) {
  return <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>;
}

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
        <LazyRoute>
          <Jobs />
        </LazyRoute>
      </ProtectedEmployeeRoute>
    ),
  },
  {
    path: "/details/:id",
    element: (
      <ProtectedEmployeeRoute>
        <LazyRoute>
          <JobDetails />
        </LazyRoute>
      </ProtectedEmployeeRoute>
    ),
  },
  {
    path: "/browse",
    element: (
      <ProtectedEmployeeRoute>
        <LazyRoute>
          <Browse />
        </LazyRoute>
      </ProtectedEmployeeRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedEmployeeRoute>
        <LazyRoute>
          <Profile />
        </LazyRoute>
      </ProtectedEmployeeRoute>
    ),
  },
  // ─── Employer Routes (code-split — never loaded for employees) ──────────────
  {
    path: "/admin/companies",
    element: (
      <ProtectedRoute>
        <LazyRoute>
          <Companies />
        </LazyRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <ProtectedRoute>
        <LazyRoute>
          <CreateCompany />
        </LazyRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <ProtectedRoute>
        <LazyRoute>
          <CompanySetup />
        </LazyRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <ProtectedRoute>
        <LazyRoute>
          <EmployerJobs />
        </LazyRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <ProtectedRoute>
        <LazyRoute>
          <PostJob />
        </LazyRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <ProtectedRoute>
        <LazyRoute>
          <Applicants />
        </LazyRoute>
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
}

export default App;