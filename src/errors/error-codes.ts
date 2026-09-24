export const ErrorCode = {
    INVALID_USERNAME: "INVALID_USERNAME",
    USERNAME_TOO_SHORT: "USERNAME_TOO_SHORT",
    USERNAME_TOO_LONG: "USERNAME_TOO_LONG",
    USERNAME_INVALID_CHARACTERS: "USERNAME_INVALID_CHARACTERS",

    INVALID_EMAIL: "INVALID_EMAIL",

    PASSWORD_TOO_SHORT: "PASSWORD_TOO_SHORT",
    PASSWORD_TOO_LONG: "PASSWORD_TOO_LONG",
    PASSWORD_COMPROMISED: "PASSWORD_COMPROMISED",
    PASSWORD_TOO_WEAK: "PASSWORD_TOO_WEAK",

    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",

    USER_NOT_FOUND: "USER_NOT_FOUND",
    EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
    USERNAME_ALREADY_EXISTS: "USERNAME_ALREADY_EXISTS",

    SESSION_EXPIRED: "SESSION_EXPIRED",
    SESSION_NOT_FOUND: "SESSION_NOT_FOUND",

    POST_NOT_FOUND: "POST_NOT_FOUND",
    FILE_REQUIRED: "FILE_REQUIRED",
    UNSUPPORTED_FILE_TYPE: "UNSUPPORTED_FILE_TYPE",
    METADATA_REQUIRED: "METADATA_REQUIRED",
    INVALID_JSON: "INVALID_JSON",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export type HttpStatus = 400 | 401 | 403 | 404 | 409 | 415 | 422 | 500;

export type ErrorConfig = Record<
    ErrorCode,
    { status: HttpStatus; message: string }
>;

export const errorConfig: ErrorConfig = {
    [ErrorCode.INVALID_USERNAME]: {
        status: 400,
        message: "Invalid username",
    },
    [ErrorCode.USERNAME_TOO_SHORT]: {
        status: 400,
        message: "Username is too short",
    },
    [ErrorCode.USERNAME_TOO_LONG]: {
        status: 400,
        message: "Username is too long",
    },
    [ErrorCode.USERNAME_INVALID_CHARACTERS]: {
        status: 400,
        message: "Username contains invalid characters",
    },

    [ErrorCode.INVALID_EMAIL]: {
        status: 400,
        message: "Invalid email",
    },

    [ErrorCode.PASSWORD_TOO_SHORT]: {
        status: 400,
        message: "Password is too short",
    },
    [ErrorCode.PASSWORD_TOO_LONG]: {
        status: 400,
        message: "Password is too long",
    },
    [ErrorCode.PASSWORD_COMPROMISED]: {
        status: 400,
        message: "This password has appeared in a data breach",
    },
    [ErrorCode.PASSWORD_TOO_WEAK]: {
        status: 400,
        message: "This password is too weak",
    },

    [ErrorCode.INVALID_CREDENTIALS]: {
        status: 401,
        message: "Invalid email or password",
    },

    [ErrorCode.UNAUTHORIZED]: {
        status: 401,
        message: "Unauthorized",
    },
    [ErrorCode.FORBIDDEN]: {
        status: 403,
        message: "Forbidden",
    },

    [ErrorCode.USER_NOT_FOUND]: {
        status: 404,
        message: "User not found",
    },
    [ErrorCode.EMAIL_ALREADY_EXISTS]: {
        status: 409,
        message: "Email is already registered",
    },
    [ErrorCode.USERNAME_ALREADY_EXISTS]: {
        status: 409,
        message: "Username is already registered",
    },

    [ErrorCode.SESSION_EXPIRED]: {
        status: 401,
        message: "Session has expired",
    },
    [ErrorCode.SESSION_NOT_FOUND]: {
        status: 401,
        message: "Session not found",
    },

    [ErrorCode.POST_NOT_FOUND]: {
        status: 404,
        message: "Post not found",
    },
    [ErrorCode.FILE_REQUIRED]: {
        status: 400,
        message: "File is required",
    },
    [ErrorCode.UNSUPPORTED_FILE_TYPE]: {
        status: 415,
        message: "Unsupported file type",
    },
    [ErrorCode.METADATA_REQUIRED]: {
        status: 400,
        message: "Metadata must be provided as a text field",
    },
    [ErrorCode.INVALID_JSON]: {
        status: 400,
        message: "Invalid JSON",
    },
};
