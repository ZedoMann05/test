import React, {createContext, useState} from "react";
import {useTranslation} from "react-i18next";
import {
    getSurveyorData,
    sendRatingData,
    sendReview,
} from "../services/httpService.js";
import {useNavigate} from "react-router-dom";

export const StoreContext = createContext();

const INITIAL_STATE = {
    isLoading: false,
    rating: null,
    rated: false,
    contactPhoneEnabled: 0,
    contactEmailEnabled: 0,
    // surveyReviewId: 1, // need for testing
};

export const StoreProvider = ({children}) => {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate();
    const [state, setState] = useState(INITIAL_STATE);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        msg: "",
        checked: false,
        error: false,
        nameError: false,
        valid: false,
        submitted: false,
    });
    const currentURL = window.location.href;
    const baseURLToValidate = "https://rateme.getpin.com/";
    const isProdURL = currentURL.startsWith(baseURLToValidate);

    const setRatingHandler = (rating) =>
        setState((prevState) => ({...prevState, rating}));

    const sendRatingHandler = () => {
        setState((prevState) => ({...prevState, isLoading: true}));

        const payload = {
            survey_campaign_id: state?.survey_campaign_id,
            rating: state?.rating,
        };
        return sendRatingData(payload)
            .then((response) => {
                setState((prev) => ({
                    ...prev,
                    surveyReviewId: response?.data?.id,
                    contactPhoneEnabled: response?.data?.campaign?.contact_phone_enabled,
                    contactEmailEnabled: response?.data?.campaign?.contact_email_enabled,
                    rated: true,
                    isLoading: false,
                }));
                // Google tag manager
                if (isProdURL) {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: "rate",
                        rating: state?.rating,
                    });
                }
                return true;
            })
            .catch((e) => {
                setState((prev) => ({...prev, isLoading: false}));
                console.log("e:", e.message);
            });
    };

    const sendRating = async () => {
        //testing
        // navigate("/thank-you");
        sendRatingHandler().then((res) => {
            if (res) {
                if (state?.rating < 4) {
                    navigate("/feedback-form");
                } else {
                    navigate("/thank-you");
                }
            }
        });
    };
    const addReview = async () => {
        // testing
        // if (state?.rating < 4) {
        //     navigate("/feedback-form");
        // } else {
        //     if (state?.services?.length === 1) {
        //         window.open(state?.services[0]?.url, "_blank");
        //     } else {
        //         navigate("/choose-platform");
        //     }
        // }
        sendRatingHandler().then((res) => {
            if (res) {
                if (state?.rating < 4) {
                    navigate("/feedback-form");
                } else {
                    navigate("/choose-platform");
                }
            }
        });
    };
    const formHandler = (e) => {
        if (e.target.id === "checked") {
            setForm((prev) => ({...prev, [e.target.id]: e.target.checked}));
        } else {
            setForm((prev) => ({...prev, [e.target.id]: e.target.value}));
        }
        validateForm();
    };

    const validateForm = () => {
        let error = false;
        let valid = true;
        let nameError = false;
        if (state.contactPhoneEnabled && !form.phone) {
            error = true;
        } else if (state.contactEmailEnabled && !form.email) {
            error = true;
        } else {
            if (state.contactPhoneEnabled && form.phone && !/^(\+)?\d{5,14}$/.test(form.phone)) {
                error = true;
            }
            if (state.contactEmailEnabled && form.email && !/\S+@\S+\.\S+/.test(form.email)) {
                error = true;
            }
        }
        if (error || !form.name || !form.msg || form.msg.length > 3000)
            valid = false;
        if (!form.name) {
            nameError = true;
        }
        setForm((prev) => ({...prev, error, valid, nameError}));
    };
    const sendReviewHandler = async () => {
        setState((prevState) => ({...prevState, isLoading: true}));
        const payload = {
            survey_review_id: state.surveyReviewId,
            user_name: form.name,
            review: form.msg,
        };
        if (state.contactPhoneEnabled && form.phone && /^(\+)?\d{5,14}$/.test(form.phone))
            payload.phone = form.phone;
        if (state.contactEmailEnabled && form.email && /\S+@\S+\.\S+/.test(form.email))
            payload.email = form.email;
        try {
            await sendReview(payload);
            setForm((prev) => ({...prev, submitted: true}));
            // Google tag manager
            if (isProdURL) {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: "submit_review",
                    rating: state?.rating,
                });
            }
        } catch (e) {
            console.log("e:", e.message);
        }

        setState((prevState) => ({...prevState, isLoading: false}));
    };

    const fetchSurveyorData = async (sharedCode) => {
        setState((prevState) => ({...prevState, isLoading: true}));
        try {
            const {data} = await getSurveyorData(sharedCode);
            if (data) {
                data.locationAddress = preparedLocationName({
                    country: data?.country,
                    locality: data?.locality,
                    route: data?.route,
                });
                if (data.regionCode === "UA" || data.regionCode === "Kiev") {
                    i18n.changeLanguage("ua");
                }
                if (
                    data.regionCode === "GB" ||
                    data.regionCode === "US" ||
                    data.regionCode === "CA"
                ) {
                    i18n.changeLanguage("en");
                }
                if (
                    data.regionCode === "ES" ||
                    data.regionCode === "AR" ||
                    data.regionCode === "MX" ||
                    data.regionCode === "CL" ||
                    data.regionCode === "CO" ||
                    data.regionCode === "PE" ||
                    data.regionCode === "VE" ||
                    data.regionCode === "EC" ||
                    data.regionCode === "GT" ||
                    data.regionCode === "CU" ||
                    data.regionCode === "BO" ||
                    data.regionCode === "DO" ||
                    data.regionCode === "HN" ||
                    data.regionCode === "PY" ||
                    data.regionCode === "SV" ||
                    data.regionCode === "NI" ||
                    data.regionCode === "CR" ||
                    data.regionCode === "PA" ||
                    data.regionCode === "PR" ||
                    data.regionCode === "UY" ||
                    data.regionCode === "GQ"
                ) {
                    i18n.changeLanguage("es");
                }
                if (data.regionCode === "FR") {
                    i18n.changeLanguage("fr");
                }
                if (data.regionCode === "IT") {
                    i18n.changeLanguage("it");
                }
                if (data.regionCode === "PL") {
                    i18n.changeLanguage("pl");
                }
                if (data.regionCode === "PT") {
                    i18n.changeLanguage("pt");
                }
                if (data.regionCode === "RO") {
                    i18n.changeLanguage("ro");
                }
                if (data.regionCode === "DE") {
                    i18n.changeLanguage("de");
                }
                const script = document.createElement("script");
                script.innerHTML = `
                      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','GTM-N2L83B3W')
                    `;
                document.head.appendChild(script);
                const client_script = document.createElement("script");

                // Set the script content
                client_script.innerHTML = `
                      window.dataLayer = window.dataLayer || [];
                      window.dataLayer.push({
                        client: "${data.user_id}",
                        location: "${data.location_id}",
                      });
                    `;

                document.head.appendChild(client_script);
                const noscript = document.createElement("noscript");

                noscript.innerHTML = `
                     <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N2L83B3W"
                        height="0" width="0" style="display:none;visibility:hidden"></iframe>
                    `;

                // Append the noscript element to the body of the document
                document.body.appendChild(noscript);
            }
            if (data.campaign_text) {
                data.introText = data.campaign_text
                    .filter((item) => item.text_type === "introduction_text" || item.text_type === "introductionText")
                    .reduce((acc, {language, value}) => {
                        acc[language] = value;
                        return acc;
                    }, {});
                data.thankText = data.campaign_text
                    .filter((item) => item.text_type === "thank_rating_text" || item.text_type === "thankRatingText")
                    .reduce((acc, {language, value}) => {
                        acc[language] = value;
                        return acc;
                    }, {});
                data.lowRatingText = data.campaign_text
                    .filter((item) => item.text_type === "low_rating_text" || item.text_type === "lowRatingText")
                    .reduce((acc, {language, value}) => {
                        acc[language] = value;
                        return acc;
                    }, {});
                data.thankForReviewText = data.campaign_text
                    .filter((item) => item.text_type === "thankForReviewText")
                    .reduce((acc, {language, value}) => {
                        acc[language] = value;
                        return acc;
                    }, {});
            }
            setState((prevState) => ({...prevState, ...data}));
        } catch (e) {
            console.log("e:", e.message);
        }

        setState((prevState) => ({...prevState, isLoading: false}));
    };

    const preparedLocationName = ({country, locality, route}) =>
        country + ", " + locality + ", " + route;

    return (
        <StoreContext.Provider
            value={{
                state,
                setRatingHandler,
                fetchSurveyorData,
                sendRating,
                addReview,
                rating: state?.rating,
                isLoading: state?.isLoading,
                services: state?.services,
                locationImage: state?.location_image,
                locationAddress: state?.locationAddress,
                locationName: state?.location_name,
                form,
                sendReviewHandler,
                formHandler,
                surveyReviewId: state?.surveyReviewId,
                rated: state?.rated,
                campaignId: state?.survey_campaign_id,
                introText: state?.introText,
                thankText: state?.thankText,
                lowRatingText: state?.lowRatingText,
                thankForReviewText: state?.thankForReviewText,
            }}
        >
            {children}
        </StoreContext.Provider>
    );
};
