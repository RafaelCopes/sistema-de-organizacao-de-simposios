import { Request, Response } from 'express';
import prisma from '../../prismaClient';

export const getAllEventsForSymposium = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const events = await prisma.event.findMany({
            where: { symposiumId: id },
        });

        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for this symposium.' });
        }

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving events for symposium.' });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    const { name, description, date, startTime, endTime, capacity, level, symposiumId } = req.body;

    try {
        const event = await prisma.event.create({
            data: {
                name,
                description,
                date: new Date(date),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                capacity,
                level,
                symposiumId,
            },
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event.' });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, date, startTime, endTime, capacity, level } = req.body;
    const userId = req.user.id;

    try {
        const event = await prisma.event.findUnique({
            where: { id },
            include: { symposium: true },
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.symposium.organizerId !== userId) {
            return res.status(403).json({ message: 'Access denied. Only the organizer of the symposium can update this event.' });
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                name,
                description,
                date: new Date(date),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                capacity,
                level,
            },
        });
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error updating event.' });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const event = await prisma.event.findUnique({
            where: { id },
            include: { symposium: true },
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.symposium.organizerId !== userId) {
            return res.status(403).json({ message: 'Access denied. Only the organizer of the symposium can delete this event.' });
        }

        await prisma.event.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event.' });
    }
};
