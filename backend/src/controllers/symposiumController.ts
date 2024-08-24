import { Request, Response } from 'express';
import prisma from '../../prismaClient';

export const getAllSymposiums = async (req: Request, res: Response) => {
    try {
        const symposiums = await prisma.symposium.findMany();
        res.json(symposiums);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving symposiums.' });
    }
};

export const getSymposiumById = async (req: Request, res: Response) => {
    const { id } = req.params;

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
    const { name, description, startDate, endDate, location } = req.body;

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
    const { id } = req.params;
    const { name, description, startDate, endDate, location } = req.body;
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
                startDate: new Date(startDate), 
                endDate: new Date(endDate), 
                location 
            },
        });
        res.json(updatedSymposium);
    } catch (error) {
        res.status(500).json({ message: 'Error updating symposium.' });
    }
};

export const deleteSymposium = async (req: Request, res: Response) => {
    const { id } = req.params;
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
