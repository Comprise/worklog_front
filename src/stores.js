import {readable, writable} from "svelte/store";
import {getLogin} from "./utils.js";

export const apiUrl = readable(import.meta.env.VITE_API_URL);
export const login = writable(getLogin(localStorage.getItem("accessToken")));
export const accessToken = writable(localStorage.getItem("accessToken") ?? null);
export const refreshToken = writable(localStorage.getItem("refreshToken") ?? null);

accessToken.subscribe((value) => {
    if (value) return localStorage.setItem("accessToken", value);
    localStorage.removeItem("accessToken");
});
refreshToken.subscribe((value) => {
    if (value) return localStorage.setItem("refreshToken", value);
    localStorage.removeItem("refreshToken");
});
