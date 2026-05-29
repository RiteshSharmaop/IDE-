import axios from "axios";

export const verifyPaymentStatus = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}api/payment/verify-payment`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    if (res.data.success) {
      localStorage.setItem("paymentStatus", "paid");
      return true;
    }

    localStorage.removeItem("paymentStatus");
    return false;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
};

export const getLocalPaymentStatus = () => {
  return localStorage.getItem("paymentStatus") === "paid";
};

export const setLocalPaymentStatus = (isPaid) => {
  if (isPaid) {
    localStorage.setItem("paymentStatus", "paid");
  } else {
    localStorage.removeItem("paymentStatus");
  }
};
