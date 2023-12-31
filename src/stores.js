import {readable, writable} from "svelte/store";
import {getLogin, getPeriod} from "./utils.js";

export const apiUrl = readable(import.meta.env.VITE_API_URL);
export const login = writable(getLogin(localStorage.getItem("accessToken")));
export const accessToken = writable(localStorage.getItem("accessToken") ?? null);
export const refreshToken = writable(localStorage.getItem("refreshToken") ?? null);
export const worklogData = writable(null);
export const period = writable(getPeriod(localStorage.getItem("period")));

accessToken.subscribe((value) => {
    if (value) return localStorage.setItem("accessToken", value);
    localStorage.removeItem("accessToken");
});
refreshToken.subscribe((value) => {
    if (value) return localStorage.setItem("refreshToken", value);
    localStorage.removeItem("refreshToken");
});
period.subscribe((value) => {
    if (value) return localStorage.setItem("period", getPeriod(value));
    localStorage.removeItem("period");
});
