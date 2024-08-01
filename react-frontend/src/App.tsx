import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import AuthRoutes from "./components/AuthRoutes";
import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";

const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const Home = lazy(() => import("./pages/Home"));

const VerifyEmail = lazy(() => import("./pages/VerifyEmailPage"));

<Suspense></Suspense>;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Navbar />}>
      <Route element={<RequireAuth />}>
        <Route
          index
          element={
            <Suspense>
              <Home />
            </Suspense>
          }
        />
      </Route>
      <Route element={<AuthRoutes />}>
        <Route
          path="register"
          element={
            <Suspense>
              <RegisterPage />
            </Suspense>
          }
        ></Route>
        <Route
          path="login"
          element={
            <Suspense>
              <LoginPage />
            </Suspense>
          }
        ></Route>
        <Route
          path="verifyemail"
          element={
            <Suspense>
              <VerifyEmail />
            </Suspense>
          }
        ></Route>
      </Route>
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
