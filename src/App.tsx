import { useEffect, useState } from "react";
import AppRoute from "./AppRoute";
import { UsersTbl } from "./types/UsersTbl";
import { UserContext } from "./useUserContext";
import { ToastContainer } from "react-toastify";
import { ConfigProvider } from "antd";
import themeCustom from "./ThemeCustom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";



function App() {
  const [user, setUser] = useState<UsersTbl | null>(() => {
    const strUser = localStorage.getItem("user");
    return strUser ? JSON.parse(strUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={themeCustom}>
          <UserContext.Provider value={{ user, setUser }}>
            <ToastContainer />
            <AppRoute />
          </UserContext.Provider>
        </ConfigProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
