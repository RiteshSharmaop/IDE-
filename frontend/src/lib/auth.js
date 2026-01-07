export * from "./auth.jsx";
export function getAuthToken() {
  return localStorage.getItem("token");
}
