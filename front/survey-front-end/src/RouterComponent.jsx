import React from "react";
import { Route, Routes } from "react-router";
import Questioner from "./components/Questioner.jsx";
import ThankYou from "./components/ThankYou.jsx";
import ChoosePlatformForReview from "./components/ChoosePlatformForReview.jsx";
import FeedbackForm from "./components/FeedbackForm.jsx";

const RouterComponent = () => {
    return (
        <Routes>
            <Route path="/:sharedCode" element={<Questioner />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route
                path="/choose-platform"
                element={<ChoosePlatformForReview />}
            />
            <Route path="/feedback-form" element={<FeedbackForm />} />
        </Routes>
    );
};

export default RouterComponent;
