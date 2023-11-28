import jwtDecode from "jwt-decode";
import {get} from "svelte/store";
import {period} from "./stores.js";

export function getDeltaCheck(dateFrom, dateTo) {
    if (dateFrom && dateTo) {
        let deltaSecond = new Date(dateTo) - new Date(dateFrom);
        let deltaDay = deltaSecond / 1000 / 60 / 60 / 24;
        return deltaDay > 180 || deltaDay < 0;
    }
}

export function dateToString(date) {
    return date.toLocaleDateString("en-Ca");
}

export function getDateFrom() {
    let dateToday = new Date();
    let dateFrom = new Date(dateToday.setDate(dateToday.getDate() - get(period)));
    return dateToString(dateFrom);
}

export function getDateTo() {
    let dateTo = new Date();
    return dateToString(dateTo);
}

export function getTime(durations) {
    const minutes = Math.floor(durations / 60) % 60;
    const hours = Math.floor(durations / 60 / 60);
    return hours + ":" + minutes.toString().padStart(2, "0");
}

export function getLogin(token) {
    try {
        let jwtData = jwtDecode(token);
        return jwtData.login
    } catch {
        return null
    }
}

export function getPeriod(value) {
    if (isFinite(value)) {
        if (value > 31) {
            return 31;
        } else if (value <= 0) {
            return 7;
        } else {
            return value;
        }
    } else {
        return 7;
    }
}

export function setPeriod(dateFrom, dateTo) {
    if (dateFrom && dateTo) {
        let deltaSecond = new Date(dateTo) - new Date(dateFrom);
        let deltaDay = deltaSecond / 1000 / 60 / 60 / 24;
        period.set(deltaDay);
    }
}