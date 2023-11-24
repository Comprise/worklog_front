import {Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {getTime} from "./utils.js";
import apiFetch from "./apiFetch.js";
import {worklogData} from "./stores.js";
import {get} from "svelte/store";


Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

let weekendsPluginConfig = {
    beforeDatasetsDraw: (chart) => {
        const {ctx, chartArea: {top, height}, scales: {x}} = chart;
        ctx.fillStyle = "rgba(255,122,127,0.4)";
        if (x._gridLineItems.length === chart.data.worklogData.weekends.length + 1) {
            chart.data.worklogData.weekends.filter((item, index) => {
                if (item > 0) {
                    const newWidth = x._gridLineItems[index + 1].x1 - x._gridLineItems[index].x1;
                    ctx.fillRect(x._gridLineItems[index].x1, top, newWidth, height);
                }
            })
        }
    }
}

let redLinePluginConfig = {
    beforeDraw: (chart) => {
        const {ctx, chartArea: {top, right, left}, scales: {y}} = chart;
        ctx.save();
        ctx.strokeStyle = "red";
        const ticksIndex = y.ticks.findIndex(item => item.value === 28800);
        const newTop = y.getPixelForTick(ticksIndex);
        if (newTop > top) {
            ctx.strokeRect(left, y.getPixelForTick(ticksIndex), right, 0);
            ctx.restore();
        }
    }
}

let eventCatcher = {
    beforeEvent(chart, args, pluginOptions) {
        const event = args.event;
        if (event.type === "click") {
            const points = chart.getElementsAtEventForMode(event, "nearest", {intersect: true}, true);
            if (points.length) {
                const firstPoint = points[0];
                const itemData = chart.data.worklogData.datasets[firstPoint.datasetIndex][firstPoint.index];

                worklogData.set({
                    "worklog": itemData.worklog,
                    "issue": itemData.issue,
                    "datasetIndex": firstPoint.datasetIndex,
                    "index": firstPoint.index,
                });
            }
        }
    }
}

let tooltipCallbacksOptionsPlugin = {
    label: function (context) {
        let itemData = context.chart.data.worklogData.datasets[context.datasetIndex][context.dataIndex];
        let datasetArray = Array.from(context.chart.data.datasets, (dataset) => dataset.data[context.dataIndex]);
        let TotalDuration = datasetArray.reduce((a, b) => (b || 0) + (a || 0));
        let TotalDurationTime = getTime(TotalDuration);
        let durationTime = getTime(itemData.duration);
        return [
            `ID: ${itemData.worklog}`,
            itemData.key,
            itemData.title,
            `Длительность: ${durationTime}`,
            `Всего за день: ${TotalDurationTime}`];
    }
}


let datalabelsOptionsPlugin = {
    formatter: function (value, context) {
        let itemData = context.chart.data.worklogData.datasets[context.datasetIndex][context.dataIndex];
        let meta = context.chart.getDatasetMeta(context.datasetIndex).data[context.dataIndex];
        let durationTime = getTime(value);
        return meta?.width > 60 ? [itemData?.key, durationTime] : durationTime;
    },
    display: function (context) {
        const meta = context.chart.getDatasetMeta(context.datasetIndex).data[context.dataIndex];
        return context.dataset.data[context.dataIndex] > 0 && meta?.width > 30;
    },
    textAlign: "center",
}

let pluginsOptions = {
    legend: {
        display: false
    },
    tooltip: {
        callbacks: tooltipCallbacksOptionsPlugin
    },
    datalabels: datalabelsOptionsPlugin
}

let scalesOptions = {
    x: {
        stacked: true
    },
    y: {
        stacked: true,
        ticks: {
            stepSize: 3600,
            callback: function (value) {
                return value / 3600 + ":00";
            },
        }
    }
}

let options = {
    maintainAspectRatio: false,
    borderColor: "white",
    borderWidth: 0.5,
    borderRadius: {
        topLeft: 6,
        topRight: 6,
        bottomLeft: 6,
        bottomRight: 6,
    },
    borderSkipped: false,
    plugins: pluginsOptions,
    scales: scalesOptions
}

let pluginsConfig = [
    weekendsPluginConfig,
    redLinePluginConfig,
    eventCatcher,
    ChartDataLabels
]

export async function getWorklogData(dateFrom, dateTo) {
    let url = `/worklog?date_from=${dateFrom}&date_to=${dateTo}`;
    return await apiFetch(url, {})
        .then(async res => {
            let data = await res.json();
            if (res.ok) {
                return data
            } else {
                throw new Error(data.detail);
            }
        })
}

export async function delWorklog() {
    let url = "/worklog";
    let config = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "worklog": get(worklogData).worklog,
            "issue": get(worklogData).issue
        })
    }
    return await apiFetch(url, config)
        .then(async res => {
            if (res.ok) {
                return true
            } else {
                let data = await res.json();
                throw new Error(data.detail);
            }
        })
}

export function getChartData(worklogData) {
    return {
        labels: worklogData.labels,
        datasets: Array.from(worklogData.datasets, (arr) => ({
            data: arr.map(row => row?.duration),
            backgroundColor: arr.map(row => row?.background_colors),
        })),
        worklogData: worklogData
    };
}

function getConfig(data) {
    return {
        type: "bar",
        plugins: pluginsConfig,
        options: options,
        data: data
    }
}

export function getChart(ctx, data) {
    let config = getConfig(data);
    return new Chart(ctx, config)
}