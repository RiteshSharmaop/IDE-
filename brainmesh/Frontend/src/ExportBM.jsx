import React from "react";  
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



export default function ExportBM() {
    Home,
    Loading,
    Payment,
    PaymentSuccess,
    PaymentCancel,
    ForgetPasswordPage,
    UserProfilePage

}