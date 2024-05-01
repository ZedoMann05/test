import axios from "axios";
import mock from "./mock-response.js";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL + "api/v1/";

export async function getSurveyorData(sharedCode) {
    try {
        const response = await axios.get(`campaign/${sharedCode}`);
        return response.data;
    } catch (error) {
        console.error("Error making GET request:", error);
        throw error;
    }
    // return mock;
}

export async function sendRatingData(payload) {
    try {
        const response = await axios.post("review/create", payload);
        return response.data;
    } catch (error) {
        console.error("Error making POST request:", error);
        throw error;
    }
}

export async function sendReview(payload) {
    try {
        const response = await axios.post("review/update", payload);
        return response.data;
    } catch (error) {
        console.error("Error making POST request:", error);
        throw error;
    }
}

export async function getIp() {
    try {
        const response = await axios.get("https://api.ipify.org?format=json");
        return response.data;
    } catch (error) {
        console.error("Error making getIp request:", error);
        throw error;
    }
}

export async function getCountry(ip) {
    try {
        const response = await axios.post("country/by-ip", { ip });
        return response.data;
    } catch (error) {
        console.error("Error making getCountry request:", error);
        throw error;
    }
}
