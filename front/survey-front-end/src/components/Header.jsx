import React from "react";
import {useContext} from "react";
import CustomizedSwitches from "./MUISwitch.jsx";
import {useTranslation} from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {StoreContext} from "../store/context.jsx";
import {useTheme} from "@mui/material/styles";
import CustomSelect from "./CustomSelect.tsx";

const lngs = {
    en: {name: "en"},
    ua: {name: "ua"},
    de: {name: "de"},
    pl: {name: "pl"},
    pt: {name: "pt"},
    es: {name: "es"},
    fr: {name: "fr"},
    it: {name: "it"},
    ro: {name: "ro"},
};

const Header = ({themeChecked, toggleTheme}) => {
    const {t, i18n} = useTranslation();
    const {isLoading} = useContext(StoreContext);

    const {
        palette: {mode},
    } = useTheme();

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLocalHandle = (lng) => {
        handleClose();
        i18n.changeLanguage(lng);
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            sx={{
                width: "100%",
                justifyContent: "space-between",
                p: 1,
                mb: "0.5rem",
                height: "4rem",
            }}
        >
            {!isLoading && (
                <CustomSelect handleChange={changeLocalHandle} value={i18n.resolvedLanguage} items={Object.keys(lngs)}/>
            )}

            {/*<Box sx={{marginLeft: "auto"}}>*/}
            {/*    <CustomizedSwitches*/}
            {/*        checked={themeChecked}*/}
            {/*        onChange={toggleTheme}*/}
            {/*    />*/}
            {/*</Box>*/}
        </Box>
    );
};

export default Header;
