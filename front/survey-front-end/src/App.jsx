import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "./utils/mui-themes.js";
import RouterComponent from "./RouterComponent.jsx";
import Header from "./components/Header.jsx";
import { StoreProvider } from "./store/context.jsx";
import Box from "@mui/material/Box";

// TODO add snackbar for errors as fast as possible :)

function App() {
    const [themeMode, setThemeMode] = useState("light");
    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme) {
            setThemeMode(theme);
        }
    }, []);
    const theme = themeMode === "light" ? lightTheme : darkTheme;

    const toggleThemeMode = () => {
        setThemeMode(themeMode === "light" ? "dark" : "light");
        localStorage.setItem("theme", themeMode === "light" ? "dark" : "light");
    };

    return (
        <StoreProvider>
            <Box className="App" sx={{ padding: "1.5rem" }}>
                <ThemeProvider theme={theme}>
                    <Header
                        themeChecked={themeMode !== "light"}
                        toggleTheme={toggleThemeMode}
                    />
                    <CssBaseline />
                    <RouterComponent />
                </ThemeProvider>
            </Box>
        </StoreProvider>
    );
}

export default App;
