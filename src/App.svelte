<script>
    import 'bootstrap/dist/css/bootstrap.min.css';
    import 'bootstrap/dist/js/bootstrap.min.js';
    import {accessToken} from "./stores.js";
    import router from "page";
    import qs from "qs";
    import Auth from "./pages/Auth.svelte";
    import Callback from "./pages/Callback.svelte";
    import Worklog from "./pages/Worklog.svelte";

    let page;
    let query;

    router("/", () => page = ($accessToken) ? Worklog : location.replace("/auth"));
    router("/auth", () => page = ($accessToken) ? location.replace("/") : Auth);
    router("/auth/callback",
        (ctx, next) => {
            query = qs.parse(ctx.querystring);
            next()
        },
        () => page = Callback);
    router("*", () => location.replace("/"));
    router.start();
</script>

<main>
    <svelte:component this="{page}" query="{query}"/>
</main>