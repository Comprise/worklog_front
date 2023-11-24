import {apiUrl, accessToken, refreshToken, login} from "./stores.js";
import {get} from "svelte/store";
import {getLogin} from "./utils.js";

export async function logout() {
    accessToken.set(null);
    refreshToken.set(null);
    location.replace("/auth");
}

async function originalRequest(path, config) {
    let url = get(apiUrl) + path;
    return await fetch(url, config);
}

async function tokenRefresh() {
    let url = get(apiUrl) + "/auth/refresh"
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"refresh": get(refreshToken)})
    })
        .then(async res => {
            let data = await res.json();
            if (res.ok) {
                accessToken.set(data.access);
                login.set(getLogin(get(accessToken)));
                refreshToken.set(data.refresh);
            } else if (res.status === 400) await logout()
            else {
                throw new Error(data.detail);
            }
        });
}

async function apiFetch(url, config = {}, replay = false) {
    config.headers = Object.assign(config.headers || {}, {
        Authorization: "Bearer " + get(accessToken)
    });
    return await originalRequest(url, config)
        .then(async res => {
            if (res.status === 401) {
                if (replay || !get(refreshToken)) {
                    await logout();
                } else {
                    await tokenRefresh()
                        .catch(async err => {
                            throw new Error(err);
                        });
                    return await apiFetch(url, config, true);
                }
            }
            return res
        })
}

export default apiFetch;