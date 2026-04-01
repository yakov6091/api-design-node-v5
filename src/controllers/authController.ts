import type { Request, Response } from "express";
import bcrypt from 'bcrypt';
import { db } from '../db/connection.ts';
import { users, type NewUser } from "../db/schema.ts";
import { generateToken } from "../utils/JWT.ts";
import { comparePasswords, hashPassword } from "../utils/passwords.ts";
import { hash } from "crypto";
import { eq } from "drizzle-orm";
import { error } from "console";

export const register = async (
    req: Request<any, any, NewUser>,
    res: Response
) => {
    try {
        // const { email, username, password, firstname, lastname } = req.body;
        const hashedPassword = await hashPassword(req.body.password);

        const [user] = await db.insert(users).values({
            ...req.body,
            password: hashedPassword,
        }).returning({
            id: users.id,
            email: users.email,
            userName: users.username,
            firstName: users.firstname,
            lastName: users.lastname,
            createdAt: users.createdAt
        });

        const token = await generateToken({
            id: user.id,
            email: user.email,
            username: user.userName
        });

        return res.status(201).json({
            message: 'User created',
            user,
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await db.query.users.findFirst({   // or db.quey.select().from(users) retrun an array
            where: eq(users.email, email),
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidatedPassword = await comparePasswords(password, user.password);

        if (!isValidatedPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = await generateToken({
            id: user.id,
            email: user.email,
            username: user.username
        });

        return res.status(201).json({
            message: 'Login success',
            user: {
                id: user.id,
                email: user.email,
                userName: user.username,
                firstName: user.firstname,
                lastName: user.lastname,
                createdAt: user.createdAt
            },
            token,
        });

    } catch (error) {
        console.error('Loging error:', error);
        res.status(500).json({ error: 'Failed to login' })
    }
};
