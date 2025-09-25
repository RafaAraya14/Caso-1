// src/logging/logger.ts
// 1. Define the logging interface
interface ILogProvider {
    log(message: string, data?: object): void;
    error(message: string, error: Error, data?: object): void;
}

// 2. Create concrete providers
class ConsoleLogger implements ILogProvider {
    log(message: string, data?: object) {
        console.log(`[INFO] ${message}`, data || '');
    }
    error(message: string, error: Error, data?: object) {
        console.error(`[ERROR] ${message}`, { error: error.message, ...data });
    }
}

// 3. Logger class that uses the strategy
class Logger {
    private provider: ILogProvider;

    constructor(provider: ILogProvider) {
        this.provider = provider;
    }

    setProvider(provider: ILogProvider) {
        this.provider = provider;
    }

    info(message: string, data?: object) {
        this.provider.log(message, data);
    }

    error(message: string, error: Error, data?: object) {
        this.provider.error(message, error, data);
    }
}

// 4. Export one Singleton instance to use throughout the app
export const logger = new Logger(new ConsoleLogger());