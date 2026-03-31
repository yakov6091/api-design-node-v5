import type { NextFunction, Request, Response } from "express";
import env from "../../env.ts";

export class APIError extends Error {
    status: number
    name: string
    message: string
    constructor(message: string, name: string, status: number) {
        super();
        this.message = message;
        this.name = name;
        this.status = status;
    };
};

export const errorHandler = (
    error: APIError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log(error.stack);

    let status = error.status || 500;
    let message = error.message || 'Internal Server Error';

    if (error.name === 'ValidateionError') {
        status = 400;
        message = 'Validation Error';
    };

    if (error.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized';
    };

    return res.status(status).json({
        error: message,
        ...(env.APP_STAGE === 'development' && {
            stack: error.stack,
            details: error.message
        })
    });
};