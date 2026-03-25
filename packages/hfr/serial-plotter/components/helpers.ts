const msFormatter = (timestamp: number) => {
    if (timestamp < 1000) {
        return `${timestamp} ms`;
    }
    const seconds = Math.round(timestamp / 1000);
    if (seconds < 60) {
        return `${seconds.toString().padStart(2, '0')} s`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
};

const sFormatter = (timestamp: number) => {
    if (timestamp < 60) {
        return `${timestamp.toFixed(2)} s`;
    }
    const minutes = timestamp / 60;
    if (minutes < 60) {
        return `${minutes.toFixed(2)} min`;
    }
    const hours = minutes / 60;
    return `${hours.toFixed(2)} h`;
};

export const Formatters = {
    ms: msFormatter,
    s: sFormatter
};
