import { Request, Response } from 'express';
import prisma from '../../prismaClient';
import bcrypt from 'bcrypt';

export const listUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                type: true,
                symposiums: true,
                events: true,
            },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users.' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const { name, email, password, type } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, type },
        });
        res.status(201).json(user);
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({ message: 'This email is already in use.' });
        } else {
            res.status(500).json({ message: 'Error creating user.' });
        }
    }
};
