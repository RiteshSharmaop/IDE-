import CodeIDE from "./pages/CodeIDE";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Routes, Route } from "react-router-dom";
import StartingPage from "./pages/StartingPage";
import { ProtectedRoute } from "./lib/auth";
import IDE from "./pages/IDE";

function App() {
  return (
    <>
      <Routes>
         <Route path="/" element={<IDE />} />
        {/* <Route path="/" element={<StartingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <CodeIDE />
            </ProtectedRoute>
          }
        />
        <Route path="/not-found" element={<NotFound />} /> */}
      </Routes>
    </>
  );
}

export default App;
