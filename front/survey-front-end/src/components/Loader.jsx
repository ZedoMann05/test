import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CustomizedSwitches from "./MUISwitch.jsx";

const Loader = () => {
    return (
        <Box
            sx={{
                background: "rgba(0, 0, 0, 0.2)",
                opacity: "1",
                transition: "opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                position: "fixed",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <CircularProgress size={100} color="warning" />
        </Box>
    );
};

export default Loader;
