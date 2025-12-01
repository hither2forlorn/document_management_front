import axios from "axios";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";

const SERVER_URL = process.env.REACT_APP_SERVER_URL.replace("localhost", window.location.hostname);
const server = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});

const AxiosPublic = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});

const useAxiosInterceptors = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["jwt"]);

  server.interceptors.request.use(
    (config) => {
      const token = cookies.accessToken;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  server.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await AxiosPublic.post("/refresh-token");
          server.defaults.headers.common["Authorization"] = `Bearer ${cookies?.accessToken}`;
          return server(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token");
        }
      }
    // Handle 400 errors (redirect to login)
      if (error.response?.status === 400) {
        removeCookie("jwt", { path: "/" });
        removeCookie("accessToken", { path: "/" });
        // ✅ Redirect to admin login
        window.location.href = "/#/admin/login"; // if using HashRouter
        // or use: window.location.replace("/admin/login"); // for BrowserRouter
      }
      return Promise.reject(error);
    }
  );
};

export { server, SERVER_URL, AxiosPublic, useAxiosInterceptors };
