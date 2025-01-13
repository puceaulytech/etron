class Logger {
    constructor(level = "info") {
        this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
        this.currentLevel = this.levels[level.toLowerCase()] || 2;
        this.colors = {
            error: "\x1b[31m", // Red
            warn: "\x1b[33m", // Yellow
            info: "\x1b[32m", // Green
            debug: "\x1b[34m", // Blue
            reset: "\x1b[0m", // Reset
        };
    }

    log(level, message) {
        if (this.levels[level] <= this.currentLevel) {
            const timestamp = new Date().toISOString();
            const color = this.colors[level] || this.colors.reset;
            console.log(
                `[${timestamp}] ${color}${level.toUpperCase()}${
                    this.colors.reset
                }: ${message}`,
            );
        }
    }

    error(message) {
        this.log("error", message);
    }

    warn(message) {
        this.log("warn", message);
    }

    info(message) {
        this.log("info", message);
    }

    debug(message) {
        this.log("debug", message);
    }
}

module.exports = { Logger };
