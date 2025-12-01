import React, { useEffect } from "react";
import { HashRouter, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import store from "./redux";
import AppRoutes from "./AppRoutes";
import "./scrollbar.css";
import "./App.scss";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createTheme, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "react-query";
import { useCookies } from "react-cookie";
import { server, useAxiosInterceptors } from "admin/config/server";
import useTokenRefresh from "admin/utils/useTokenRefresh";

const loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

const AppContent = () => {
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const location = useLocation();

  // Initialize Axios interceptors and token refresh only if not on the login page
  if (location.pathname !== "/#/admin/login") {
    useAxiosInterceptors();
    useTokenRefresh();
  }

  useEffect(() => {
    const refreshTokenOnLoad = async () => {
      if (cookies.accessToken) {
        try {
          await server.post("/refresh-token");
        } catch (error) {
          console.error("Failed to refresh token on load", error);
        }
      }
    };

    refreshTokenOnLoad();
  }, [cookies, setCookie]);

  return (
    <React.Suspense fallback={loading()}>
      <DndProvider backend={HTML5Backend}>
        <AppRoutes />
      </DndProvider>
    </React.Suspense>
  );
};

const App = () => {
  const queryClient = new QueryClient();
  const theme = createTheme({
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ToastContainer />
          <HashRouter>
            <AppContent />
          </HashRouter>
        </Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
