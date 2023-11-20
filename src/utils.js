import jwtDecode from "jwt-decode";

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
    let dateFrom = new Date(dateToday.setDate(dateToday.getDate() - 7));
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
        return jwtData?.login
    } catch (err) {
        return "unknown"
    }

}