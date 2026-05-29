import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "../Components/Loading";
import { UserDataContext } from "../context/UserContext";

function UserProtectedWrapper({ children }) {
  const navigate = useNavigate();
  const { user, setUser, token } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch user details
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 201) {
          setUser(response.data.data.user);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [token, navigate, setUser]); // only runs when token changes

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}

export default UserProtectedWrapper;
