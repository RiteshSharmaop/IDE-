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
import BrainMesh from "./pages/BrainMesh";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
// import ExportBM from "../../brainmesh/Frontend/src/ExportBM";
// const Chat = ExportBM().Home

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
        {/* <Route path='/chat' element={
          <ProtectedRoute>
            <Home paymentDone={paymentDone} setPaymentDone={setPaymentDone}  />
          </ProtectedRoute>
        } /> */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <BrainMesh />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
