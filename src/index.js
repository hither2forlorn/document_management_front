import React from "react";
import { ErrorBoundary } from "error/ErrorBoundary";
import { Fallback } from "error/Fallback";
import { createRoot } from "react-dom/client";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import App from "./App";
import { server } from "admin/config/server";

const container = document.getElementById("root");
const root = createRoot(container);

const errorHandler = (error, errorInfo) => {
  console.log("logging", error, errorInfo);
};

document.addEventListener("contextmenu", (event) => event.preventDefault());

root.render(
  <ErrorBoundary FallbackComponent={Fallback} onError={errorHandler}>
    <App />
  </ErrorBoundary>
);

// Clear all cookies on logout
const clearAllCookies = () => {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name] = cookie.split("=");
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

function logOutAfterTimeOut() {
  const timer = 20 * 60 * 1000; // 20 minutes in milliseconds
  
  // Shared state across tabs
  const ACTIVITY_KEY = 'lastUserActivity';
  const LOGOUT_EVENT_KEY = 'triggerLogout';

  let logoutTimer = setTimeout(async () => {
    await performLogout();
  }, timer);

  const updateActivityTime = () => {
    const now = Date.now();
    localStorage.setItem(ACTIVITY_KEY, now.toString());
  };

  const performLogout = async () => {
    await server.get("/user/logout");
    localStorage.clear();
    // clearAllCookies();  // Uncomment if you want to clear cookies on logout
    window.location.reload();
  };

  const resetTimer = () => {
    // Update activity time in localStorage (triggers cross-tab sync)
    updateActivityTime();
    
    // Reset timer in current tab
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(async () => {
      await performLogout();
    }, timer);
  };

  // Listen for storage events (cross-tab communication)
  const handleStorageChange = (event) => {
    if (event.key === ACTIVITY_KEY) {
      // Another tab detected activity, reset timer in this tab
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(async () => {
        await performLogout();
      }, timer);
    }
    
    if (event.key === LOGOUT_EVENT_KEY) {
      // Another tab triggered logout, log out from this tab too
      performLogout();
    }
  };

  // Initialize activity time if not set
  if (!localStorage.getItem(ACTIVITY_KEY)) {
    updateActivityTime();
  } else {
    // Check if we should log out based on existing activity time
    const lastActivity = parseInt(localStorage.getItem(ACTIVITY_KEY));
    const timeSinceLastActivity = Date.now() - lastActivity;
    
    if (timeSinceLastActivity >= timer) {
      performLogout();
    } else {
      // Set timer based on remaining time
      const remainingTime = timer - timeSinceLastActivity;
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(async () => {
        await performLogout();
      }, remainingTime);
    }
  }

  // User activity events for current tab
  const activityEvents = [
    "mousemove", "mousedown", "click", "scroll",
    "keypress", "keydown", "keyup", "focus", "change",
    "mouseover", "mouseout", "mouseup", "submit", "reset", "select",
    "touchstart", "touchend", "touchmove" // Add touch events for mobile
  ];

  // Add event listeners for user activity
  activityEvents.forEach((event) => {
    window.addEventListener(event, resetTimer);
  });

  // Listen for visibility changes (tab switching)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      // Tab became active, check if we need to reset timer
      resetTimer();
    }
  });

  // Listen for storage events from other tabs
  window.addEventListener("storage", handleStorageChange);

  // Cleanup function (optional, for when component unmounts)
  return () => {
    activityEvents.forEach((event) => {
      window.removeEventListener(event, resetTimer);
    });
    window.removeEventListener("storage", handleStorageChange);
    document.removeEventListener("visibilitychange", resetTimer);
    clearTimeout(logoutTimer);
  };
}

logOutAfterTimeOut();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorkerRegistration.register();