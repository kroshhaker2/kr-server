import { AppError } from "./app-error.js";
import { errorConfig, type ErrorCode, type ErrorConfig } from "./error-codes.js";

export function createErrorFactory(config: ErrorConfig) {
    return (code: ErrorCode): AppError => {
        const entry = config[code];

        return new AppError(code, entry.status, entry.message);
    };
}

const error = createErrorFactory(errorConfig);

export { error };
