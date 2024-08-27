import { Request, Response } from 'express';
import prisma from '../../prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loginSchema } from '../zodSchemas';

const SECRET = 'supersecretkey';

export const login = async (req: Request, res: Response) => {
    const parsedData = loginSchema.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({ message: 'Invalid data', errors: parsedData.error.errors });
    }

    const { email, password } = parsedData.data;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, type: user.type }, SECRET, {
        expiresIn: '1h',
    });

    const { name: userName, email: userEmail, type: userType } = user;

    res.json({ token, user: { name: userName, email: userEmail, type: userType } });
};
