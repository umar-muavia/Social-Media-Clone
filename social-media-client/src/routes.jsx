import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import App from "./App.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import CreatePost from "./pages/CreatePost";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import UpdateMyPost from "./pages/UpdateMyPost.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
      <Route path="/" element={<App />}>
        <Route index element={<Register />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route
          path="create-post"
          element={<ProtectedRoute element={CreatePost} />}
        />
        <Route
          path="my-posts/edit/:id"
          element={<ProtectedRoute element={UpdateMyPost} />}
        />
        <Route
          path="dashboard"
          element={<ProtectedRoute element={Dashboard} />}
        />
        <Route path="profile" element={<ProtectedRoute element={Profile} />} />
      </Route>
  )
);

export default router;
