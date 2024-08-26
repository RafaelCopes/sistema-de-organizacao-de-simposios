import { Request, Response } from 'express';
import prisma from '../../prismaClient';
import { createSymposiumSchema, updateSymposiumSchema, idSchema } from '../zodSchemas'; // Assuming you've created these schemas

export const getAllSymposiums = async (req: Request, res: Response) => {
    try {
        const symposiums = await prisma.symposium.findMany();
        res.json(symposiums);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving symposiums.' });
    }
};

export const getSymposiumById = async (req: Request, res: Response) => {
    const parsedParams = idSchema.safeParse(req.params);

    if (!parsedParams.success) {
        return res.status(400).json({ message: 'Invalid symposium ID', errors: parsedParams.error.errors });
    }

    const { id } = parsedParams.data;

    try {
        const symposium = await prisma.symposium.findUnique({
            where: { id },
        });

        if (!symposium) {
            return res.status(404).json({ message: 'Symposium not found' });
        }
        res.json(symposium);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving symposium.' });
    }
};

export const createSymposium = async (req: Request, res: Response) => {
    const parsedBody = createSymposiumSchema.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(400).json({ message: 'Invalid symposium data', errors: parsedBody.error.errors });
    }

    const { name, description, startDate, endDate, location } = parsedBody.data;

    try {
        const symposium = await prisma.symposium.create({
            data: { 
                name, 
                description, 
                startDate: new Date(startDate), 
                endDate: new Date(endDate), 
                location, 
                organizerId: req.user.id,
            },
        });
        res.status(201).json(symposium);
    } catch (error) {
        res.status(500).json({ message: 'Error creating symposium.' });
    }
};

export const updateSymposium = async (req: Request, res: Response) => {
    const parsedParams = idSchema.safeParse(req.params);
    const parsedBody = updateSymposiumSchema.safeParse(req.body);

    if (!parsedParams.success) {
        return res.status(400).json({ message: 'Invalid parameters', errors: parsedParams.error.errors });
    }

    if (!parsedBody.success) {
        return res.status(400).json({ message: 'Invalid body data', errors: parsedBody.error.errors });
    }

    const { id } = parsedParams.data;
    const { name, description, startDate, endDate, location } = parsedBody.data;
    const userId = req.user.id;

    try {
        const symposium = await prisma.symposium.findUnique({
            where: { id },
        });

        if (!symposium) {
            return res.status(404).json({ message: 'Symposium not found' });
        }

        if (symposium.organizerId !== userId) {
            return res.status(403).json({ message: 'Access denied. Only the organizer can update this symposium.' });
        }

        const updatedSymposium = await prisma.symposium.update({
            where: { id },
            data: { 
                name, 
                description, 
                startDate: startDate ? new Date(startDate) : undefined, 
                endDate: endDate ? new Date(endDate) : undefined, 
                location 
            },
        });
        res.json(updatedSymposium);
    } catch (error) {
        res.status(500).json({ message: 'Error updating symposium.' });
    }
};

export const deleteSymposium = async (req: Request, res: Response) => {
    const parsedParams = idSchema.safeParse(req.params);

    if (!parsedParams.success) {
        return res.status(400).json({ message: 'Invalid symposium ID', errors: parsedParams.error.errors });
    }

    const { id } = parsedParams.data;
    const userId = req.user.id;

    try {
        const symposium = await prisma.symposium.findUnique({
            where: { id },
        });

        if (!symposium) {
            return res.status(404).json({ message: 'Symposium not found' });
        }

        if (symposium.organizerId !== userId) {
            return res.status(403).json({ message: 'Access denied. Only the organizer can delete this symposium.' });
        }

        await prisma.symposium.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting symposium.' });
    }
};

export const listUserSymposiums = async (req: Request, res: Response) => {
    const userId = req.user.id;  // Assuming userId is available through authentication

    try {
        const symposiums = await prisma.symposium.findMany({
            where: { organizerId: userId },
        });

        if (symposiums.length === 0) {
            return res.status(404).json({ message: 'No symposiums found for this organizer.' });
        }

        res.json(symposiums);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving symposiums for organizer.' });
    }
};
