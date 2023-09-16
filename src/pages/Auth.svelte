<script>
    import {apiUrl} from "../stores.js";

    async function auth() {
        return await fetch($apiUrl + "/auth")
            .then(async res => {
                let data = await res.json();
                if (res.ok) {
                    location.replace(data.auth_url);
                } else {
                    throw new Error(`status: ${res.status}, detail: ${data.detail}`);
                }
            })
            .catch(async err => {
                console.error("Fetch error:", err);
            })
    }
</script>

<div class="container-fluid d-flex justify-content-center position-fixed h-100">
    <div class="m-auto text-center">
        <h1>Yandex Tracker Worklog</h1>
        <figure>
            <blockquote class="blockquote">
                Если ты не решишься на это сегодня – завтра будет таким же, как и вчера.
            </blockquote>
            <figcaption class="blockquote-footer">
                <cite>Генри Форд</cite>
            </figcaption>
        </figure>
        <button class="btn btn-danger" on:click={auth}>Войти</button>
    </div>
</div>