<script>
    import {onMount} from "svelte";
    import {scale} from "svelte/transition";
    import {logout} from "../apiFetch.js";
    import {getDateFrom, getDateTo, getDeltaCheck, getTime, setPeriod} from "../utils.js";
    import {getWorklogData, delWorklog, getChartData, getChart} from "../chart.js";
    import {login, worklogData, period} from "../stores.js";

    let dateFrom;
    let dateTo;
    let worklog;
    let chart;
    let totalDuration;
    let error;
    let buildStatus;

    $: deltaCheck = getDeltaCheck(dateFrom, dateTo);

    async function start() {
        dateFrom = getDateFrom();
        dateTo = getDateTo();
        await build();
    }

    async function reset() {
        $period = 7;
        await start();
    }

    async function deleteWorklog() {
        try {
            await delWorklog();
            delete chart.data.datasets[$worklogData.datasetIndex].data[$worklogData.index];
            delete chart.data.datasets[$worklogData.datasetIndex].backgroundColor[$worklogData.index];
            chart.update();
            worklogData.set(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function build() {
        error = null;
        buildStatus = false;
        try {
            setPeriod(dateFrom, dateTo);
            let worklogData = await getWorklogData(dateFrom, dateTo);
            totalDuration = worklogData.total_duration ? getTime(worklogData.total_duration) : 0;
            let chartData = getChartData(worklogData);
            if (!chart) {
                let ctx = worklog.getContext("2d");
                chart = getChart(ctx, chartData);
            } else {
                chart.data = chartData;
                chart.update();
            }
        } catch (err) {
            console.error(err);
            error = err;
        }
        buildStatus = true
    }

    onMount(async () => {
        await start();
    });

</script>

<nav class="navbar navbar-dark navbar-expand-lg bg-dark" data-bs-theme="dark">
    <div class="container-fluid">
        <div class="dropdown">
            <button id="userMenu" class="btn btn-warning " data-bs-toggle="dropdown"
                    style="display: {$login ? 'block' : 'none'}">
                {$login}
            </button>
            <ul class="dropdown-menu">
                <li>
                    <button class="dropdown-item" on:click={logout}>Выйти</button>
                </li>
            </ul>
        </div>
        <button class="navbar-toggler" data-bs-toggle="collapse"
                data-bs-target="#navbarToggler">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarToggler">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0"/>
            <button class="btn btn-primary me-lg-2 mb-2 mb-lg-0" on:click={reset}>Сбросить</button>
            <div class="d-lg-flex">
                <input class="form-control me-lg-2 mb-2 mb-lg-0" type="date" bind:value={dateFrom}/>
                <input class="form-control me-lg-2 mb-2 mb-lg-0" type="date" bind:value={dateTo}/>
            </div>
            <button class="btn btn-danger" disabled={deltaCheck || !buildStatus}
                    on:click={build}>
                {#if !buildStatus}
                    <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                    <span role="status">Загрузка...</span>
                {:else }
                    Построить
                {/if}
            </button>
        </div>
    </div>
</nav>

<div class="ps-2 d-flex justify-content-center align-items-center chart">
    {#if !buildStatus}
        <div class="loader spinner-border text-danger position-absolute" role="status" transition:scale></div>
    {/if}
    {#if error}
        <p style="position: absolute;">{error}</p>
    {/if}
    <canvas style:filter="{!buildStatus || error ? 'blur(5px)' : null}" bind:this={worklog}></canvas>
</div>

<footer class="bg-dark d-flex align-items-center">
    <div class="container-fluid d-flex justify-content-between align-items-center">
        {#if totalDuration}
            <span class="text-light">Всего за период: {totalDuration}</span>
        {/if}
        <div>
            <button id="worklogMenu" class="btn btn-light" data-bs-toggle="dropdown"
                    style="display: {$worklogData ? 'block' : 'none'}">
                ID: {$worklogData?.worklog}
            </button>
            <ul id="worklogDropMenu" class="dropdown-menu dropdown-menu-end">
                <li>
                    <button id="delete" class="dropdown-item" on:click={deleteWorklog}>Удалить</button>
                </li>
            </ul>
        </div>
    </div>
</footer>

<style>
    .loader {
        width: 56px;
        height: 56px;
    }

    .chart {
        height: calc(100vh - 108px);
    }

    footer {
        height: 54px;
    }

    @media (max-width: 992px) {
        #navbarToggler > button {
            width: 100%;
        }

        .chart {
            height: calc(100vh - 109.6px);
        }
    }
</style>