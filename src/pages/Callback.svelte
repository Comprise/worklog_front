<script>
    import {onMount} from "svelte";
    import {accessToken, refreshToken, apiUrl, login} from "../stores.js";
    import {getLogin} from "../utils.js";

    export let query;

    onMount(async () => {
        if (query.code) {
            await callback();
        }
        location.replace("/");
    });

    async function callback() {
        let url = $apiUrl + "/auth/callback?code=" + query.code;
        return await fetch(url)
            .then(async res => {
                let data = await res.json();
                if (res.ok) {
                    login.set(getLogin(data.access));
                    accessToken.set(data.access);
                    refreshToken.set(data.refresh);
                } else {
                    throw new Error(`status: ${res.status}, detail: ${data.detail}`);
                }
            })
            .catch(async err => {
                console.error("Fetch error:", err);
            });
    }
</script>