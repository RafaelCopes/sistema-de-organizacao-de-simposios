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


// Request registration for a symposium
app.post('/symposiums/:id/registration', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Check if the user is already registered for this symposium
        const existingRegistration = await prisma.registration.findFirst({
            where: {
                userId,
                symposiumId: id,
            },
        });

        if (existingRegistration) {
            return res.status(400).json({ message: 'You are already registered for this symposium.' });
        }

        // Create the registration request
        const registration = await prisma.registration.create({
            data: {
                userId,
                symposiumId: id,
                status: 'pending', // Set the registration status to pending
            },
        });

        res.status(201).json({ message: 'Registration request sent successfully.', registration });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting registration for symposium.' });
    }
});



// Request registration for an event
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

        // Check if the user is already registered for this event
        const existingRegistration = await prisma.registration.findFirst({
            where: {
                userId,
                eventId: id,
            },
        });

        if (existingRegistration) {
            return res.status(400).json({ message: 'You are already registered for this event.' });
        }

        // Check if the user is registered for the symposium of the event
        const userRegistration = await prisma.registration.findFirst({
            where: {
                userId: userId,
                symposiumId: event.symposiumId,
                status: 'accepted', // Ensure the user is accepted in the symposium
            },
        });

        if (!userRegistration) {
            return res.status(403).json({ message: 'You must be accepted in the symposium to request registration for this event.' });
        }

        // Create registration request for the event
        const registration = await prisma.registration.create({
            data: {
                userId,
                eventId: id,
                status: 'pending', // Set the registration status to pending
            },
        });

        res.status(201).json({ message: 'Registration request sent successfully.', registration });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting registration for event.' });
    }
});


app.get('/registrations/pending', authMiddleware, checkOrganizer, async (req: Request, res: Response) => {
    const organizerId = req.user.id;

    try {
        // Find all symposiums organized by this organizer
        const symposiums = await prisma.symposium.findMany({
            where: { organizerId },
            include: {
                registrations: {
                    where: { status: 'pending' }, // Only include pending registrations
                    include: { user: true, symposium: true, event: true },
                },
            },
        });

        // Aggregate all pending registrations from these symposiums
        const pendingRegistrations = symposiums.flatMap(s => s.registrations);

        res.json(pendingRegistrations);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving pending registrations.' });
    }
});

// Approve or reject a symposium registration
app.put('/symposiums/:symposiumId/registrations/:registrationId', authMiddleware, checkOrganizer, async (req: Request, res: Response) => {
    const { symposiumId, registrationId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }

    try {
        // Ensure the organizer is approving a registration for their own symposium
        const symposium = await prisma.symposium.findUnique({
            where: { id: symposiumId },
        });

        if (!symposium || symposium.organizerId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. Only the organizer can approve/reject this registration.' });
        }

        // Ensure the registration belongs to the symposium
        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
        });

        if (!registration || registration.symposiumId !== symposiumId) {
            return res.status(404).json({ message: 'Registration not found for this symposium.' });
        }

        // Update the registration status
        const updatedRegistration = await prisma.registration.update({
            where: { id: registrationId },
            data: { status },
        });

        // If the registration is accepted, associate the user with the symposium
        if (status === 'accepted') {
            await prisma.user.update({
                where: { id: updatedRegistration.userId },
                data: {
                    symposiums: {
                        connect: { id: symposiumId },
                    },
                },
            });
        }

        res.json({ message: `Registration ${status} successfully.`, registration: updatedRegistration });
    } catch (error) {
        res.status(500).json({ message: 'Error updating registration status.' });
    }
});



// Approve or reject an event registration
app.put('/events/:eventId/registrations/:registrationId', authMiddleware, checkOrganizer, async (req: Request, res: Response) => {
    const { eventId, registrationId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }

    try {
        // Ensure the organizer is approving a registration for their own event
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { symposium: true },
        });

        if (!event || event.symposium.organizerId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. Only the organizer can approve/reject this registration.' });
        }

        // Ensure the registration belongs to the event
        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
        });

        if (!registration || registration.eventId !== eventId) {
            return res.status(404).json({ message: 'Registration not found for this event.' });
        }

        // Update the registration status
        const updatedRegistration = await prisma.registration.update({
            where: { id: registrationId },
            data: { status },
        });

        // If the registration is accepted, associate the user with the event
        if (status === 'accepted') {
            await prisma.user.update({
                where: { id: updatedRegistration.userId },
                data: {
                    events: {
                        connect: { id: eventId },
                    },
                },
            });
        }

        res.json({ message: `Registration ${status} successfully.`, registration: updatedRegistration });
    } catch (error) {
        res.status(500).json({ message: 'Error updating registration status.' });
    }
});



// List all events for a specific symposium
app.get('/symposiums/:id/events', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Find all events where the symposiumId matches the provided id
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

// List all participants in a symposium
app.get('/symposiums/:id/participants', authMiddleware, checkOrganizer, async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Verify the symposium exists and belongs to the organizer
        const symposium = await prisma.symposium.findUnique({
            where: { id },
            include: {
                registrations: {
                    where: { status: 'accepted' },
                    include: { user: true },
                },
            },
        });

        if (!symposium) {
            return res.status(404).json({ message: 'Symposium not found.' });
        }

        const participants = symposium.registrations.map(registration => registration.user);

        res.json(participants);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving participants for symposium.' });
    }
});

// List all participants in a symposium event
app.get('/events/:id/participants', authMiddleware, checkOrganizer, async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Verify the event exists and belongs to the symposium organized by the user
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                registrations: {
                    where: { status: 'accepted' },
                    include: { user: true },
                },
            },
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const participants = event.registrations.map(registration => registration.user);

        res.json(participants);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving participants for event.' });
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
