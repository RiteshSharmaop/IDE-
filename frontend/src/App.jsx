import CodeIDE from "./pages/CodeIDE"
import NotFound from "./pages/NotFound"
import  Login  from "./pages/Login"
import  Signup  from "./pages/Signup"
import { Routes, Route } from "react-router-dom";
import StartingPage from "./pages/StartingPage";

function App() {
  return (
    <>  
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/" element={<StartingPage />} />
        <Route path="/home" element={<CodeIDE />} />
        <Route path="/not-found" element={<NotFound />} />
      </Routes>
    
    </>
  )
}

export default App