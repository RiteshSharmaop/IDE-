import CodeIDE from "./pages/CodeIDE";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTPVerification from "./pages/OTPVerification";
import { Routes, Route } from "react-router-dom";
import StartingPage from "./pages/StartingPage";
import { ProtectedRoute,PublicRoute } from "./lib/auth";
import IDE from "./pages/IDE";
import IDE2 from "./pages/IDE2";
import ShareDialog from "./components/ShareDialog";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <>
      <Routes>
        {/* <Route path="/" element={<CodeIDE />} />
         <Route path="/test" element={<IDE2 />} /> */}
        <Route path="/" element={
          <PublicRoute>
            <StartingPage />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route path="/verify-otp" element={
          <PublicRoute>
            <OTPVerification />
          </PublicRoute>
          
        } />
        <Route path="/signin" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
         
        } />
        <Route
          path="/e/:roomId"
          element={
            <ProtectedRoute>
              <CodeIDE />
            </ProtectedRoute>
          }
        />
        <Route path="/share" element={<ShareDialog />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
