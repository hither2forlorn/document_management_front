import { server } from "admin/config/server";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const useTokenRefresh = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["jwt"]);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    const currentUrl = window.location.href;

    if (currentUrl.includes("/#/admin/login")) {
      console.log("On login page, not tracking activity");
      return;
    }

    let inactivityTimeout;

    // Reset inactivity timer
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        logoutUser();
      }, 10 * 60 * 1000); // 10 minutes
    };

    // Refresh token
    const refreshToken = async () => {
      if (isLoggedOut) return;
      try {
        await server.post("/refresh-token");

        // Optional: also count refresh as activity
        resetInactivityTimer();
      } catch (error) {
        console.error("Failed to refresh token", error);
      }
    };

    // 🖱️ Keyboard / Mouse / Scroll activity
    const handleUserActivity = () => {
      if (isLoggedOut) return;
      // Broadcast activity to other tabs
      localStorage.setItem("lastActivity", Date.now().toString());

      resetInactivityTimer();
    };

    // Logout
    const logoutUser = async () => {
      console.log("User logged out due to inactivity");
      clearTimeout(inactivityTimeout);

      try {
        await server.get("/user/logout");
        setIsLoggedOut(true);
        window.location.reload();
      } catch (error) {
        console.error("Failed to logout user", error);
      }
    };

    // 🔄 Sync activity across tabs (with debounce)
    let lastSynced = 0;
    const syncActivity = (event) => {
      if (event.key === "lastActivity") {
        const now = Date.now();
        if (now - lastSynced > 1000) {
          console.log("Synced activity from another tab");
          resetInactivityTimer();
          lastSynced = now;
        }
      }
    };

    if (!currentUrl.includes("/#/admin/login")) {
      document.addEventListener("mousemove", handleUserActivity);
      document.addEventListener("keydown", handleUserActivity);
      document.addEventListener("click", handleUserActivity);
      document.addEventListener("scroll", handleUserActivity);

      // Listen for activity from other tabs
      window.addEventListener("storage", syncActivity);
    }

    // Refresh token every 8 minutes
    const refreshInterval = setInterval(refreshToken, 8 * 60 * 1000);

    // Start timer immediately
    handleUserActivity();

    return () => {
      document.removeEventListener("mousemove", handleUserActivity);
      document.removeEventListener("keydown", handleUserActivity);
      document.removeEventListener("click", handleUserActivity);
      document.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("storage", syncActivity);

      clearTimeout(inactivityTimeout);
      clearInterval(refreshInterval);
    };
  }, [removeCookie, isLoggedOut]);

  return null;
};

export default useTokenRefresh;
