import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setUser } from "./redux/authSlice";
import { useI18n } from "./i18n/I18nProvider";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import PwaBanner from "./components/shared/PwaBanner";

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
const FindWorkers = lazy(() => import("./components/employer/FindWorkers"));

/**
 * Loading fallback — shown while lazy-loaded route chunks are downloading.
 * In production, this appears for ~50-200ms depending on chunk size and connection.
 */
function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Loading...</p>
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
  {
    path: "/admin/workers",
    element: (
      <ProtectedRoute>
        <LazyRoute>
          <FindWorkers />
        </LazyRoute>
      </ProtectedRoute>
    ),
  },
]);

function App() {
  const dispatch = useDispatch();
  const { setLang } = useI18n();
  const userLanguage = useSelector((store) => store.auth.user?.language);

  // Listen for session expiry events from the Axios interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch(setUser(null));
      toast.error("Session expired. Please log in again.");
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, [dispatch]);

  // Hydrate the UI language from the logged-in account, so a returning user
  // sees the app in the language they saved — even on a fresh device where
  // localStorage hasn't got their choice yet.
  useEffect(() => {
    if (userLanguage) setLang(userLanguage);
  }, [userLanguage, setLang]);

  return (
    <ErrorBoundary>
      <PwaBanner />
      <RouterProvider router={appRouter} />
    </ErrorBoundary>
  );
}

export default App;