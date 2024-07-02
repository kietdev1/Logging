export const addHours = function (date: Date, hour: number) {
    date.setTime(date.getTime() + (hour * 60 * 60 * 1000));
    return date;
}