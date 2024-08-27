import { Request, Response } from 'express';
import prisma from '../../prismaClient';
import {
  createEventSchema,
  updateEventSchema,
  idSchema,
} from '../zodSchemas';

export const getAllEventsForSymposium = async (req: Request, res: Response) => {
  const parsedData = idSchema.safeParse(req.params);

  if (!parsedData.success) {
    return res.status(400).json({ message: 'Invalid data', errors: parsedData.error.errors });
  }

  const { id } = parsedData.data;

  try {
    const events = await prisma.event.findMany({
      where: { symposiumId: id },
      include: {
        participants: {
          include: {
            user: true, // Include participant user details if needed
          },
        },
      },
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
  const parsedData = createEventSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({ message: 'Invalid data', errors: parsedData.error.errors });
  }

  const { name, description, date, startTime, endTime, capacity, level, symposiumId } = parsedData.data;

  const userId = req.user.id; // Assuming req.user.id contains the authenticated user's ID

  try {
    // Check if the user is the organizer of the symposium
    const symposium = await prisma.symposium.findUnique({
      where: { id: symposiumId },
    });

    if (!symposium || symposium.organizerId !== userId) {
      return res.status(403).json({ message: 'Access denied. Only the organizer of the symposium can create an event.' });
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        startTime,
        endTime,
        capacity,
        level,
        symposiumId,
        organizerId: userId, // Associate the event with the organizer (redundant since it's already associated through the symposium)
      },
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event.' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const parsedParams = idSchema.safeParse(req.params);
  const parsedData = updateEventSchema.safeParse(req.body);

  if (!parsedParams.success) {
    return res.status(400).json({ message: 'Invalid parameters', errors: parsedParams.error.errors });
  }

  if (!parsedData.success) {
    return res.status(400).json({ message: 'Invalid data', errors: parsedData.error.errors });
  }

  const { id } = parsedParams.data;
  const { name, description, date, startTime, endTime, capacity, level } = parsedData.data;
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
        date: date ? new Date(date) : undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
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
  const parsedData = idSchema.safeParse(req.params);

  if (!parsedData.success) {
    return res.status(400).json({ message: 'Invalid data', errors: parsedData.error.errors });
  }

  const { id } = parsedData.data;
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


export const getEventById = async (req: Request, res: Response) => {
  const parsedData = idSchema.safeParse(req.params);

  if (!parsedData.success) {
    return res.status(400).json({ message: 'Invalid data', errors: parsedData.error.errors });
  }

  const { id } = parsedData.data;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        symposium: true, // Include related symposium details if needed
        registrations: true, // Include related registrations if needed
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error retrieving event:', error);
    res.status(500).json({ message: 'Error retrieving event.' });
  }
};