import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/user/logout`,
        {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials:true
          }
      );

     


      

      if (response.status === 201) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleLogout}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-700 hover:bg-red-600 text-white transition"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
