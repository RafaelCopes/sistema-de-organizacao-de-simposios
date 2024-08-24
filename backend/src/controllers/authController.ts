import { Request, Response } from 'express';
import prisma from '../../prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = 'supersecretkey';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, type: user.type }, SECRET, {
        expiresIn: '1h',
    });

    res.json({ token });
};
