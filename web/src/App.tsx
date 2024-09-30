import { Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectRoute from "./components/ProtectRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorFallback from "./components/ErrorFallBack";
import { Spinner } from "./components/spinner";

const SignIn = lazy(() => import("./pages/SignIn"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const HomePage = lazy(() => import("./pages/HomePage"));

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <Routes>
          <Route path="/auth/sign-in" element={<SignIn />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/auth/reset-password/:id/:token"
            element={<ResetPassword />}
          />
          <Route
            path="/*"
            element={
              <ProtectRoute>
                <HomePage />
              </ProtectRoute>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
