import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

const app = express();
const prisma = new PrismaClient();
const SECRET = 'supersecretkey';
const PORT = 3000;

app.use(express.json());

// Simple authentication middleware
const authMiddleware = (req: Request, res: Response, next: Function) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Check if it is organizer
const checkOrganizer = (req: Request, res: Response, next: Function) => {
    if (req.user.type !== 'organizer') {
        return res.status(403).json({ message: 'Access denied. Only organizers can perform this action.' });
    }
    next();
};

// Simple error handling
app.use((err: any, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).json({ message: 'An error occurred on the server' });
});

// Login route
app.post('/login', async (req: Request, res: Response) => {
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
});

// List users
app.get('/users', async (req: Request, res: Response) => {
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
});

// Create a user
app.post('/users', async (req: Request, res: Response) => {
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
});

// Get all symposiums
app.get('/symposiums', async (req: Request, res: Response) => {
    const symposiums = await prisma.symposium.findMany();
    res.json(symposiums);
});

// Get a specific symposium
app.get('/symposiums/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const symposium = await prisma.symposium.findUnique({
        where: { id },
    });

    if (!symposium) {
        return res.status(404).json({ message: 'Symposium not found' });
    }
    res.json(symposium);
});

// Create a symposium
app.post('/symposiums', authMiddleware, checkOrganizer, async (req: Request, res: Response) => {
    const { name, description, startDate, endDate, location, organizerId } = req.body;

    try {
        const symposium = await prisma.symposium.create({
            data: { name, description, startDate: new Date(startDate), endDate: new Date(endDate), location, organizerId },
        });
        res.status(201).json(symposium);
    } catch (error) {
        res.status(500).json({ message: 'Error creating symposium.' });
    }
});

// Update a symposium
app.put('/symposiums/:id', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, startDate, endDate, location } = req.body;
    const userId = req.user.id;

    try {
        // Verify the symposium exists and the user is the organizer
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
            data: { name, description, startDate: new Date(startDate), endDate: new Date(endDate), location },
        });
        res.json(updatedSymposium);
    } catch (error) {
        res.status(500).json({ message: 'Error updating symposium.' });
    }
});

// Delete a symposium
app.delete('/symposiums/:id', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Verify the symposium exists and the user is the organizer
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
});

// Create an event
app.post('/events', authMiddleware, checkOrganizer, async (req: Request, res: Response) => {
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
});

// Update an event
app.put('/events/:id', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, date, startTime, endTime, capacity, level } = req.body;
    const userId = req.user.id;

    try {
        // Verify the event exists and the user is the organizer of the symposium
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
});

// Delete an event
app.delete('/events/:id', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Verify the event exists and the user is the organizer of the symposium
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
});


// Register for a symposium
app.post('/symposiums/:id/registration', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const registration = await prisma.registration.create({
            data: {
                userId,
                symposiumId: id,
            },
        });
        res.status(201).json(registration);
    } catch (error) {
        res.status(500).json({ message: 'Error registering for symposium.' });
    }
});

// Register for an event
app.post('/events/:id/registration', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Verify the event exists
        const event = await prisma.event.findUnique({
            where: { id },
            include: { symposium: true }, // Include the related symposium
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if the user is registered for the symposium of the event
        const userRegistration = await prisma.registration.findFirst({
            where: {
                userId: userId,
                symposiumId: event.symposiumId,
            },
        });

        if (!userRegistration) {
            return res.status(403).json({ message: 'You must be registered for the symposium to register for this event.' });
        }

        // Create registration for the event
        const registration = await prisma.registration.create({
            data: {
                userId,
                eventId: id,
            },
        });

        res.status(201).json(registration);
    } catch (error) {
        res.status(500).json({ message: 'Error registering for event.' });
    }
});


// Get symposiums the user is registered for
app.get('/my-symposiums', authMiddleware, async (req: Request, res: Response) => {
    const userId = req.user.id;

    try {
        const registrations = await prisma.registration.findMany({
            where: { userId, symposiumId: { not: null } },
            include: { symposium: true },
        });

        const symposiums = registrations.map(registration => registration.symposium);

        res.json(symposiums);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving registered symposiums.' });
    }
});


// Get events the user is registered for
app.get('/my-events', authMiddleware, async (req: Request, res: Response) => {
    const userId = req.user.id;

    try {
        const registrations = await prisma.registration.findMany({
            where: { userId, eventId: { not: null } },
            include: { event: true },
        });

        const events = registrations.map(registration => registration.event);

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving registered events.' });
    }
});

// Get a specific certificate
app.get('/certificates/:id', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
        where: { id },
    });

    if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json(certificate);
});

// Generate a certificate
app.post('/certificates/:id/generate', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    const certificate = await prisma.certificate.create({
        data: {
            userId,
            symposiumId: id,
            issuanceDate: new Date(),
        },
    });

    res.status(201).json(certificate);
});

// Validate a certificate
app.get('/validate-certificate/:code', async (req: Request, res: Response) => {
    const { code } = req.params;

    const certificate = await prisma.certificate.findUnique({
        where: { code },
    });

    if (!certificate) {
        return res.status(404).json({ message: 'Invalid or not found certificate' });
    }

    res.json(certificate);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});
