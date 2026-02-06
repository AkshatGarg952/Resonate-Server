/**
 * Simple structured logger for Resonate Server.
 * Replaces console.log with consistent formatting.
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

/**
 * Format timestamp for logs.
 */
function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Format log message with level and timestamp.
 */
function formatMessage(level, context, message) {
    return `${getTimestamp()} | ${level.padEnd(5)} | ${context} | ${message}`;
}

/**
 * Logger object with level-specific methods.
 */
const logger = {
    /**
     * Debug level - for development only.
     */
    debug(context, message, data = null) {
        if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
            console.log(formatMessage('DEBUG', context, message));
            if (data) console.log(data);
        }
    },

    /**
     * Info level - general information.
     */
    info(context, message, data = null) {
        if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
            console.log(formatMessage('INFO', context, message));
            if (data) console.log(data);
        }
    },

    /**
     * Warn level - something unexpected but not critical.
     */
    warn(context, message, data = null) {
        if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
            console.warn(formatMessage('WARN', context, message));
            if (data) console.warn(data);
        }
    },

    /**
     * Error level - something went wrong.
     */
    error(context, message, error = null) {
        if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
            console.error(formatMessage('ERROR', context, message));
            if (error) {
                if (error instanceof Error) {
                    console.error(`  → ${error.name}: ${error.message}`);
                    if (error.stack && process.env.NODE_ENV !== 'production') {
                        console.error(error.stack);
                    }
                } else {
                    console.error(error);
                }
            }
        }
    },

    /**
     * Log HTTP request details.
     */
    request(method, path, userId = 'anonymous') {
        this.info('HTTP', `${method} ${path} [user: ${userId}]`);
    },

    /**
     * Log response with duration.
     */
    response(method, path, status, durationMs) {
        const level = status >= 400 ? 'warn' : 'info';
        this[level]('HTTP', `${method} ${path} → ${status} (${durationMs}ms)`);
    },

    /**
     * Log database operation.
     */
    db(operation, collection, message = '') {
        this.debug('DB', `${operation} ${collection} ${message}`.trim());
    },

    /**
     * Log external API call.
     */
    external(service, operation, message = '') {
        this.info('API', `${service}: ${operation} ${message}`.trim());
    },
};

export default logger;
