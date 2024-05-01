import {useEffect, useContext} from "react";
import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {StoreContext} from "../store/context.jsx";

import Loader from "./Loader.jsx";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";
// TODO extract card and rating in separate components

const Questioner = () => {
    const {t, i18n} = useTranslation();
    const {sharedCode} = useParams();
    const {
        fetchSurveyorData,
        isLoading,
        rating,
        setRatingHandler,
        sendRating,
        addReview,
        locationImage,
        locationAddress,
        locationName,
        rated,
        campaignId,
        introText,
        services,
    } = useContext(StoreContext);

    useEffect(() => {
        fetchSurveyorData(sharedCode);
    }, [sharedCode]);

    const textGenerator = () => {
        if (!(Object.keys(introText).length > 0)) return t("rate_us");
        return introText[i18n.resolvedLanguage] ? introText[i18n.resolvedLanguage] : t("rate_us");
    };

    const handleSubmit = () => {
        return services?.length ? addReview : sendRating
    }

    const getLabel = () => {
        return services?.length ? t("rate_and_leave_review") : t("rate")
    }

    if (isLoading) return <Loader/>;

    return (<Container
        maxWidth="sm"
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '36px',
            boxSizing: "border-box"
        }}
    >
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            p: '36px 60px',
            bgcolor: '#fff',
            borderRadius: '24px',
            boxShadow: '0px 0px 40px 0px rgba(98, 120, 128, 0.15)'
        }}>
            {locationImage && (<CardMedia
                component="img"
                sx={{
                    height: "100%", maxWidth: "120px", maxHeight: "120px", objectFit: "contain",
                }}
                image={locationImage}
                alt="Paella dish"
            />)}

            {locationName && (<Typography
                variant="inherit"
                gutterBottom
                align="center"
                sx={{
                    m: 0, fontWeight: "500", fontSize: '24px',
                }}
            >
                {locationName}
            </Typography>)}

            {locationAddress && (<Typography
                variant="inherit"
                gutterBottom
                align="center"
                sx={{
                    m: 0, fontSize: '16px',
                }}
            >
                {locationAddress}
            </Typography>)}
        </Box>

        {campaignId && (<Grid container gap={3} sx={{maxWidth: '444px'}}>
            <Grid item xs={12}>
                <Typography
                    variant="h4"
                    gutterBottom
                    align="center"
                    sx={{
                        m: 0, fontWeight: '500', fontSize: '18px',
                    }}
                >
                    {!!introText ? textGenerator() : t("rate_us")}
                </Typography>
            </Grid>
            <Grid
                item
                xs={12}
                sx={{
                    display: "flex", justifyContent: "center", alignItems: "center",
                }}
            >
                <Rating
                    name="simple-controlled"
                    value={rating}
                    onChange={(event, newValue) => {
                        setRatingHandler(newValue);
                    }}
                    size="large"
                    icon={<svg width="41" height="40" viewBox="0 0 41 40" fill="none"
                               xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M38.9116 13.9043L27.8044 12.8541C27.1043 12.7904 26.4992 12.3448 26.2131 11.6765L22.2348 2.03309C21.5982 0.441769 19.3382 0.441769 18.7017 2.03309L14.7552 11.6765C14.5006 12.3448 13.864 12.7904 13.1639 12.8541L2.05636 13.9043C0.401371 14.0635 -0.266989 16.1322 0.97425 17.2461L9.34466 24.598C9.88572 25.0754 10.1085 25.7756 9.94937 26.4758L7.43506 36.7872C7.05314 38.4107 8.80361 39.7471 10.2676 38.8881L19.5292 33.4454C20.1339 33.0953 20.8659 33.0953 21.4706 33.4454L30.7325 38.8881C32.1965 39.7471 33.947 38.4425 33.5648 36.7872L31.0823 26.4758C30.9231 25.7756 31.1459 25.0754 31.687 24.598L40.0574 17.2461C41.2668 16.1322 40.5666 14.0635 38.9116 13.9043Z"
                            fill="#F2BB03"/>
                    </svg>
                    }
                    emptyIcon={<svg width="42" height="40" viewBox="0 0 42 40" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M25.7887 12.0579L25.7886 12.0579L25.7938 12.0701C26.2194 13.0643 27.1346 13.7512 28.2121 13.8498C28.2127 13.8499 28.2133 13.8499 28.2139 13.85L39.3159 14.8998C39.3161 14.8998 39.3163 14.8998 39.3165 14.8998C40.1218 14.9777 40.4395 15.9842 39.8869 16.5041L31.5271 23.8467L31.5254 23.8482C30.7081 24.5693 30.3675 25.6428 30.6071 26.6974L30.6071 26.6974L30.61 26.7099L33.0904 37.0122C33.0907 37.0135 33.091 37.0148 33.0913 37.0161C33.2767 37.8325 32.4287 38.4304 31.7387 38.0257C31.7386 38.0256 31.7386 38.0256 31.7386 38.0256L22.4773 32.5833L22.4773 32.5833L22.4717 32.58C21.557 32.0505 20.4428 32.0505 19.5282 32.58L19.5281 32.58L19.5225 32.5833L10.2616 38.0256C9.58003 38.4255 8.72418 37.8113 8.90773 37.0195C8.90798 37.0184 8.90824 37.0173 8.90849 37.0162L11.4209 26.7127L11.4228 26.7051L11.4245 26.6974C11.6642 25.6428 11.3235 24.5693 10.5063 23.8482L10.5046 23.8467L2.13886 16.4989C1.53849 15.9555 1.88116 14.9746 2.65126 14.8999C2.65153 14.8998 2.6518 14.8998 2.65207 14.8998L13.7544 13.85C13.7551 13.8499 13.7557 13.8499 13.7564 13.8498C14.8017 13.754 15.7809 13.0902 16.1848 12.0452L20.1272 2.41188L20.1272 2.41189L20.1302 2.40451C20.4314 1.65134 21.505 1.65134 21.8063 2.40451L21.8062 2.40454L21.8104 2.41449L25.7887 12.0579Z"
                            fill="white" stroke="#869399" strokeWidth="2"/>
                    </svg>}
                    sx={{
                        fontSize: '44px',
                    }}
                />
            </Grid>
            <Grid
                item
                xs={12}
                sx={{
                    display: "flex", justifyContent: "center", alignItems: "center",
                }}
            >
                <Button
                    variant="contained"
                    sx={{
                        fontSize: '14px', fontWeight: 500, minWidth: "160px", textTransform: 'none'
                    }}
                    color="primary"
                    disabled={!rating || rated}
                    onClick={handleSubmit()}
                >
                    {getLabel()}
                </Button>
            </Grid>
        </Grid>)}
    </Container>);
};

export default Questioner;
