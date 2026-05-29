
import Home from "./Components/Home"
import LoginPage from "./Pages/LoginPage"
import SignupPage from "./Pages/SignupPage"
import { Navigate, Route, Routes } from 'react-router-dom'
import UserProtectedWrapper from "./Pages/UserProtectedWrapper"
import Loading from "./Components/Loading"
import Payment from "./Components/Payment/Payment"
import { useState } from "react"
import PaymentSuccess from "./Components/Payment/PaymentSuccess"
import PaymentCancel from "./Components/Payment/PaymentCancel"
import ForgetPasswordPage from "./Pages/ForgetPasswordPage"
import UserProfilePage from "./Pages/UserProfilePage"


function App() {
  const [paymentDone, setPaymentDone] = useState(false);
  return (

    <>
      <Routes>
        <Route path='/' element= {<Navigate to="/chat" replace />} />
        <Route path='/profile' element= {<UserProfilePage/>} />

        {/* <Route path='/login' element= {<LoginPage/>}/> */}
        {/* <Route path='/forget-password' element= {<ForgetPasswordPage/>}/> */}
        {/* <Route path='/register' element= {<SignupPage/>}/> */}
        <Route path='/chat' element={
          <UserProtectedWrapper>
            <Home paymentDone={paymentDone} setPaymentDone={setPaymentDone}  />
          </UserProtectedWrapper>
        } />
      <Route
        path="/payment"
        element={
          <UserProtectedWrapper>
            <Payment setPaymentDone={setPaymentDone} />
          </UserProtectedWrapper>
        }
      />
      <Route path="/success" element={
        <UserProtectedWrapper>
          <PaymentSuccess paymentDone={paymentDone} setPaymentDone={setPaymentDone} />
        </UserProtectedWrapper>
      } />
      <Route path="/cancel" element={
        
        <UserProtectedWrapper>
          <PaymentCancel paymentDone={paymentDone} setPaymentDone={setPaymentDone} />
        </UserProtectedWrapper>
        } />
      </Routes>
      
    </>
  )
}

export default App
